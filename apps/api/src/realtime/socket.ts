import type { Server as HttpServer } from "node:http";
import { Server as SocketServer, type Socket } from "socket.io";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { prisma } from "../config/prisma";
import { verifyAccessToken } from "../lib/jwt";

interface AuthedSocket extends Socket {
  userId?: string;
  role?: string;
}

// Track which sockets a user has open. Online status = at least one socket.
const presence = new Map<string, Set<string>>();
const isOnline = (userId: string) => (presence.get(userId)?.size ?? 0) > 0;

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      socket.role = payload.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.userId!;
    const set = presence.get(userId) ?? new Set();
    set.add(socket.id);
    presence.set(userId, set);
    socket.join(`u:${userId}`);
    io.emit("presence", { userId, online: true });

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`c:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`c:${conversationId}`);
    });

    socket.on("typing", ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      socket.to(`c:${conversationId}`).emit("typing", { userId, isTyping });
    });

    socket.on(
      "message:send",
      async (
        payload: { conversationId: string; body: string; attachmentUrl?: string },
        ack?: (resp: { ok: boolean; messageId?: string; error?: string }) => void,
      ) => {
        try {
          const conv = await prisma.conversation.findUnique({
            where: { id: payload.conversationId },
          });
          if (!conv) throw new Error("not_found");
          if (conv.customerId !== userId && conv.sellerId !== userId) {
            throw new Error("forbidden");
          }

          const message = await prisma.message.create({
            data: {
              conversationId: conv.id,
              senderId: userId,
              body: payload.body.slice(0, 4000),
              attachmentUrl: payload.attachmentUrl ?? null,
            },
          });
          await prisma.conversation.update({
            where: { id: conv.id },
            data: { lastMessageAt: new Date() },
          });

          io.to(`c:${conv.id}`).emit("message:new", message);
          // Notify the other participant even if they haven't joined the room.
          const otherId = conv.customerId === userId ? conv.sellerId : conv.customerId;
          io.to(`u:${otherId}`).emit("notification", {
            type: "MESSAGE",
            conversationId: conv.id,
            preview: payload.body.slice(0, 80),
          });

          ack?.({ ok: true, messageId: message.id });
        } catch (err) {
          logger.warn({ err }, "socket message:send failed");
          ack?.({ ok: false, error: (err as Error).message });
        }
      },
    );

    socket.on("presence:check", (otherUserId: string, ack?: (online: boolean) => void) => {
      ack?.(isOnline(otherUserId));
    });

    socket.on("disconnect", () => {
      const s = presence.get(userId);
      if (s) {
        s.delete(socket.id);
        if (s.size === 0) {
          presence.delete(userId);
          io.emit("presence", { userId, online: false });
        }
      }
    });
  });

  return io;
};

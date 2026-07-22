"use client";

import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";

let socket: Socket | null = null;

export const getSocket = () => {
  const token = useAuthStore.getState().accessToken;
  const url = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

  if (!socket) {
    socket = io(url, {
      autoConnect: false,
      withCredentials: true,
      auth: { token },
    });
  }
  // Refresh token on each access — relevant after refresh rotation.
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

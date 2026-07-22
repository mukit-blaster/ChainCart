import type { User } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { redis } from "../../config/redis";
import { Conflict, Unauthorized } from "../../lib/errors";
import { hashPassword, randomId, sha256, verifyPassword } from "../../lib/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt";

const REFRESH_TTL_DAYS = 30;

const refreshExpiry = () => new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

const toPublicUser = (u: User) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  walletAddress: u.walletAddress,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt.toISOString(),
});

const issueTokens = async (
  user: User,
  meta: { userAgent?: string; ip?: string },
) => {
  const jti = randomId(16);
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      jti,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt: refreshExpiry(),
    },
  });

  return { accessToken, refreshToken };
};

export const register = async (
  input: { email: string; password: string; name?: string; role: "CUSTOMER" | "SELLER" },
  meta: { userAgent?: string; ip?: string },
) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Conflict("Email already registered");

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
      passwordHash,
      role: input.role,
      sellerProfile:
        input.role === "SELLER"
          ? {
              create: {
                displayName: input.name ?? input.email.split("@")[0],
                status: "PENDING",
              },
            }
          : undefined,
    },
  });

  const tokens = await issueTokens(user, meta);
  return { user: toPublicUser(user), tokens };
};

export const login = async (
  input: { email: string; password: string },
  meta: { userAgent?: string; ip?: string },
) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash) throw Unauthorized("Invalid credentials");
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw Unauthorized("Invalid credentials");

  const tokens = await issueTokens(user, meta);
  return { user: toPublicUser(user), tokens };
};

// Rotate the refresh token: validate JWT signature + DB row, revoke the old
// row, issue a fresh pair. Reuse of an already-revoked token should kill the
// whole user session as a theft signal.
export const refresh = async (
  rawRefresh: string,
  meta: { userAgent?: string; ip?: string },
) => {
  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(rawRefresh);
  } catch {
    throw Unauthorized("Invalid refresh token");
  }

  const tokenHash = sha256(rawRefresh);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored) {
    // Maybe a reused-after-rotation token. Revoke any sibling sessions for safety.
    await prisma.refreshToken.updateMany({
      where: { userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw Unauthorized("Refresh token reuse detected");
  }
  if (stored.revokedAt) throw Unauthorized("Refresh token revoked");
  if (stored.expiresAt < new Date()) throw Unauthorized("Refresh token expired");

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) throw Unauthorized("User no longer exists");

  const newJti = randomId(16);
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  const newRefresh = signRefreshToken({ sub: user.id, jti: newJti });

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: newJti },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(newRefresh),
        jti: newJti,
        userAgent: meta.userAgent ?? null,
        ip: meta.ip ?? null,
        expiresAt: refreshExpiry(),
      },
    }),
  ]);

  return {
    user: toPublicUser(user),
    tokens: { accessToken, refreshToken: newRefresh },
  };
};

export const logout = async (rawRefresh?: string) => {
  if (!rawRefresh) return;
  const tokenHash = sha256(rawRefresh);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// Wallet login: produce a one-time nonce that the client signs with their
// wallet. We verify the signature recovers the claimed address. Nonces live
// in Redis (or in-memory) for ~5min and are single-use.
const nonceStore = new Map<string, { nonce: string; expires: number }>();

export const issueWalletNonce = async (address: string) => {
  const nonce = `Sign in to ChainCart\n\nNonce: ${randomId(8)}`;
  if (redis) {
    await redis.set(`wn:${address.toLowerCase()}`, nonce, "EX", 300);
  } else {
    nonceStore.set(address.toLowerCase(), {
      nonce,
      expires: Date.now() + 5 * 60 * 1000,
    });
  }
  return { nonce };
};

const consumeNonce = async (address: string) => {
  const key = address.toLowerCase();
  if (redis) {
    const v = await redis.get(`wn:${key}`);
    if (v) await redis.del(`wn:${key}`);
    return v;
  }
  const v = nonceStore.get(key);
  if (!v) return null;
  nonceStore.delete(key);
  if (v.expires < Date.now()) return null;
  return v.nonce;
};

export const walletLogin = async (
  input: { address: string; signature: string; nonce: string },
  meta: { userAgent?: string; ip?: string },
) => {
  const expected = await consumeNonce(input.address);
  if (!expected || expected !== input.nonce) {
    throw Unauthorized("Invalid or expired nonce");
  }

  // ethers v6 verifyMessage recovers the signing address.
  const { ethers } = await import("ethers");
  const recovered = ethers.verifyMessage(input.nonce, input.signature);
  if (recovered.toLowerCase() !== input.address.toLowerCase()) {
    throw Unauthorized("Signature does not match address");
  }

  const address = input.address.toLowerCase();
  const user = await prisma.user.upsert({
    where: { walletAddress: address },
    create: {
      walletAddress: address,
      email: `${address}@wallet.chaincart.local`,
      name: `Wallet ${address.slice(0, 6)}…${address.slice(-4)}`,
      role: "CUSTOMER",
    },
    update: {},
  });

  const tokens = await issueTokens(user, meta);
  return { user: toPublicUser(user), tokens };
};

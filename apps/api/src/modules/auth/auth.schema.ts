import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const walletNonceSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const walletLoginSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(1),
  nonce: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

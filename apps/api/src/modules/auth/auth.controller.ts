import type { Request, Response } from "express";
import { isProd } from "../../config/env";
import * as svc from "./auth.service";

const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  path: "/",
};

const setRefreshCookie = (res: Response, token: string) =>
  res.cookie("refreshToken", token, {
    ...cookieOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

const meta = (req: Request) => ({
  userAgent: req.headers["user-agent"],
  ip: req.ip,
});

export const register = async (req: Request, res: Response) => {
  const result = await svc.register(req.body, meta(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const result = await svc.login(req.body, meta(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  res.json(result);
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  const result = await svc.refresh(token, meta(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  res.json(result);
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  await svc.logout(token);
  res.clearCookie("refreshToken", cookieOpts);
  res.status(204).end();
};

export const me = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

export const walletNonce = async (req: Request, res: Response) => {
  res.json(await svc.issueWalletNonce(req.body.address));
};

export const walletLogin = async (req: Request, res: Response) => {
  const result = await svc.walletLogin(req.body, meta(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  res.json(result);
};

export const forgotPassword = async (_req: Request, res: Response) => {
  // Placeholder: in production, mint a single-use token, store its hash, and
  // dispatch an email via a transactional provider (Resend/Postmark). For
  // dev parity we return a 202 so the UI can show the same success state.
  res.status(202).json({ ok: true });
};

export const resetPassword = async (_req: Request, res: Response) => {
  // Placeholder pair to forgotPassword.
  res.status(202).json({ ok: true });
};

import type { NextFunction, Request, Response } from "express";
import { Forbidden, Unauthorized } from "../lib/errors";
import { verifyAccessToken, type AccessTokenPayload } from "../lib/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next(Unauthorized("Missing access token"));
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(Unauthorized("Invalid or expired access token"));
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Don't bounce — caller wanted optional auth.
  }
  next();
};

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Unauthorized());
    if (!roles.includes(req.user.role)) return next(Forbidden());
    next();
  };

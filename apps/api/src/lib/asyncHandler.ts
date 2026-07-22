import type { NextFunction, Request, Response } from "express";

// Wraps an async route handler so thrown errors propagate to error middleware.
// Without this, an awaited rejection becomes an unhandled promise.
export const asyncHandler =
  <T = unknown>(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

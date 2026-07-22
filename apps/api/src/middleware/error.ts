import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../config/logger";
import { HttpError } from "../lib/errors";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
};

// Single error pipeline. Translate library-specific errors (Prisma, Zod) into
// our HttpError shape so clients always see {error: {code, message, details?}}.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Unique constraint violated",
          details: err.meta,
        },
      });
    }
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "Record not found" } });
    }
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
};

import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { BadRequest } from "./errors";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        BadRequest("Validation failed", result.error.flatten().fieldErrors),
      );
    }
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis";

const buildStore = (prefix: string) =>
  redis
    ? new RedisStore({
        // The signature shifted between versions; cast keeps us compatible.
        sendCommand: (...args: string[]) =>
          (redis as unknown as { call: (...a: string[]) => Promise<unknown> }).call(...args),
        prefix: `rl:${prefix}:`,
      } as unknown as ConstructorParameters<typeof RedisStore>[0])
    : undefined;

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: buildStore("api"),
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many auth attempts" } },
  store: buildStore("auth"),
});

import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

// Optional. Rate limiting and chat presence work without Redis (in-memory
// fallback), but you'll want it in production for multi-instance deploys.
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 })
  : null;

if (redis) {
  redis.on("error", (err) => logger.warn({ err }, "redis error"));
  redis.connect().catch((err) => logger.warn({ err }, "redis connect failed"));
}

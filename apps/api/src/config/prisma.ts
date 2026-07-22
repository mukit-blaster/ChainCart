import { PrismaClient } from "@prisma/client";
import { isProd } from "./env";

// Single Prisma instance per process. tsx watch reloads can multiply clients
// if we don't memoize on globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ["warn", "error"] : ["warn", "error"],
  });

if (!isProd) globalForPrisma.prisma = prisma;

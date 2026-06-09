import "server-only";
import { PrismaClient } from "@prisma/client";

// Node-runtime singleton (avoids exhausting connections on dev hot-reload).
// Never import this from edge code (proxy.ts) — it only checks cookie presence.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

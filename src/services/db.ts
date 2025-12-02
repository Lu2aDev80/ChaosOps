import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaLogLevels(): Prisma.LogLevel[] {
  // Keep console clean by default; allow override via env
  const env =
    (typeof process !== "undefined" ? process.env.PRISMA_LOG : undefined) ||
    "quiet";
  if (env === "debug") return ["query", "error", "warn"];
  if (env === "warn") return ["error", "warn"];
  return ["error"];
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getPrismaLogLevels(),
  });

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

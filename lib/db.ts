import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Official Neon + Prisma 7 pattern:
// PrismaNeon handles the connection pool internally — no need for a separate Pool
// or @neondatabase/serverless import here. The adapter-neon package bundles everything.
// See: https://neon.tech/docs/guides/prisma

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[AgentMeter] DATABASE_URL not set — DB calls will fail and fall back to demo state.");
  }

  const adapter = new PrismaNeon({ connectionString: connectionString! });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Neon's serverless driver needs a WebSocket constructor in Node.js environments.
// Node.js 21+ has native globalThis.WebSocket; older Node (and some serverless runtimes) need 'ws'.
// @prisma/adapter-neon bundles @neondatabase/serverless internally, so we just need to
// ensure the WebSocket polyfill is registered globally if it's missing.
if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neonConfig } = require("@neondatabase/serverless");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[AgentMeter] DATABASE_URL not set — DB calls will fail and fall back to demo state.");
  }

  const isNeon = connectionString?.includes("neon.tech");

  if (isNeon) {
    const adapter = new PrismaNeon({ connectionString: connectionString! });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } else {
    // Local Postgres over TCP
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

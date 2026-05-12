import { defineConfig } from "prisma/config";

// Prisma 7: connection URL lives here, not in schema.prisma.
// For the hackathon demo, the app uses in-memory store (lib/demo-data.ts).
// DATABASE_URL is only needed for production Postgres & migrations.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/agentmeter",
  },
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to keep these packages as server-side external (not bundled).
  // Required for Prisma + @neondatabase/serverless to work correctly on Vercel.
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless", "ws"],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
};

export default nextConfig;

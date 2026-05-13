import { prisma } from "../lib/db";

async function reset() {
  console.log("🚀 Starting Production Database Reset...");

  try {
    // 1. Delete all dynamic transaction data
    console.log("🗑 Clearing transaction logs and activity...");
    const dynamicTables = [
      "demoRun",
      "creditLedgerEntry",
      "dodoWebhookEvent",
      "dodoCheckout",
      "x402Payment",
      "gatewayRequest",
      "licenseKey"
    ];

    for (const table of dynamicTables) {
      try {
        await (prisma as any)[table].deleteMany({});
        console.log(`   ✅ Cleared ${table}`);
      } catch (e) {
        console.log(`   ⚠️ Skipped ${table} (table may not exist yet)`);
      }
    }

    // 2. Reset Buyer balances to 25,000
    console.log("⚖️ Resetting buyer balances...");
    await prisma.buyer.updateMany({
      data: {
        creditBalance: 25000
      }
    });

    // 3. Delete specific unwanted endpoints
    console.log("🛠 Cleaning up specific endpoints...");
    await prisma.endpoint.deleteMany({
      where: {
        OR: [
          { name: "Demo Price Feed" },
          { slug: "price-feed" }
        ]
      }
    });

    // 4. Reset remaining endpoint metrics
    await prisma.endpoint.updateMany({
      data: {
        requestCount: 0,
        revenueUsd: 0
      }
    });

    console.log("✅ Database reset complete. Core Merchant and Endpoints preserved.");
  } catch (error) {
    console.error("❌ Reset failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();

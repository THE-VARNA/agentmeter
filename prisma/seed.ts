import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.upsert({
    where: { slug: "agentmeter-demo" },
    update: {},
    create: {
      id: "mer_demo",
      name: "AgentMeter Demo",
      slug: "agentmeter-demo",
      dodoBusinessId: "biz_demo_agentmeter",
      solanaWallet:
        process.env.SOLANA_MERCHANT_WALLET ??
        "9xQeWvG816bUx9EPf1aJKpbVw5L6v1F7GKJYhCqK6R3",
      x402Network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      facilitatorUrl:
        process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator"
    }
  });

  const buyer = await prisma.buyer.upsert({
    where: { id: "buy_demo" },
    update: {},
    create: {
      id: "buy_demo",
      merchantId: merchant.id,
      email: "agent@buyer.example",
      name: "Autonomous Research Agent",
      agentWallet: "Fh3DemoAgent111111111111111111111111111111111",
      dodoCustomerId: "cus_demo_agent",
      creditBalance: "25000"
    }
  });

  await prisma.endpoint.upsert({
    where: { slug: "weather-alpha" },
    update: {},
    create: {
      id: "end_weather",
      merchantId: merchant.id,
      name: "Weather Alpha",
      slug: "weather-alpha",
      method: "GET",
      upstreamUrl: "/api/mock/weather-alpha",
      priceUsd: "0.001",
      description: "Premium weather signal for autonomous logistics agents",
      mimeType: "application/json",
      dodoMeterId: "mtr_demo_api_call"
    }
  });

  await prisma.endpoint.upsert({
    where: { slug: "risk-score" },
    update: {},
    create: {
      id: "end_risk",
      merchantId: merchant.id,
      name: "Risk Score",
      slug: "risk-score",
      method: "GET",
      upstreamUrl: "/api/mock/risk-score",
      priceUsd: "0.01",
      description: "Transaction risk score for AI finance agents",
      mimeType: "application/json",
      dodoMeterId: "mtr_demo_api_call"
    }
  });

  await prisma.creditLedgerEntry.upsert({
    where: { id: "cle_seed" },
    update: {},
    create: {
      id: "cle_seed",
      buyerId: buyer.id,
      providerId: "seed_credit_grant",
      idempotencyKey: "seed_credit_grant",
      eventType: "credit.added",
      rawStatus: "seeded",
      amount: "25000",
      balanceBefore: "0",
      balanceAfter: "25000",
      reason: "Seeded hackathon demo credits"
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

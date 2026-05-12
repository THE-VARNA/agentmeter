import { prisma } from "./db";
import { makeId, nowIso } from "./utils";
import type { 
  AppState, Buyer, CreditLedgerEntry, DemoRun, Endpoint, GatewayRequest, LedgerItem, Merchant, X402Payment, DodoCheckout, DodoWebhookEvent 
} from "./types";
import { CREDIT_PACKS, MERCHANT_WALLET, X402_FACILITATOR_URL, X402_NETWORK } from "./constants";

export async function getStore(): Promise<AppState> {
  const merchants = await prisma.merchant.findMany();
  let merchant = merchants[0];
  if (!merchant) {
    // If empty DB, this shouldn't happen because of seed, but fallback
    merchant = await prisma.merchant.create({
      data: {
        id: "mer_demo",
        name: "AgentMeter Demo",
        slug: "agentmeter-demo",
        dodoBusinessId: "biz_demo_agentmeter",
        dodoCustomerId: "cus_demo_merchant",
        solanaWallet: MERCHANT_WALLET,
        x402Network: X402_NETWORK,
        facilitatorUrl: X402_FACILITATOR_URL,
      }
    });
  }

  const buyers = await prisma.buyer.findMany();
  const endpoints = await prisma.endpoint.findMany();
  const gateways = await prisma.gatewayRequest.findMany({ orderBy: { createdAt: 'desc' } });
  const x402s = await prisma.x402Payment.findMany({ orderBy: { createdAt: 'desc' } });
  const checkouts = await prisma.dodoCheckout.findMany({ orderBy: { createdAt: 'desc' } });
  const webhooks = await prisma.dodoWebhookEvent.findMany({ orderBy: { createdAt: 'desc' } });
  const ledgers = await prisma.creditLedgerEntry.findMany({ orderBy: { createdAt: 'desc' } });
  const demos = await prisma.demoRun.findMany({ orderBy: { createdAt: 'desc' } });

  return {
    merchant: {
      ...merchant,
      createdAt: merchant.createdAt.toISOString(),
      updatedAt: merchant.updatedAt.toISOString()
    },
    buyers: buyers.map(b => ({
      ...b,
      creditBalance: Number(b.creditBalance),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString()
    })),
    endpoints: endpoints.map(e => ({
      ...e,
      priceUsd: Number(e.priceUsd),
      revenueUsd: Number(e.revenueUsd),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString()
    })),
    gatewayRequests: gateways.map(g => ({
      ...g,
      amountUsd: Number(g.amountUsd),
      createdAt: g.createdAt.toISOString()
    })),
    x402Payments: x402s.map(x => ({
      ...x,
      amountUsd: Number(x.amountUsd),
      createdAt: x.createdAt.toISOString()
    })),
    dodoCheckouts: checkouts.map(c => ({
      ...c,
      amountUsd: Number(c.amountUsd),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    })),
    dodoWebhookEvents: webhooks.map(w => ({
      ...w,
      parsedAmount: w.parsedAmount ? Number(w.parsedAmount) : undefined,
      processedAt: w.processedAt?.toISOString(),
      createdAt: w.createdAt.toISOString()
    })),
    creditLedgerEntries: ledgers.map(l => ({
      ...l,
      amount: Number(l.amount),
      balanceBefore: Number(l.balanceBefore),
      balanceAfter: Number(l.balanceAfter),
      createdAt: l.createdAt.toISOString()
    })),
    demoRuns: demos.map(d => ({
      ...d,
      amountUsd: Number(d.amountUsd),
      createdAt: d.createdAt.toISOString(),
      steps: d.steps as any
    }))
  };
}

export async function getSerializableState() {
  return await getStore();
}

export async function findEndpoint(slug: string) {
  const store = await getStore();
  return store.endpoints.find(e => e.slug === slug);
}

export async function addEndpoint(input: Omit<Endpoint, "id" | "merchantId" | "dodoMeterId" | "requestCount" | "revenueUsd" | "createdAt" | "updatedAt">) {
  const store = await getStore();
  return await prisma.endpoint.create({
    data: {
      merchantId: store.merchant.id,
      name: input.name,
      slug: input.slug,
      method: input.method,
      upstreamUrl: input.upstreamUrl,
      priceUsd: input.priceUsd,
      description: input.description,
      mimeType: input.mimeType,
      active: input.active,
      dodoMeterId: "mtr_demo_api_call"
    }
  });
}

export async function recordGatewayRequest(input: Omit<GatewayRequest, "id" | "createdAt">) {
  const gw = await prisma.gatewayRequest.create({
    data: {
      endpointId: input.endpointId,
      buyerId: input.buyerId,
      method: input.method,
      path: input.path,
      statusCode: input.statusCode,
      rawStatus: input.rawStatus,
      providerId: input.providerId,
      idempotencyKey: input.idempotencyKey,
      latencyMs: input.latencyMs,
      amountUsd: input.amountUsd,
      txSignature: input.txSignature,
      dodoPaymentId: input.dodoPaymentId,
      errorCode: input.errorCode,
      requestBody: input.requestBody ? JSON.stringify(input.requestBody) : undefined,
      responseBody: input.responseBody ? JSON.stringify(input.responseBody) : undefined
    }
  });

  if (input.statusCode === 200) {
    await prisma.endpoint.update({
      where: { id: input.endpointId },
      data: {
        requestCount: { increment: 1 },
        revenueUsd: { increment: input.amountUsd }
      }
    });
  }

  return { ...gw, amountUsd: Number(gw.amountUsd), createdAt: gw.createdAt.toISOString() };
}

export async function recordX402Payment(input: Omit<X402Payment, "id" | "createdAt">) {
  const x = await prisma.x402Payment.create({
    data: {
      endpointId: input.endpointId,
      buyerId: input.buyerId,
      gatewayRequestId: input.gatewayRequestId,
      providerId: input.providerId,
      idempotencyKey: input.idempotencyKey,
      scheme: input.scheme,
      network: input.network,
      amountUsd: input.amountUsd,
      payTo: input.payTo,
      txSignature: input.txSignature,
      settlementStatus: input.settlementStatus,
      rawStatus: input.rawStatus,
      rawPayload: input.rawPayload ? JSON.stringify(input.rawPayload) : undefined
    }
  });
  return { ...x, amountUsd: Number(x.amountUsd), createdAt: x.createdAt.toISOString() };
}

export async function recordCheckout(input: Omit<DodoCheckout, "id" | "createdAt" | "updatedAt">) {
  const c = await prisma.dodoCheckout.create({
    data: {
      merchantId: input.merchantId,
      buyerId: input.buyerId,
      providerId: input.providerId,
      idempotencyKey: input.idempotencyKey,
      checkoutUrl: input.checkoutUrl,
      productId: input.productId,
      amountUsd: input.amountUsd,
      rawStatus: input.rawStatus,
      dodoPaymentId: input.dodoPaymentId,
      rawPayload: input.rawPayload ? JSON.stringify(input.rawPayload) : undefined
    }
  });
  return { ...c, amountUsd: Number(c.amountUsd), createdAt: c.createdAt.toISOString() };
}

export async function recordWebhook(input: Omit<DodoWebhookEvent, "id" | "createdAt">) {
  const w = await prisma.dodoWebhookEvent.upsert({
    where: { providerId: input.providerId },
    update: {},
    create: {
      merchantId: input.merchantId,
      providerId: input.providerId,
      idempotencyKey: input.idempotencyKey,
      eventType: input.eventType,
      rawStatus: input.rawStatus,
      parsedAmount: input.parsedAmount,
      txSignature: input.txSignature,
      dodoPaymentId: input.dodoPaymentId,
      rawPayload: input.rawPayload ? JSON.stringify(input.rawPayload) : "{}"
    }
  });
  return { ...w, parsedAmount: w.parsedAmount ? Number(w.parsedAmount) : undefined, createdAt: w.createdAt.toISOString() };
}

export async function adjustCredits(input: {
  buyerId: string;
  amount: number;
  eventType: string;
  rawStatus: string;
  reason: string;
  providerId?: string;
  idempotencyKey: string;
  dodoPaymentId?: string;
  txSignature?: string;
  rawPayload?: unknown;
}) {
  const existing = await prisma.creditLedgerEntry.findFirst({
    where: { idempotencyKey: input.idempotencyKey }
  });
  if (existing) {
    return { ...existing, amount: Number(existing.amount), balanceBefore: Number(existing.balanceBefore), balanceAfter: Number(existing.balanceAfter), createdAt: existing.createdAt.toISOString() };
  }

  const buyer = await prisma.buyer.findUniqueOrThrow({ where: { id: input.buyerId } });
  const balanceBefore = Number(buyer.creditBalance);
  const balanceAfter = Number((balanceBefore + input.amount).toFixed(6));

  const [entry] = await prisma.$transaction([
    prisma.creditLedgerEntry.create({
      data: {
        buyerId: input.buyerId,
        providerId: input.providerId,
        idempotencyKey: input.idempotencyKey,
        eventType: input.eventType,
        rawStatus: input.rawStatus,
        amount: input.amount,
        balanceBefore,
        balanceAfter,
        dodoPaymentId: input.dodoPaymentId,
        txSignature: input.txSignature,
        reason: input.reason,
        rawPayload: input.rawPayload ? JSON.stringify(input.rawPayload) : undefined
      }
    }),
    prisma.buyer.update({
      where: { id: input.buyerId },
      data: { creditBalance: balanceAfter }
    })
  ]);

  return { ...entry, amount: Number(entry.amount), balanceBefore: Number(entry.balanceBefore), balanceAfter: Number(entry.balanceAfter), createdAt: entry.createdAt.toISOString() };
}

export async function recordDemoRun(input: Omit<DemoRun, "id" | "createdAt">) {
  const d = await prisma.demoRun.create({
    data: {
      merchantId: input.merchantId,
      providerId: input.providerId,
      idempotencyKey: input.idempotencyKey,
      rawStatus: input.rawStatus,
      endpointSlug: input.endpointSlug,
      amountUsd: input.amountUsd,
      txSignature: input.txSignature,
      dodoPaymentId: input.dodoPaymentId,
      steps: input.steps ? JSON.stringify(input.steps) : "[]"
    }
  });
  return { ...d, amountUsd: Number(d.amountUsd), createdAt: d.createdAt.toISOString(), steps: d.steps as any };
}

export async function getLedger(): Promise<LedgerItem[]> {
  const store = await getStore();
  const dodo: LedgerItem[] = store.dodoCheckouts.map((checkout) => ({
    id: checkout.id,
    kind: "dodo",
    title: `Dodo checkout ${checkout.rawStatus}`,
    status: checkout.rawStatus,
    amountUsd: checkout.amountUsd,
    dodoPaymentId: checkout.dodoPaymentId,
    providerId: checkout.providerId,
    metadata: checkout.rawPayload,
    createdAt: checkout.createdAt
  }));

  const webhooks: LedgerItem[] = store.dodoWebhookEvents.map((event) => ({
    id: event.id,
    kind: "dodo",
    title: `Webhook ${event.eventType}`,
    status: event.rawStatus,
    amountUsd: event.parsedAmount,
    dodoPaymentId: event.dodoPaymentId,
    providerId: event.providerId,
    metadata: event.rawPayload,
    createdAt: event.createdAt
  }));

  const credits: LedgerItem[] = store.creditLedgerEntries.map((entry) => ({
    id: entry.id,
    kind: "credit",
    title: entry.eventType,
    status: entry.rawStatus,
    amountUsd: entry.amount / 1000,
    txSignature: entry.txSignature,
    dodoPaymentId: entry.dodoPaymentId,
    providerId: entry.providerId,
    metadata: {
      reason: entry.reason,
      balanceBefore: entry.balanceBefore,
      balanceAfter: entry.balanceAfter
    },
    createdAt: entry.createdAt
  }));

  const x402: LedgerItem[] = store.x402Payments.map((payment) => ({
    id: payment.id,
    kind: "x402",
    title: "x402 Solana payment",
    status: payment.settlementStatus,
    amountUsd: payment.amountUsd,
    txSignature: payment.txSignature,
    providerId: payment.providerId,
    metadata: payment.rawPayload,
    createdAt: payment.createdAt
  }));

  const gateways: LedgerItem[] = store.gatewayRequests.map((req) => ({
    id: req.id,
    kind: "gateway",
    title: `${req.method} ${req.path}`,
    status: `${req.statusCode} ${req.rawStatus}`,
    amountUsd: req.amountUsd,
    txSignature: req.txSignature,
    providerId: req.providerId,
    metadata: { latencyMs: req.latencyMs, errorCode: req.errorCode },
    createdAt: req.createdAt
  }));

  const items = [...dodo, ...webhooks, ...credits, ...x402, ...gateways];
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

export async function getMetrics() {
  const store = await getStore();
  const successfulGw = store.gatewayRequests.filter((r) => r.statusCode === 200);
  const successfulPx = store.x402Payments.filter((p) => p.settlementStatus === "verified_devnet" || p.settlementStatus === "settled");

  return {
    totalRequests: successfulGw.length,
    totalRevenue: successfulGw.reduce((sum, req) => sum + req.amountUsd, 0),
    activeAgents: new Set(successfulGw.map((req) => req.buyerId).filter(Boolean)).size,
    successRate: store.gatewayRequests.length > 0 ? (successfulGw.length / store.gatewayRequests.length) * 100 : 100
  };
}

export function createUsageEvent(endpoint: Endpoint, buyer: Buyer, txSignature: string) {
  return {
    event_id: `api_call_${Date.now()}_${txSignature.substring(0, 8)}`,
    customer_id: buyer.dodoCustomerId,
    event_name: "api.call",
    timestamp: new Date().toISOString(),
    metadata: {
      endpoint: endpoint.slug,
      method: endpoint.method,
      price_usd: endpoint.priceUsd,
      x402_network: "solana:devnet",
      tx_signature: txSignature
    }
  };
}

export function resolveMockUpstream(endpoint: Endpoint) {
  if (endpoint.slug === "weather-alpha") {
    return {
      location: { lat: 37.7749, lon: -122.4194, name: "San Francisco CA" },
      forecast: {
        timestamp: new Date().toISOString(),
        conditions: "Clear",
        temp_c: 18.2,
        wind_kph: 14.5,
        visibility_km: 16.0,
        logistics_rating: "OPTIMAL"
      },
      agent_insight: "No delays expected for autonomous deliveries in this sector."
    };
  }

  if (endpoint.slug === "risk-score") {
    return {
      wallet: "Fh3DemoAgent111111111111111111111111111111111",
      score: 98,
      factors: {
        age_days: 124,
        tx_volume_usd: 1450.25,
        spam_likelihood: 0.02
      },
      recommendation: "APPROVE",
      agent_insight: "High-trust wallet. Safe for auto-settlement."
    };
  }

  return { status: "ok", endpoint: endpoint.slug, timestamp: new Date().toISOString() };
}

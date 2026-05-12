import {
  APP_URL,
  MERCHANT_WALLET,
  X402_FACILITATOR_URL,
  X402_NETWORK
} from "@/lib/constants";
import type {
  AppState,
  Buyer,
  CreditLedgerEntry,
  DemoRun,
  Endpoint,
  GatewayRequest,
  LedgerItem,
  Merchant,
  X402Payment,
  DodoCheckout,
  DodoWebhookEvent
} from "@/lib/types";
import { makeId, nowIso } from "@/lib/utils";

type MutableStore = AppState & {
  rateLimits: Map<string, { count: number; resetAt: number }>;
  idempotencyKeys: Set<string>;
};

const globalForAgentMeter = globalThis as unknown as {
  agentMeterStore?: MutableStore;
};

function seedMerchant(): Merchant {
  const timestamp = nowIso();
  return {
    id: "mer_demo",
    name: "AgentMeter Demo",
    slug: "agentmeter-demo",
    dodoBusinessId: "biz_demo_agentmeter",
    dodoCustomerId: "cus_demo_merchant",
    solanaWallet: MERCHANT_WALLET,
    x402Network: X402_NETWORK,
    facilitatorUrl: X402_FACILITATOR_URL,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function seedBuyer(merchantId: string): Buyer {
  const timestamp = nowIso();
  return {
    id: "buy_demo",
    merchantId,
    email: "agent@buyer.example",
    name: "Autonomous Research Agent",
    agentWallet: "Fh3DemoAgent111111111111111111111111111111111",
    dodoCustomerId: "cus_demo_agent",
    creditBalance: 25000,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function seedEndpoints(merchantId: string): Endpoint[] {
  const timestamp = nowIso();
  return [
    {
      id: "end_weather",
      merchantId,
      name: "Weather Alpha",
      slug: "weather-alpha",
      method: "GET",
      upstreamUrl: "/api/mock/weather-alpha",
      priceUsd: 0.001,
      description: "Premium weather signal for autonomous logistics agents",
      mimeType: "application/json",
      active: true,
      dodoMeterId: "mtr_demo_api_call",
      requestCount: 1248,
      revenueUsd: 14.82,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "end_risk",
      merchantId,
      name: "Risk Score",
      slug: "risk-score",
      method: "GET",
      upstreamUrl: "/api/mock/risk-score",
      priceUsd: 0.01,
      description: "Transaction risk score for AI finance agents",
      mimeType: "application/json",
      active: true,
      dodoMeterId: "mtr_demo_api_call",
      requestCount: 392,
      revenueUsd: 18.6,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
}

function createInitialStore(): MutableStore {
  const merchant = seedMerchant();
  const buyer = seedBuyer(merchant.id);
  const endpoints = seedEndpoints(merchant.id);
  const now = Date.now();
  const ts = (offsetMs: number) => new Date(now - offsetMs).toISOString();

  const seedGatewayRequests: GatewayRequest[] = [
    {
      id: "gw_seed_001", endpointId: "end_weather", buyerId: buyer.id,
      method: "GET", path: "/gateway/weather-alpha", statusCode: 200,
      rawStatus: "fulfilled", providerId: "demo_sig_seed_001",
      idempotencyKey: "seed_gw_001", latencyMs: 182, amountUsd: 0.001,
      txSignature: "seed_tx_4xDEMO1aGW7ZkU9P2hQnLmFv3YrBsC8oKjX5wEtNiVp",
      createdAt: ts(420000)
    },
    {
      id: "gw_seed_002", endpointId: "end_risk", buyerId: buyer.id,
      method: "GET", path: "/gateway/risk-score", statusCode: 200,
      rawStatus: "fulfilled", providerId: "demo_sig_seed_002",
      idempotencyKey: "seed_gw_002", latencyMs: 241, amountUsd: 0.01,
      txSignature: "seed_tx_9yRISK2bHX8MnV4cF6wPqAuE1ZoKjL7gDtSmWiCvBr",
      createdAt: ts(300000)
    },
    {
      id: "gw_seed_003", endpointId: "end_weather", buyerId: buyer.id,
      method: "GET", path: "/gateway/weather-alpha", statusCode: 200,
      rawStatus: "fulfilled", providerId: "demo_sig_seed_003",
      idempotencyKey: "seed_gw_003", latencyMs: 167, amountUsd: 0.001,
      txSignature: "seed_tx_3mWEATH5cPq2xL8kD9nVfBgYrJoZiU6tEsAhNwCvXm",
      createdAt: ts(120000)
    }
  ];

  const seedX402Payments: X402Payment[] = [
    {
      id: "x402_seed_001", endpointId: "end_weather", buyerId: buyer.id,
      gatewayRequestId: "gw_seed_001", providerId: "demo_sig_seed_001",
      idempotencyKey: "seed_x402_001", scheme: "exact",
      network: merchant.x402Network, amountUsd: 0.001,
      payTo: merchant.solanaWallet,
      txSignature: "seed_tx_4xDEMO1aGW7ZkU9P2hQnLmFv3YrBsC8oKjX5wEtNiVp",
      settlementStatus: "verified_devnet", rawStatus: "settled",
      createdAt: ts(420000)
    },
    {
      id: "x402_seed_002", endpointId: "end_risk", buyerId: buyer.id,
      gatewayRequestId: "gw_seed_002", providerId: "demo_sig_seed_002",
      idempotencyKey: "seed_x402_002", scheme: "exact",
      network: merchant.x402Network, amountUsd: 0.01,
      payTo: merchant.solanaWallet,
      txSignature: "seed_tx_9yRISK2bHX8MnV4cF6wPqAuE1ZoKjL7gDtSmWiCvBr",
      settlementStatus: "verified_devnet", rawStatus: "settled",
      createdAt: ts(300000)
    }
  ];

  const seedDemoRuns: DemoRun[] = [
    {
      id: "demo_seed_001", merchantId: merchant.id,
      providerId: "demo_sig_seed_001", idempotencyKey: "seed_demo_001",
      rawStatus: "completed", endpointSlug: "weather-alpha",
      amountUsd: 0.001,
      txSignature: "seed_tx_4xDEMO1aGW7ZkU9P2hQnLmFv3YrBsC8oKjX5wEtNiVp",
      dodoPaymentId: "dodo_evt_seed_001",
      steps: [],
      createdAt: ts(420000)
    }
  ];

  const seedCreditEntries: CreditLedgerEntry[] = [
    {
      id: "cle_seed",
      buyerId: buyer.id,
      providerId: "seed_credit_grant",
      idempotencyKey: "seed_credit_grant",
      eventType: "credit.added",
      rawStatus: "seeded",
      amount: 25000,
      balanceBefore: 0,
      balanceAfter: 25000,
      reason: "Seeded hackathon demo credits for per-request API access",
      createdAt: ts(600000)
    },
    {
      id: "cle_seed_deduct_001",
      buyerId: buyer.id,
      providerId: "demo_sig_seed_001",
      idempotencyKey: "seed_deduct_001",
      eventType: "credit.deducted",
      rawStatus: "demo_mode_ingested",
      amount: -1,
      balanceBefore: 25000,
      balanceAfter: 24999,
      reason: "Dodo usage event for weather-alpha",
      txSignature: "seed_tx_4xDEMO1aGW7ZkU9P2hQnLmFv3YrBsC8oKjX5wEtNiVp",
      createdAt: ts(420000)
    },
    {
      id: "cle_seed_deduct_002",
      buyerId: buyer.id,
      providerId: "demo_sig_seed_002",
      idempotencyKey: "seed_deduct_002",
      eventType: "credit.deducted",
      rawStatus: "demo_mode_ingested",
      amount: -1,
      balanceBefore: 24999,
      balanceAfter: 24998,
      reason: "Dodo usage event for risk-score",
      txSignature: "seed_tx_9yRISK2bHX8MnV4cF6wPqAuE1ZoKjL7gDtSmWiCvBr",
      createdAt: ts(300000)
    }
  ];

  return {
    merchant,
    buyers: [{ ...buyer, creditBalance: 24998 }],
    endpoints,
    gatewayRequests: seedGatewayRequests,
    x402Payments: seedX402Payments,
    dodoCheckouts: [],
    dodoWebhookEvents: [],
    creditLedgerEntries: seedCreditEntries,
    demoRuns: seedDemoRuns,
    rateLimits: new Map(),
    idempotencyKeys: new Set(["seed_credit_grant", "seed_gw_001", "seed_gw_002", "seed_gw_003", "seed_x402_001", "seed_x402_002", "seed_demo_001"])
  };
}


export function getStore(): MutableStore {
  if (!globalForAgentMeter.agentMeterStore) {
    globalForAgentMeter.agentMeterStore = createInitialStore();
  }

  return globalForAgentMeter.agentMeterStore;
}

export function getSerializableState(): AppState {
  const store = getStore();
  return {
    merchant: store.merchant,
    buyers: store.buyers,
    endpoints: store.endpoints,
    gatewayRequests: store.gatewayRequests,
    x402Payments: store.x402Payments,
    dodoCheckouts: store.dodoCheckouts,
    dodoWebhookEvents: store.dodoWebhookEvents,
    creditLedgerEntries: store.creditLedgerEntries,
    demoRuns: store.demoRuns
  };
}

export function findEndpoint(slug: string) {
  return getStore().endpoints.find((endpoint) => endpoint.slug === slug);
}

export function addEndpoint(input: Omit<Endpoint, "id" | "merchantId" | "dodoMeterId" | "requestCount" | "revenueUsd" | "createdAt" | "updatedAt">) {
  const store = getStore();
  const existing = store.endpoints.find((endpoint) => endpoint.slug === input.slug);

  if (existing) {
    throw new Error("Endpoint slug already exists");
  }

  const timestamp = nowIso();
  const endpoint: Endpoint = {
    ...input,
    id: makeId("end"),
    merchantId: store.merchant.id,
    dodoMeterId: "mtr_demo_api_call",
    requestCount: 0,
    revenueUsd: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  store.endpoints.unshift(endpoint);
  return endpoint;
}

export function recordGatewayRequest(input: Omit<GatewayRequest, "id" | "createdAt">) {
  const request: GatewayRequest = {
    ...input,
    id: makeId("gw"),
    createdAt: nowIso()
  };
  const store = getStore();
  store.gatewayRequests.unshift(request);

  const endpoint = store.endpoints.find((item) => item.id === input.endpointId);
  if (endpoint && input.statusCode === 200) {
    endpoint.requestCount += 1;
    endpoint.revenueUsd = Number((endpoint.revenueUsd + input.amountUsd).toFixed(6));
    endpoint.updatedAt = nowIso();
  }

  return request;
}

export function recordX402Payment(input: Omit<X402Payment, "id" | "createdAt">) {
  const payment: X402Payment = {
    ...input,
    id: makeId("x402"),
    createdAt: nowIso()
  };
  getStore().x402Payments.unshift(payment);
  return payment;
}

export function recordCheckout(input: Omit<DodoCheckout, "id" | "createdAt" | "updatedAt">) {
  const timestamp = nowIso();
  const checkout: DodoCheckout = {
    ...input,
    id: makeId("chk"),
    createdAt: timestamp,
    updatedAt: timestamp
  };
  getStore().dodoCheckouts.unshift(checkout);
  return checkout;
}

export function recordWebhook(input: Omit<DodoWebhookEvent, "id" | "createdAt">) {
  const store = getStore();
  const existing = store.dodoWebhookEvents.find((event) => event.providerId === input.providerId);
  if (existing) {
    return existing;
  }

  const webhook: DodoWebhookEvent = {
    ...input,
    id: makeId("wh"),
    createdAt: nowIso()
  };
  store.dodoWebhookEvents.unshift(webhook);
  return webhook;
}

export function adjustCredits(input: {
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
  const store = getStore();
  if (store.idempotencyKeys.has(input.idempotencyKey)) {
    return store.creditLedgerEntries.find((entry) => entry.idempotencyKey === input.idempotencyKey);
  }

  const buyer = store.buyers.find((item) => item.id === input.buyerId);
  if (!buyer) {
    throw new Error("Buyer not found");
  }

  const balanceBefore = buyer.creditBalance;
  const balanceAfter = Number((balanceBefore + input.amount).toFixed(6));
  buyer.creditBalance = balanceAfter;
  buyer.updatedAt = nowIso();

  const entry: CreditLedgerEntry = {
    id: makeId("cle"),
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
    rawPayload: input.rawPayload,
    createdAt: nowIso()
  };

  store.creditLedgerEntries.unshift(entry);
  store.idempotencyKeys.add(input.idempotencyKey);
  return entry;
}

export function recordDemoRun(input: Omit<DemoRun, "id" | "createdAt">) {
  const demoRun: DemoRun = {
    ...input,
    id: makeId("demo"),
    createdAt: nowIso()
  };
  getStore().demoRuns.unshift(demoRun);
  return demoRun;
}

export function getLedger(): LedgerItem[] {
  const store = getStore();
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

  const gateway: LedgerItem[] = store.gatewayRequests.map((request) => ({
    id: request.id,
    kind: "gateway",
    title: `Gateway ${request.statusCode}`,
    status: request.rawStatus,
    amountUsd: request.amountUsd,
    txSignature: request.txSignature,
    dodoPaymentId: request.dodoPaymentId,
    providerId: request.providerId,
    metadata: request.responseBody,
    createdAt: request.createdAt
  }));

  const demos: LedgerItem[] = store.demoRuns.map((demo) => ({
    id: demo.id,
    kind: "demo",
    title: `Demo run: ${demo.endpointSlug}`,
    status: demo.rawStatus,
    amountUsd: demo.amountUsd,
    txSignature: demo.txSignature,
    dodoPaymentId: demo.dodoPaymentId,
    providerId: demo.providerId,
    metadata: demo.steps,
    createdAt: demo.createdAt
  }));

  return [...dodo, ...webhooks, ...credits, ...x402, ...gateway, ...demos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function resolveMockUpstream(endpoint: Endpoint) {
  if (endpoint.slug === "weather-alpha") {
    return {
      model: "weather-alpha",
      location: "Bengaluru",
      signal: "clear-route-window",
      confidence: 0.94,
      recommendation: "Dispatch within 18 minutes to avoid monsoon drift.",
      generated_at: nowIso()
    };
  }

  if (endpoint.slug === "risk-score") {
    return {
      model: "risk-score",
      score: 21,
      band: "low",
      rationale: "Counterparty wallet, amount, and endpoint history are within policy.",
      generated_at: nowIso()
    };
  }

  return {
    endpoint: endpoint.slug,
    message: "Demo endpoint fulfilled through AgentMeter",
    generated_at: nowIso()
  };
}

export function createUsageEvent(endpoint: Endpoint, buyer: Buyer, txSignature?: string) {
  return {
    event_id: `api_call_${endpoint.slug}_${Date.now()}`,
    customer_id: buyer.dodoCustomerId,
    event_name: "api.call" as const,
    timestamp: nowIso(),
    metadata: {
      endpoint: endpoint.slug,
      method: endpoint.method,
      price_usd: endpoint.priceUsd,
      x402_network: X402_NETWORK,
      tx_signature: txSignature
    }
  };
}

export function getMetrics() {
  const store = getStore();
  const totalRevenue = store.endpoints.reduce((sum, endpoint) => sum + endpoint.revenueUsd, 0);
  const totalRequests = store.endpoints.reduce((sum, endpoint) => sum + endpoint.requestCount, 0);
  const buyer = store.buyers[0];
  const lastPayment = store.x402Payments[0];

  return {
    totalRevenue,
    totalRequests,
    activeEndpoints: store.endpoints.filter((endpoint) => endpoint.active).length,
    creditBalance: buyer?.creditBalance ?? 0,
    lastTx: lastPayment?.txSignature,
    appUrl: APP_URL
  };
}

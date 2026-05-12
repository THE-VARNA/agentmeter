export type Method = "GET" | "POST";

export type Merchant = {
  id: string;
  name: string;
  slug: string;
  dodoBusinessId?: string;
  dodoCustomerId?: string;
  solanaWallet: string;
  x402Network: string;
  facilitatorUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type Endpoint = {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  method: Method;
  upstreamUrl: string;
  priceUsd: number;
  description: string;
  mimeType: string;
  active: boolean;
  dodoMeterId: string;
  requestCount: number;
  revenueUsd: number;
  createdAt: string;
  updatedAt: string;
};

export type Buyer = {
  id: string;
  merchantId: string;
  email: string;
  name: string;
  agentWallet: string;
  dodoCustomerId: string;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type GatewayRequest = {
  id: string;
  endpointId: string;
  buyerId?: string;
  method: Method;
  path: string;
  statusCode: number;
  rawStatus: string;
  providerId?: string;
  idempotencyKey: string;
  latencyMs: number;
  amountUsd: number;
  txSignature?: string;
  dodoPaymentId?: string;
  errorCode?: string;
  requestBody?: unknown;
  responseBody?: unknown;
  createdAt: string;
};

export type X402Payment = {
  id: string;
  endpointId: string;
  buyerId?: string;
  gatewayRequestId?: string;
  providerId?: string;
  idempotencyKey: string;
  scheme: "exact";
  network: string;
  amountUsd: number;
  payTo: string;
  txSignature?: string;
  settlementStatus: "settled" | "verified_devnet" | "validated_fallback" | "failed";
  rawStatus: string;
  rawPayload?: unknown;
  createdAt: string;
};

export type DodoCheckout = {
  id: string;
  merchantId: string;
  buyerId?: string;
  providerId?: string;
  idempotencyKey: string;
  checkoutUrl: string;
  productId: string;
  amountUsd: number;
  rawStatus: string;
  dodoPaymentId?: string;
  rawPayload?: unknown;
  createdAt: string;
  updatedAt: string;
};

export type DodoWebhookEvent = {
  id: string;
  merchantId: string;
  providerId: string;
  idempotencyKey: string;
  eventType: string;
  rawStatus: string;
  parsedAmount?: number;
  txSignature?: string;
  dodoPaymentId?: string;
  rawPayload: unknown;
  processedAt?: string;
  createdAt: string;
};

export type CreditLedgerEntry = {
  id: string;
  buyerId: string;
  providerId?: string;
  idempotencyKey: string;
  eventType: string;
  rawStatus: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  dodoPaymentId?: string;
  txSignature?: string;
  reason: string;
  rawPayload?: unknown;
  createdAt: string;
};

export type DemoStep = {
  id: string;
  title: string;
  status: "complete" | "pending" | "failed";
  detail: string;
  payload?: unknown;
};

export type DemoRun = {
  id: string;
  merchantId: string;
  providerId?: string;
  idempotencyKey: string;
  rawStatus: string;
  endpointSlug: string;
  amountUsd: number;
  txSignature?: string;
  dodoPaymentId?: string;
  steps: DemoStep[];
  createdAt: string;
};

export type LedgerItem = {
  id: string;
  kind: "dodo" | "credit" | "x402" | "gateway" | "demo";
  title: string;
  status: string;
  amountUsd?: number;
  txSignature?: string;
  dodoPaymentId?: string;
  providerId?: string;
  metadata?: unknown;
  createdAt: string;
};

export type AppState = {
  merchant: Merchant;
  buyers: Buyer[];
  endpoints: Endpoint[];
  gatewayRequests: GatewayRequest[];
  x402Payments: X402Payment[];
  dodoCheckouts: DodoCheckout[];
  dodoWebhookEvents: DodoWebhookEvent[];
  creditLedgerEntries: CreditLedgerEntry[];
  demoRuns: DemoRun[];
};

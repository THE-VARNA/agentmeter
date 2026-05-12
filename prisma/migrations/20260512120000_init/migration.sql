CREATE TABLE "Merchant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "dodoBusinessId" TEXT,
  "dodoCustomerId" TEXT,
  "solanaWallet" TEXT NOT NULL,
  "x402Network" TEXT NOT NULL,
  "facilitatorUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Endpoint" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "upstreamUrl" TEXT NOT NULL,
  "priceUsd" DECIMAL(12,6) NOT NULL,
  "description" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "dodoMeterId" TEXT,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "revenueUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Endpoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Buyer" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "agentWallet" TEXT NOT NULL,
  "dodoCustomerId" TEXT NOT NULL,
  "creditBalance" DECIMAL(18,6) NOT NULL DEFAULT 25000,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiCredential" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "lastFour" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "ApiCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GatewayRequest" (
  "id" TEXT NOT NULL,
  "endpointId" TEXT NOT NULL,
  "buyerId" TEXT,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "rawStatus" TEXT NOT NULL,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "latencyMs" INTEGER NOT NULL,
  "amountUsd" DECIMAL(12,6) NOT NULL,
  "txSignature" TEXT,
  "dodoPaymentId" TEXT,
  "errorCode" TEXT,
  "requestBody" JSONB,
  "responseBody" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GatewayRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "X402Payment" (
  "id" TEXT NOT NULL,
  "endpointId" TEXT NOT NULL,
  "buyerId" TEXT,
  "gatewayRequestId" TEXT,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "scheme" TEXT NOT NULL,
  "network" TEXT NOT NULL,
  "amountUsd" DECIMAL(12,6) NOT NULL,
  "payTo" TEXT NOT NULL,
  "txSignature" TEXT,
  "settlementStatus" TEXT NOT NULL,
  "rawStatus" TEXT NOT NULL,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "X402Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DodoCheckout" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "buyerId" TEXT,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "checkoutUrl" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "amountUsd" DECIMAL(12,2) NOT NULL,
  "rawStatus" TEXT NOT NULL,
  "dodoPaymentId" TEXT,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DodoCheckout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DodoWebhookEvent" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "rawStatus" TEXT NOT NULL,
  "parsedAmount" DECIMAL(12,2),
  "txSignature" TEXT,
  "dodoPaymentId" TEXT,
  "rawPayload" JSONB NOT NULL,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DodoWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreditLedgerEntry" (
  "id" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "rawStatus" TEXT NOT NULL,
  "amount" DECIMAL(18,6) NOT NULL,
  "balanceBefore" DECIMAL(18,6) NOT NULL,
  "balanceAfter" DECIMAL(18,6) NOT NULL,
  "dodoPaymentId" TEXT,
  "txSignature" TEXT,
  "reason" TEXT NOT NULL,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DemoRun" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "rawStatus" TEXT NOT NULL,
  "endpointSlug" TEXT NOT NULL,
  "amountUsd" DECIMAL(12,6) NOT NULL,
  "txSignature" TEXT,
  "dodoPaymentId" TEXT,
  "steps" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DemoRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Merchant_slug_key" ON "Merchant"("slug");
CREATE UNIQUE INDEX "Endpoint_slug_key" ON "Endpoint"("slug");
CREATE UNIQUE INDEX "X402Payment_gatewayRequestId_key" ON "X402Payment"("gatewayRequestId");
CREATE UNIQUE INDEX "DodoWebhookEvent_providerId_key" ON "DodoWebhookEvent"("providerId");

ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApiCredential" ADD CONSTRAINT "ApiCredential_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GatewayRequest" ADD CONSTRAINT "GatewayRequest_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GatewayRequest" ADD CONSTRAINT "GatewayRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "X402Payment" ADD CONSTRAINT "X402Payment_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "X402Payment" ADD CONSTRAINT "X402Payment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "X402Payment" ADD CONSTRAINT "X402Payment_gatewayRequestId_fkey" FOREIGN KEY ("gatewayRequestId") REFERENCES "GatewayRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DodoCheckout" ADD CONSTRAINT "DodoCheckout_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DodoCheckout" ADD CONSTRAINT "DodoCheckout_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DodoWebhookEvent" ADD CONSTRAINT "DodoWebhookEvent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DemoRun" ADD CONSTRAINT "DemoRun_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

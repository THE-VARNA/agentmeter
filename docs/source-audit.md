# Source Audit Notes

The implementation perfectly adheres to the provided hackathon requirements as the core product contract.

## Dodo Payments Deep Integration

- Dodo is accurately positioned as a payments and billing platform for SaaS, AI, and digital products.
- **Stablecoin checkout** is utilized via the sophisticated `DodoOverlay` with **Idempotency Keys** to prevent duplicate charges in machine-to-machine environments.
- **Subscriptions & Hybrid Billing**: We created Test-Mode recurring products and integrated the subscription checkout flow. Dodo handles recurring billing while we meter usage.
- **Native Entitlements Engine**: We utilize Dodo's native backend for **Automatic License Key Issuance** (`license_key.created`). This removes manual key-handling vulnerabilities and uses Dodo's standardized issuance logic.
- **Usage Billing**: Every API call is ingested with **Enriched Telemetry** (solana_tx, agent_wallet, gateway_latency_ms) to Dodo via `client.usageEvents.ingest()`, tracking volume accurately and providing a unified dashboard for merchants.
- **Webhooks**: Production-grade verification of standard webhook signatures is implemented. The `/api/dodo/webhook` route securely intercepts native events to sync state with Neon Postgres.
- **Automated Programmatic Refunds**: If our gateway processes a payment but the upstream Merchant API fails to fulfill the request, we utilize `client.refunds.create()` to programmatically refund the user, ensuring trust in the autonomous machine economy.
- **Analytics**: The dashboard utilizes `client.payments.list()` to pull real test-mode revenue direct from Dodo, bypassing stale local data.

## Solana x402 & Gateways

- Gateway endpoints correctly return HTTP 402 payment requirements before fulfillment.
- Exact-price payments are verified on Solana Devnet.
- We utilize `@solana/web3.js` to perform **real transaction verification**, matching signatures against the Merchant's Solana Wallet Address before fulfilling requests.
- The implementation standardizes the `PAYMENT-SIGNATURE` / `X-PAYMENT` headers according to the x402 specification.
- For users holding an active Dodo License Key, the gateway intercepts the `X-License-Key` header, queries the Neon Postgres database to validate active status, and seamlessly bypasses the HTTP 402 challenge.

## Superteam Track Fit

- AgentMeter perfectly targets Agentic & Autonomous Payments.
- It demonstrates immense real-world utility for AI/API companies: paid API access without accounts, subscriptions, or API key provisioning for autonomous agents, while simultaneously providing enterprise subscription models for human developers using Dodo.
- It beautifully synergizes Dodo's fiat on-ramps and recurring billing infrastructure with Solana's high-speed micropayment ledger.

## Merchant Policy Guardrails

- Single-tenant gateway configuration.
- Strict avoidance of marketplace, resale, token launch, custody, fund management, escrow, or DeFi yield mechanisms.
- Purely B2B infrastructure: Only merchant-owned digital APIs/MCP tools are intended to be monetized.

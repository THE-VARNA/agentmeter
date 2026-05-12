# AgentMeter

AgentMeter is a Dodo + Solana x402 gateway for metered AI/API and MCP-tool access. It is built for the Superteam India x Dodo Payments track: Dodo handles checkout, credits, usage billing, webhooks, customer records, and receipts; Solana x402 handles per-request machine payments.

## Why This Can Win

- **Dodo is non-trivial:** the app uses Checkout Sessions for credit packs, stablecoin checkout configuration with card fallback, usage-event ingestion, credit-ledger semantics, and secure webhook handling.
- **Solana is necessary:** per-request agent payments at `$0.001` only make sense with low-cost, fast settlement. The gateway emits HTTP 402 payment requirements and records Solana payment proofs.
- **x402 is core:** protected routes return 402 until the agent submits a normalized `PAYMENT-SIGNATURE` or `X-PAYMENT` payload.
- **Not a marketplace:** AgentMeter is single-tenant SaaS gateway software for a merchant’s own APIs/MCP tools.

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000` and click **Run Agent Payment Demo**.

## Optional Database Setup

The UI and demo work with deterministic in-memory seed data. For Postgres-backed development:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Demo Path

1. Merchant endpoint `weather-alpha` is priced at `$0.001`.
2. Agent calls `GET /gateway/weather-alpha`.
3. Gateway returns HTTP `402 Payment Required` with Solana Devnet x402 terms.
4. Demo agent submits a signed payment payload.
5. Gateway validates payment, fulfills the protected API response, and records the request.
6. Dodo usage event `api.call` is ingested or simulated in test mode.
7. Ledger shows Dodo, credit, x402, gateway, and demo records.

## Environment

Set real Dodo test credentials to use Dodo APIs:

- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_PAYMENTS_ENVIRONMENT=test_mode`
- `DODO_STABLECOIN_METHOD=crypto`

Stablecoin checkout is modeled as one-time credit packs only because Dodo stablecoin payments are USD billed, global excluding India, have a `$0.50` minimum, and do not support subscriptions.

## Key Routes

- `/` command center
- `/onboarding` setup checks
- `/endpoints` endpoint builder
- `/endpoints/weather-alpha` endpoint detail
- `/agent-console` live 402 flow
- `/credits` Dodo credit packs
- `/ledger` unified audit trail
- `/settings` environment and source-audit constraints

## API Surface

- `POST /api/endpoints`
- `GET /gateway/:slug`
- `POST /api/dodo/checkout/credit-pack`
- `POST /api/dodo/webhook`
- `POST /api/dodo/usage`
- `GET /api/ledger`
- `POST /api/demo/run`

## Compliance Posture

AgentMeter avoids Dodo-prohibited positioning: it is not a wallet, exchange, marketplace, escrow system, DeFi protocol, token launcher, or reseller platform. It is merchant-owned SaaS infrastructure for selling access to the merchant’s own digital API/MCP capabilities.

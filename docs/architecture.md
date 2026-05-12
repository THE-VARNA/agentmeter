# AgentMeter Architecture

```text
Autonomous Agent (or Human with License Key)
  |
  | GET /gateway/weather-alpha
  v
AgentMeter Gateway
  |
  | Checks for X-License-Key Header
  |
  +--- [If License Key is valid] ---> Dodo Usage Ingestion ($0 local) ---+
  |                                                                      |
  +--- [If no License Key]                                               |
       |                                                                 |
       | 402 Payment Required + x402 exact Solana terms                  |
       v                                                                 |
     Agent signs payment payload                                         |
       |                                                                 |
       | PAYMENT-SIGNATURE / X-PAYMENT                                   |
       v                                                                 |
     Gateway verifier (Real Solana Devnet check)                         |
       |                                                                 |
       | valid payment                                                   |
       v                                                                 |
     Protected merchant upstream <---------------------------------------+
       |
       | response
       v
     Gateway audit trail
       |
       +--> Dodo usage event (api.call)
       +--> Credit ledger deduction / Refund on upstream failure
       +--> x402 payment record
       +--> Unified ledger UI
```

## Runtime Modules

- `lib/x402.ts`: payment requirement generation, payment header normalization, and **real Solana Devnet transaction verification** using `@solana/web3.js`.
- `lib/dodo.ts`: Dodo checkout session creation (for credit packs and subscriptions), customer management, Dodo License Key issuance, automated usage ingestion, webhook verification, and refund issuance.
- `lib/db.ts`: Neon Serverless Postgres instance via Prisma 7.
- `app/gateway/[slug]/route.ts`: protected API gateway with built-in subscription bypass and automated upstream failure refund safeguards.
- `app/api/demo/run/route.ts`: one-click judge demo path for visualizing the x402 sequence.
- `app/api/dodo/webhook/route.ts`: robust handler for Dodo `payment.succeeded` events that provisions credit limits and generates Dodo License Keys.

## Persistence & State

- We utilize **Prisma 7** connected to a **Neon Serverless Postgres** database to persist `Merchant`, `Buyer`, `DodoCheckout`, and `LicenseKey` records.
- Real Dodo Customer IDs and Product IDs are mapped directly to our local relational records for lightning-fast edge validation in the gateway.
- Credit balances are synchronized securely using the `dodo.ts` webhook handler.

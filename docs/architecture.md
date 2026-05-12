# AgentMeter Architecture

```text
Autonomous Agent
  |
  | GET /gateway/weather-alpha
  v
AgentMeter Gateway
  |
  | 402 Payment Required + x402 exact Solana terms
  v
Agent signs payment payload
  |
  | PAYMENT-SIGNATURE / X-PAYMENT
  v
Gateway verifier
  |
  | valid payment
  v
Protected merchant upstream
  |
  | response
  v
Gateway audit trail
  |
  +--> Dodo usage event api.call
  +--> Credit ledger deduction
  +--> x402 payment record
  +--> Unified ledger UI
```

## Runtime Modules

- `lib/x402.ts`: payment requirement generation, payment header normalization, demo verifier, payment response header.
- `lib/dodo.ts`: Dodo checkout creation, usage ingestion, webhook verification, webhook parsing.
- `lib/demo-data.ts`: deterministic seed state and in-memory event store.
- `app/gateway/[slug]/route.ts`: protected API gateway.
- `app/api/demo/run/route.ts`: one-click judge demo path.

## Production Swap Points

- Replace deterministic payment verifier with official x402 SVM middleware/facilitator verification.
- Back `lib/demo-data.ts` with Prisma queries.
- Configure Dodo product ids and test/live API keys.
- Add merchant authentication and encrypted secret storage.

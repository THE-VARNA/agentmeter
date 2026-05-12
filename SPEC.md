# AgentMeter Implementation Contract

AgentMeter is a single-tenant Dodo + Solana x402 gateway that lets merchants sell metered access to their own AI APIs and MCP tools. Dodo handles checkout, credits, usage billing, webhook reconciliation, and customer-facing receipts. Solana x402 handles per-request machine payments.

The implementation in this repo includes:

- Next.js App Router + TypeScript frontend and API routes.
- Premium glassmorphism UI across command center, onboarding, endpoints, endpoint detail, agent console, credits, ledger, and settings.
- Prisma Postgres schema and migration for production modeling.
- Deterministic in-memory demo store for hackathon judging without secrets.
- Dodo test-mode adapter with real SDK/fetch integration paths when credentials are provided.
- x402-compatible HTTP 402 challenge and payment proof normalization.
- Seeded `weather-alpha` and `risk-score` endpoints.

See `README.md`, `docs/source-audit.md`, `docs/architecture.md`, and `docs/demo-walkthrough.md`.

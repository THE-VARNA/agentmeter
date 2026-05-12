# Source Audit Notes

The implementation follows the provided hackathon sources as the product contract.

## Dodo Payments

- Dodo is positioned as a payments and billing platform for SaaS, AI, and digital products.
- Stablecoin checkout is configured for one-time credit packs, not subscriptions.
- Stablecoin method is represented by `DODO_STABLECOIN_METHOD`, defaulting to `crypto`, with `credit` and `debit` fallback.
- Usage billing sends `api.call` events with `event_id`, Dodo `customer_id`, `event_name`, timestamp, and metadata.
- Webhooks use raw-body processing, Standard Webhooks-style headers, HMAC verification when a webhook key exists, and idempotent provider ids.
- Credit balances are treated as SaaS usage credits only. No cash-out or transferable wallet behavior is implemented.

## Solana x402

- Gateway endpoints return HTTP 402 payment requirements before fulfillment.
- The MVP uses exact-price payments on Solana Devnet with CAIP-2 `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`.
- The implementation normalizes `PAYMENT-SIGNATURE`, `X-PAYMENT`, and `X-PAYMENT-SIGNATURE` because docs and examples use different header names.
- A deterministic fallback verifier is included so the judge demo works without private wallet material.

## Superteam Track Fit

- AgentMeter directly targets Agentic & Autonomous Payments.
- It demonstrates real utility for AI/API companies: paid API access without accounts, subscriptions, or API key provisioning.
- It shows Dodo and Solana together rather than treating either as a superficial logo integration.

## Merchant Policy Guardrails

- Single-tenant gateway only.
- No marketplace, resale, token launch, custody, fund management, escrow, or DeFi yield.
- Only merchant-owned digital APIs/MCP tools are intended to be monetized.

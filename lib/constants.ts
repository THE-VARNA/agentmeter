export const DODO_STABLECOIN_METHOD =
  (process.env.DODO_STABLECOIN_METHOD ?? "crypto") as "crypto" | "crypto_currency";

export const DODO_PAYMENT_FALLBACKS = ["credit", "debit"] as const;

export const SOLANA_DEVNET_CAIP2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
export const SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
export const SOLANA_DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const DEMO_MODE = process.env.AGENTMETER_DEMO_MODE !== "false";

export const X402_NETWORK =
  process.env.SOLANA_CLUSTER === "mainnet" ? SOLANA_MAINNET_CAIP2 : SOLANA_DEVNET_CAIP2;

export const X402_FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";

export const MERCHANT_WALLET =
  process.env.SOLANA_MERCHANT_WALLET ??
  "9xQeWvG816bUx9EPf1aJKpbVw5L6v1F7GKJYhCqK6R3";

export const CREDIT_PACKS = [
  { amountUsd: 5, credits: 5000, label: "Starter" },
  { amountUsd: 10, credits: 11000, label: "Builder" },
  { amountUsd: 25, credits: 30000, label: "Scale" }
] as const;

export const OFFICIAL_SOURCE_NOTES = [
  "Dodo stablecoin checkout: USD billed, global excluding India, no subscriptions, $0.50 minimum, method type documented as crypto.",
  "Dodo usage billing: send events with event_id, customer_id, event_name, timestamp, metadata; meters aggregate Count/Sum/Max/Last.",
  "Dodo webhooks: verify Standard Webhooks headers, return 2xx quickly, process idempotently.",
  "x402 on Solana: HTTP 402 flow for paid APIs/MCP tools, exact payments, Solana Devnet CAIP-2 for testing.",
  "Merchant policy: position AgentMeter as merchant-owned SaaS gateway software, not a wallet, exchange, marketplace, escrow, or resale platform."
] as const;

# AgentMeter ⚡️
A Dodo + x402 gateway that lets AI/API companies sell metered MCP tools and APIs directly to autonomous agents using Solana stablecoin micro-payments. Target User & Pain Point: AI API founders and MCP server builders who want agents to pay per request without forcing API keys, accounts, invoices, or monthly subscriptions.

A Dodo Payments + x402 gateway that lets AI/API companies sell metered MCP tools and APIs directly to autonomous agents using Solana stablecoin micro-payments.

Target User & Pain Point: AI API founders and MCP server builders who want agents to pay per request without forcing API keys, accounts, invoices, or monthly subscriptions, while also providing standard subscription tiers for traditional SaaS models.

🏆 **Hackathon Track:** Payments & Finance on Solana + Dodo Payments

---

## 🛑 The Problem

The AI agent economy is booming, but **billing is broken for machines**.
- AI agents cannot hold bank accounts or traditional credit cards.
- Setting up API keys and OAuth for every new agent integration creates massive friction.
- Traditional payment processors cannot handle high-volume, $0.001 micropayments due to high fixed fees.
- When an API call fails upstream, automated agents have no way to request a refund, leading to friction and trust issues.

## 💡 The Solution

**AgentMeter** bridges this gap by wrapping any API in an **HTTP 402 Payment Required** gateway powered by **Dodo Payments** and **Solana**.

Instead of monthly invoices, agents pay exactly for what they use, per-call, using USDC on Solana. For traditional users, Dodo Payments handles the human-facing side (card-to-stablecoin checkout for buying credits, or monthly subscription tiers) and backend reconciliation, while Solana handles the high-speed, low-cost machine settlements.

### How It Works (The Gateway Pipeline)

1. **Merchant Creates Endpoint:** The merchant sets a per-request price (e.g., $0.001). AgentMeter wraps their upstream API with HTTP 402 protection.
2. **Agent Hits the Gateway:** The AI agent sends a standard HTTP GET request. The gateway intercepts it and returns a `402 Payment Required` with an x402 payment challenge (USDC on Solana).
3. **Solana Payment Verified:** The agent fulfills the challenge via Solana and submits a signed `PAYMENT-SIGNATURE` header. The gateway verifies the transaction on-chain via `@solana/web3.js` and routes the request to the upstream API.
4. **Subscription Bypass:** If the user has a Dodo Subscription, they can pass an `X-License-Key` header instead of paying per-call. The gateway validates the Dodo License Key against our Neon Postgres mirror and bypasses the Solana micro-payment, logging a $0 usage event instead.
5. **Automated Refunds:** If the upstream API fails after a successful payment, the gateway uses Dodo Payments to automatically issue a full refund (`client.refunds.create`) and credits the buyer back instantly.

---

## 🛠️ How We Deeply Utilize Dodo Payments

AgentMeter is fundamentally powered by the Dodo Payments SDK to handle all complex financial logic. We don't just use simple checkouts; we implement a production-grade billing infrastructure:

- **Checkout Sessions (`client.checkoutSessions.create`)**: We use the `DodoOverlay` for in-page credit-pack and subscription checkouts. Every session is secured with **Idempotency Keys** to prevent duplicate charges in distributed machine environments.
- **Native Entitlements Engine**: We utilize Dodo's native backend for **Automatic License Key Issuance**. Instead of manual key-handling, we rely on Dodo's automated issuance logic, providing a more secure and standardized entitlement flow for SaaS.
- **Usage Metering (`client.usageEvents.ingest`)**: Every API call (paid or subscribed) is ingested with **Enriched Metadata** including the Solana Transaction Signature (`solana_tx`), Agent Wallet (`agent_wallet`), and simulated `gateway_latency_ms`. This allows merchants to cross-reference blockchain signatures directly within the Dodo dashboard.
- **Automated Programmatic Refunds (`client.refunds.create`)**: If our gateway accepts an x402 payment but the upstream API provider fails, the gateway automatically issues a full Dodo refund. This solves the "Trust Gap" in autonomous agent billing.
- **Native Webhook Integration**: A secure, verified webhook handler listens for native Dodo events (`payment.succeeded`, `license_key.created`) to keep our Neon Postgres database perfectly synced with Dodo's financial ledger.
- **Consolidated Revenue Analytics (`client.payments.list`)**: Our merchant dashboard pulls real-time analytics directly from the Dodo SDK, acting as a unified source of truth for fiat, card, and stablecoin revenue.

---

## 🏗️ Architecture & Tech Stack

- **Framework:** Next.js 15+ (App Router, Turbopack)
- **Styling:** Tailwind CSS, Framer Motion (Glassmorphic, premium animations)
- **Payments & Billing:** Dodo Payments API & Node SDK (`dodopayments`)
- **Blockchain:** Solana Web3.js (`@solana/web3.js`), x402 Protocol Standard
- **Database:** Neon Serverless Postgres via Prisma 7 ORM
- **Deployment:** Vercel (Edge-ready)

### Core Folder Structure

```text
agentmeter/
├── app/                  
│   ├── api/dodo/         # Dodo Webhooks, Checkouts, Revenue Analytics, Usage 
│   ├── gateway/[slug]/   # Core HTTP 402 Execution Engine & Refund Logic
│   ├── dashboard/        # Merchant analytics dashboard (Pulls real Dodo Revenue)
│   ├── agent-console/    # Interactive Agent HTTP 402 visualizer
│   └── credits/          # Top-ups, Subscriptions, and DodoOverlay checkout
├── components/           # Framer Motion UI, Layouts, Charts
├── lib/                  
│   ├── dodo.ts           # Dodo SDK wrappers (Checkout, Subscriptions, License Keys, Refunds)
│   ├── x402.ts           # HTTP 402 logic & Real Solana Devnet verification
└── prisma/               # Postgres Database schema (Merchant, Buyer, DodoCheckout, LicenseKey)
```

### 🔮 Architecture Roadmap: Solana Smart Contracts
While the MVP uses direct USDC transfers for instant x402 settlement, our future architecture relies on a custom **Solana Anchor Program** for advanced merchant payout policies (e.g., escrow, automated refunds without fiat dependencies, and on-chain revenue splitting for AI data providers). Read the full technical specification in [`docs/merchant-payout-policy.md`](docs/merchant-payout-policy.md).

---

## 🚀 Quick Start & Testing Guide (For Judges)

### 1. Environment Setup

Ensure your `.env` contains your Dodo test credentials and Neon Postgres DB:
```env
DODO_PAYMENTS_API_KEY=your_test_key
DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_STABLECOIN_METHOD=crypto_currency
DATABASE_URL=your_neon_postgres_url
```

### 2. Run Locally

```bash
pnpm install
pnpm prisma db push
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. How to Test the Full Workflow

1. **Dashboard Analytics:** The main dashboard pulls live test-mode revenue directly from the Dodo Payments API.
2. **Fund the Agent:** Go to the **Credits** page. Click **Buy via Dodo** on a credit pack or **Subscribe with Dodo** on a subscription plan.
3. **In-Page Checkout:** The Dodo Payments `DodoOverlay` will open natively without leaving the tab. Complete the payment using Dodo's test card credentials. 
4. **Webhook Processing:** Once paid, the secure webhook seamlessly receives the event, provisions the credits in Postgres, and (if a subscription was bought) generates a Dodo License Key. The UI glows green as the balance updates live.
5. **Launch the Execution Demo:** From the Dashboard, click **Run Agent Payment Demo** (this redirects to `/agent-console`).
6. **Watch the Engine:** Click **Execute Flow** to watch the animated 5-step x402 sequence. The gateway intercepts the call, verifies the Solana Devnet transaction in real-time, ingests a Dodo Usage Event, and fulfills the request!
7. **Verify the Audit Trail:** Navigate to the **Ledger** page to see the unified timeline of Dodo Webhook events, generated License Keys, Solana signatures, and executed Gateway requests.

---



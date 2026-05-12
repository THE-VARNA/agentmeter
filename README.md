# AgentMeter ⚡️
A Dodo + x402 gateway that lets AI/API companies sell metered MCP tools and APIs directly to autonomous agents using Solana stablecoin micro-payments. Target User & Pain Point: AI API founders and MCP server builders who want agents to pay per request without forcing API keys, accounts, invoices, or monthly subscriptions.

🏆 **Hackathon Track:** Payments & Finance on Solana + Dodo Payments
- ✅ **Stablecoin payments:** USDC on Solana Devnet (via x402 protocol)
- ✅ **Dodo Payments integration:** Checkout Sessions, Usage Events, Webhooks, Credit Ledger
- ✅ **Real business utility:** API monetization for AI companies—no bank account, no invoices, no minimums.

AgentMeter is a **Solana stablecoin payment rail for the API economy**. It enables businesses to publish metered APIs that autonomous AI agents can pay for per-call, at machine speed, using USDC on Solana. 

---

## 🛑 The Problem

The AI agent economy is booming, but **billing is broken for machines**.
- AI agents cannot hold bank accounts or traditional credit cards.
- API subscriptions are too rigid for unpredictable agent usage patterns.
- Traditional payment processors cannot handle high-volume, $0.001 micropayments due to high fixed fees.
- Setting up API keys and OAuth for every new agent integration creates massive friction.

## 💡 The Solution

**AgentMeter** bridges this gap by wrapping any API in an **HTTP 402 Payment Required** gateway. 

Instead of monthly invoices, agents pay exactly for what they use, per-call, using USDC on Solana. Dodo Payments handles the human-facing side (card-to-stablecoin checkout for buying credits) and backend reconciliation, while Solana handles the high-speed, low-cost machine settlements.

### How It Works (The Payment-to-Entitlement Pipeline)

1. **Merchant Creates Endpoint:** The merchant sets a per-request price (e.g., $0.001). AgentMeter wraps their upstream API with HTTP 402 protection.
2. **Agent Hits the Gateway:** The AI agent sends a standard HTTP GET request. The gateway intercepts it and returns a `402 Payment Required` with an x402 payment challenge (USDC on Solana).
3. **Solana Payment Verified:** The agent fulfills the challenge via Solana and submits a signed `PAYMENT-SIGNATURE` header. The gateway verifies the transaction on-chain and routes the request to the upstream API.
4. **Dodo Bills & Webhooks:** Every fulfilled call emits a Dodo usage event. Credits deduct from the buyer's balance. Webhooks seamlessly reconcile the ledger.

---

## 🛠️ How We Utilize Dodo Payments

AgentMeter deeply integrates Dodo Payments to handle the complex financial logic, acting as the bridge between global liquidity and Solana-native machine payments:

- **Checkout Sessions (`/api/dodo/checkout/credit-pack`)**: We use Dodo Checkout Sessions to sell API "credit packs" to developers. This allows humans to easily fund their AI agents using cards or crypto, converting global liquidity seamlessly into usable agent credits.
- **Credit Ledger & Balances**: We mirror the buyer's credit balance locally and sync it with Dodo's infrastructure.
- **Usage Events (`/api/dodo/usage`)**: For every successful x402-verified API call, AgentMeter ingests a Dodo Usage Event to securely deduct from the user's credit balance.
- **Standard Webhooks (`/api/dodo/webhook`)**: A secure webhook handler listens for `payment.succeeded` events to automatically top-up agent credits, ensuring the ledger is immutable and fully reconciled.

---

## 🏗️ Architecture & Folder Structure

```text
agentmeter/
├── app/                  # Next.js 15 App Router pages & API routes
│   ├── api/              # Backend routes (Dodo Webhooks, Gateway, Demo Runs)
│   ├── dashboard/        # Merchant analytics dashboard
│   ├── endpoints/        # API endpoint management
│   ├── agent-console/    # Interactive Agent HTTP 402 visualizer
│   └── ledger/           # Unified audit trail page
├── components/           # React components (Framer Motion UI, Layouts, Charts)
├── lib/                  # Core logic & utilities
│   ├── dodo.ts           # Dodo Payments SDK integration & webhook verification
│   ├── demo-data.ts      # In-memory store & ledger reconciliation logic
│   ├── x402.ts           # HTTP 402 & Solana verification helpers
│   └── constants.ts      # Environment & config constants
└── prisma/               # Database schema (prepared for persistence layer)
```

---

## 💻 Tech Stack

- **Framework:** Next.js 15+ (App Router, Turbopack)
- **Styling:** Tailwind CSS, Framer Motion (Glassmorphic, premium animations)
- **Payments & Billing:** Dodo Payments API & Node SDK
- **Blockchain:** Solana Web3.js, x402 Protocol Standard
- **Database:** Prisma ORM (configured for Postgres)
- **Deployment:** Vercel (Edge-ready)

---

## 🚀 Quick Start & Testing Guide

### 1. Installation

```bash
git clone https://github.com/yourusername/agentmeter.git
cd agentmeter
pnpm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Ensure your `.env` contains your Dodo test credentials. To utilize Dodo's test mode features, you must use real keys:
```env
DODO_PAYMENTS_API_KEY=your_test_key
DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_STABLECOIN_METHOD=crypto_currency
```

### 3. Run Development Server

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. How to Test the Full Workflow (For Judges)

1. **Launch the Demo:** From the Dashboard, click **Run Agent Payment Demo** (this redirects to `/agent-console`).
2. **Execute the Flow:** Click **Execute Flow** to watch the animated 5-step x402 sequence. You'll see the gateway intercept the call, issue a 402 challenge, verify the Solana Devnet transaction, and fulfill the API request.
3. **Fund the Agent:** Go to the **Credits** page. Click **Launch Dodo checkout** on a credit pack.
4. **Complete Checkout:** The Dodo Payments tab will open. Complete the payment using Dodo's test credentials. 
5. **Watch the Webhook:** Return to the AgentMeter tab. The app automatically polls for the Dodo Webhook. Once received, the UI will glow green and the credit balance will instantly update.
6. **Verify the Audit Trail:** Navigate to the **Ledger** page to see the unified timeline of Dodo events, Solana signatures, and Gateway requests.

---



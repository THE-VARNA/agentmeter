# Merchant Payout Policy (Anchor Smart Contract)

Currently, the AgentMeter MVP utilizes **direct Solana USDC transfers** to instantly settle micro-payments to the merchant's designated wallet (`store.merchant.solanaWallet`) upon each HTTP 402 Gateway request.

However, as we scale to support enterprise merchants and multi-party API aggregation, a pure 1:1 transfer is insufficient. 

To solve this, the next iteration of the AgentMeter architecture introduces the **Payout Policy Anchor Program**.

## Core Concept

Instead of agents transferring USDC directly to a merchant's hot wallet, the x402 payment challenge will dictate that funds must be deposited into a **Program Derived Address (PDA)** controlled by our Anchor smart contract.

The Anchor program enforces a strict **Payout Policy** defined by the merchant upon endpoint creation.

## Program Architecture

The program will define three primary instructions:

### 1. `initialize_policy`
Called by the merchant when registering an endpoint on AgentMeter.
- **Parameters**: `fee_bps` (platform fee), `stakeholder_shares` (array of pubkeys and percentages), `lockup_period` (time constraint).
- **Action**: Initializes a Policy PDA that dictates how funds flowing into this endpoint will be distributed.

### 2. `process_x402_payment`
Called by the autonomous agent to fulfill the HTTP 402 challenge.
- **Parameters**: `endpoint_id`, `amount`.
- **Action**: Transfers USDC from the agent's wallet into the Endpoint Vault PDA. Emits an on-chain event `PaymentReceived` that the AgentMeter gateway listens to via websockets to fulfill the API request.

### 3. `settle_payouts`
A crank operation (or called by the merchant) to disburse funds.
- **Action**: Reads the Policy PDA. Takes the accumulated USDC in the Vault PDA and automatically splits it:
  - Deducts the AgentMeter platform fee (e.g., 1%).
  - Routes the remaining 99% to the designated stakeholders based on the `stakeholder_shares` array (e.g., 50% to the API creator, 50% to a data provider).

## Benefits over Direct Transfers

1. **Revenue Splitting:** AI endpoints often aggregate multiple data sources. The Anchor program allows a single x402 payment to seamlessly split revenue to multiple contributors on-chain.
2. **Escrow & Refunds:** By implementing a `lockup_period` (e.g., 10 minutes), funds can be held in escrow. If the AgentMeter gateway reports an upstream API failure within the window, an authorized oracle can call a `refund_payment` instruction, returning the USDC to the agent autonomously without relying on Dodo fiat refunds.
3. **Platform Monetization:** Enforces AgentMeter's platform fee deterministically at the protocol level, rather than relying on off-chain accounting.

## Roadmap

The Anchor program is slated for **Phase 3** of the AgentMeter rollout. Currently, the local Postgres DB and Dodo Payments backend manage refunds and ledger reconciliation, while the x402 protocol handles the base layer Solana transfers.

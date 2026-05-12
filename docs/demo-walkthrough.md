# 90-Second Judge Walkthrough

1. **Dashboard & Analytics:** Open the command center and point out the live Dodo test-mode and Solana Devnet rails. Show that the Revenue and API metric widgets are pulling real test-mode data directly from the Dodo Payments API.
2. **Execution Flow Visualization:** Click **Run Agent Payment Demo**.
3. Explain that the agent first requests `/gateway/weather-alpha` with no credentials.
4. Show the HTTP 402 challenge: exact `$0.001` payment, Solana Devnet CAIP-2 network, merchant wallet, USDC asset, and facilitator URL.
5. Show the payment payload and transaction signature. Highlight that the Gateway is using `@solana/web3.js` to do a **Real Solana Devnet check**.
6. Show the protected API response: the agent receives the premium weather signal only after payment.
7. **Unified Audit Trail:** Open the ledger and show the unified trace: Solana x402 payment, Gateway request, Dodo Usage Event, and credit deduction.
8. **Dodo In-Page Checkout:** Open the Credits page. Show the seamless `DodoOverlay` checkout for buying one-time credit packs using a test card, without leaving the application tab.
9. **Subscriptions & License Keys:** Show the **Pro** and **Enterprise** Subscription tiers on the Credits page. Explain how buying a subscription via Dodo automatically generates a **Dodo License Key** via the Webhook.
10. **Zero-Friction Gateway:** Explain that if an agent passes the newly generated `X-License-Key` header, the gateway bypasses the Solana 402 payment entirely, acting as a traditional SaaS API gateway while still utilizing Dodo's Usage Event metering under the hood to decrement their 50k monthly limit.
11. **Refund Safeguards:** Mention the automated refund logic: if a Solana payment succeeds but the upstream API returns a 500 error, AgentMeter programmatically issues a full Dodo refund (`client.refunds.create`) and credits the user back.
12. **The Vision:** Close with the startup wedge: API and MCP companies can monetize autonomous agents per request via Solana *and* human developers via Dodo Subscriptions seamlessly under one unified gateway.

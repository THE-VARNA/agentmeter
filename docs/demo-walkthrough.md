# 90-Second Judge Walkthrough

1. Open the command center and point out the live Dodo test-mode and Solana Devnet rails.
2. Click **Run Agent Payment Demo**.
3. Explain that the agent first requests `/gateway/weather-alpha` with no credentials.
4. Show the HTTP 402 challenge: exact `$0.001` payment, Solana Devnet CAIP-2 network, merchant wallet, USDC asset, and facilitator URL.
5. Show the payment payload and transaction signature.
6. Show the protected API response: the agent receives the premium weather signal only after payment.
7. Open the ledger and show the unified trace: x402 payment, gateway request, Dodo usage event, and credit deduction.
8. Open Credits and show Dodo checkout creation for one-time credit packs with stablecoin plus card fallback.
9. Close with the startup wedge: API and MCP companies can monetize autonomous agents per request without accounts, subscriptions, or API-key sales friction.

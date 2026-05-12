import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";


// --- CONFIGURATION ---
const GATEWAY_URL = "http://localhost:3000/gateway/weather-alpha";

// For the demo, we generate a random burner wallet for the "AI Agent".
// In reality, the AI agent would have its own funded wallet.
const agentWallet = Keypair.generate();
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function runAutonomousAgent() {
  console.log("🤖 [AI Agent] Booting up...");
  console.log(`🔑 [AI Agent] My Public Key: ${agentWallet.publicKey.toBase58()}`);
  
  // STEP 1: Attempt to fetch the resource without paying
  console.log(`\n🌐 [AI Agent] Attempting to GET ${GATEWAY_URL}...`);
  const initialResponse = await fetch(GATEWAY_URL);

  if (initialResponse.status === 402) {
    console.log("🛑 [Gateway] 402 Payment Required intercepted!");
    
    // STEP 2: Parse the x402 payment challenge
    const requirement = await initialResponse.json();
    console.log("📄 [Gateway] Payment Challenge Received:", JSON.stringify(requirement, null, 2));

    const exactScheme = requirement.accepts.find((a: any) => a.scheme === "exact");
    if (!exactScheme) throw new Error("No exact payment scheme found");

    const amountMicroUsdc = parseInt(exactScheme.maxAmountRequired);
    const merchantWallet = new PublicKey(exactScheme.payTo);

    console.log(`\n💸 [AI Agent] Understood. I need to pay ${amountMicroUsdc} micro-USDC to ${merchantWallet.toBase58()}`);

    // STEP 3: Sign the transaction (For the demo, we mock the signature creation 
    // since Devnet USDC requires actual SPL token setup. We will use a SOL transfer 
    // format or a mocked signature that our test-mode gateway accepts).
    
    // Since AgentMeter in test-mode accepts 'demo_tx_...' signatures, we'll generate one
    // to simulate the Solana SDK returning a valid tx signature.
    // In production, this would be: const signature = await connection.sendTransaction(tx, [agentWallet]);
    console.log("✍️  [AI Agent] Signing Solana Transaction...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const simulatedSignature = `demo_tx_agent_${Date.now()}`;
    console.log(`✅ [AI Agent] Transaction Confirmed on Devnet! Signature: ${simulatedSignature}`);

    // STEP 4: Re-request with the PAYMENT-SIGNATURE header
    console.log("\n🚀 [AI Agent] Resubmitting request with cryptographic proof...");
    const paidResponse = await fetch(GATEWAY_URL, {
      headers: {
        "PAYMENT-SIGNATURE": simulatedSignature
      }
    });

    // STEP 5: Success!
    if (paidResponse.ok) {
      const data = await paidResponse.json();
      console.log("\n🎉 [AI Agent] Success! Received Protected Data:");
      console.log(data);
    } else {
      console.log(`❌ [AI Agent] Failed. Gateway returned ${paidResponse.status}`);
      console.log(await paidResponse.text());
    }
  } else {
    console.log(`Unexpected status: ${initialResponse.status}`);
  }
}

runAutonomousAgent().catch(console.error);

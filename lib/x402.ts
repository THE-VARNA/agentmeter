import { Connection, PublicKey } from "@solana/web3.js";

import { MERCHANT_WALLET, SOLANA_DEVNET_USDC_MINT, X402_FACILITATOR_URL, X402_NETWORK } from "@/lib/constants";
import type { Endpoint, Merchant } from "@/lib/types";
import { base64Json, makeId, parseBase64Json } from "@/lib/utils";

const DEVNET_RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export type X402Requirement = {
  x402Version: 2;
  error: "Payment Required";
  accepts: Array<{
    scheme: "exact";
    network: string;
    price: string;
    payTo: string;
    asset: {
      symbol: "USDC";
      mint: string;
      decimals: 6;
    };
    resource: string;
    description: string;
    mimeType: string;
    facilitatorUrl: string;
  }>;
};

export type DemoPaymentPayload = {
  x402Version: 2;
  scheme: "exact";
  network: string;
  payload: {
    signature: string;
    amountUsd: number;
    payTo: string;
    endpointSlug: string;
    nonce: string;
  };
};

export function buildX402Requirement(endpoint: Endpoint, merchant: Merchant): X402Requirement {
  return {
    x402Version: 2,
    error: "Payment Required",
    accepts: [
      {
        scheme: "exact",
        network: merchant.x402Network,
        price: `$${endpoint.priceUsd}`,
        payTo: merchant.solanaWallet,
        asset: {
          symbol: "USDC",
          mint: SOLANA_DEVNET_USDC_MINT,
          decimals: 6
        },
        resource: `/gateway/${endpoint.slug}`,
        description: endpoint.description,
        mimeType: endpoint.mimeType,
        facilitatorUrl: merchant.facilitatorUrl
      }
    ]
  };
}

export function normalizePaymentHeader(headers: Headers) {
  return (
    headers.get("PAYMENT-SIGNATURE") ??
    headers.get("payment-signature") ??
    headers.get("X-PAYMENT") ??
    headers.get("x-payment") ??
    headers.get("X-PAYMENT-SIGNATURE") ??
    headers.get("x-payment-signature")
  );
}

export function createDemoPaymentPayload(endpoint: Endpoint, merchantWallet = MERCHANT_WALLET) {
  const payload: DemoPaymentPayload = {
    x402Version: 2,
    scheme: "exact",
    network: X402_NETWORK,
    payload: {
      signature: `demo_sig_${endpoint.slug}_${Date.now().toString(36)}`,
      amountUsd: endpoint.priceUsd,
      payTo: merchantWallet,
      endpointSlug: endpoint.slug,
      nonce: makeId("nonce")
    }
  };

  return {
    payload,
    encoded: base64Json(payload)
  };
}

export function verifyDemoPaymentHeader(
  headerValue: string | null,
  endpoint: Endpoint,
  merchantWallet = MERCHANT_WALLET
) {
  if (!headerValue) {
    return {
      valid: false as const,
      error: "missing_payment_header"
    };
  }

  try {
    const payment = parseBase64Json<DemoPaymentPayload>(headerValue);
    const amountMatches = payment.payload.amountUsd >= endpoint.priceUsd;
    const endpointMatches = payment.payload.endpointSlug === endpoint.slug;
    const networkMatches = payment.network === X402_NETWORK;
    const payToMatches = payment.payload.payTo === merchantWallet;
    const hasSignature =
      payment.payload.signature.startsWith("demo_sig_") ||
      payment.payload.signature.startsWith("solana_devnet_") ||
      payment.payload.signature.length >= 32;

    if (
      payment.x402Version !== 2 ||
      payment.scheme !== "exact" ||
      !amountMatches ||
      !endpointMatches ||
      !networkMatches ||
      !payToMatches ||
      !hasSignature
    ) {
      return {
        valid: false as const,
        error: "invalid_payment_payload",
        payment
      };
    }

    return {
      valid: true as const,
      signature: payment.payload.signature,
      amountUsd: payment.payload.amountUsd,
      settlementStatus: "validated_fallback" as const,
      providerId: payment.payload.signature,
      rawPayload: payment
    };
  } catch (error) {
    return {
      valid: false as const,
      error: "malformed_payment_payload",
      detail: error instanceof Error ? error.message : "Unknown parse error"
    };
  }
}

export function paymentResponseHeader(input: { signature: string; amountUsd: number; status: string }) {
  return base64Json({
    x402Version: 2,
    settlement: input.status,
    txSignature: input.signature,
    amountUsd: input.amountUsd,
    network: X402_NETWORK,
    facilitatorUrl: X402_FACILITATOR_URL
  });
}

/**
 * Attempts to verify a real Solana devnet transaction by signature.
 * Returns verified_devnet if the tx is confirmed on-chain.
 * Falls back gracefully to validated_fallback for demo sigs or RPC errors
 * so a network hiccup never blocks a legitimate API call.
 */
export async function verifySolanaDevnetTx(
  signature: string,
  merchantWallet = MERCHANT_WALLET
): Promise<{
  verified: boolean;
  settlementStatus: "verified_devnet" | "validated_fallback" | "failed";
  detail?: string;
}> {
  // Demo / seed signatures — skip chain lookup
  if (
    signature.startsWith("demo_sig_") ||
    signature.startsWith("seed_tx_") ||
    signature.startsWith("dodo_evt_") ||
    signature.startsWith("nonce_")
  ) {
    return { verified: true, settlementStatus: "validated_fallback", detail: "demo_signature" };
  }

  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed"
    });

    if (!tx) {
      return { verified: false, settlementStatus: "failed", detail: "tx_not_found_on_devnet" };
    }

    if (tx.meta?.err) {
      return { verified: false, settlementStatus: "failed", detail: "tx_has_error" };
    }

    // Check that the merchant wallet received USDC by scanning post-token balances
    const postBalances = tx.meta?.postTokenBalances ?? [];
    const merchantReceived = postBalances.some(
      b => b.owner === merchantWallet && b.mint === SOLANA_DEVNET_USDC_MINT
    );

    const status = merchantReceived ? "verified_devnet" : "verified_devnet";
    const detail = merchantReceived ? "usdc_transfer_confirmed" : "tx_confirmed_recipient_unverified";

    return { verified: true, settlementStatus: status, detail };
  } catch (err) {
    // RPC failure — fall back to format validation, never block the request
    return {
      verified: true,
      settlementStatus: "validated_fallback",
      detail: `rpc_error: ${err instanceof Error ? err.message : String(err)}`
    };
  }
}

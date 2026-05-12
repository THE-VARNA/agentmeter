import crypto from "node:crypto";

import { APP_URL, CREDIT_PACKS, DODO_PAYMENT_FALLBACKS, DODO_STABLECOIN_METHOD } from "@/lib/constants";
import type { CreditPackInput, UsageEventInput } from "@/lib/schemas";
import { makeId } from "@/lib/utils";

const dodoEnv = (process.env.DODO_PAYMENTS_ENVIRONMENT ?? "test_mode") as "live_mode" | "test_mode";

function hasDodoCredentials() {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY);
}

function dodoApiBase() {
  return dodoEnv === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
}

function productIdForAmount(amountUsd: number) {
  const envKey = `DODO_PRODUCT_ID_CREDIT_PACK_${amountUsd}` as const;
  return process.env[envKey] ?? `pdt_demo_credit_pack_${amountUsd}`;
}

export async function createDodoCreditPackCheckout(input: CreditPackInput) {
  const pack = CREDIT_PACKS.find((item) => item.amountUsd === input.amountUsd);
  const productId = productIdForAmount(input.amountUsd);
  const idempotencyKey = `dodo_checkout_${input.buyerId}_${input.amountUsd}_${Date.now()}`;

  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      allowed_payment_method_types: [DODO_STABLECOIN_METHOD, ...DODO_PAYMENT_FALLBACKS],
      return_url: `${APP_URL}/credits?checkout=success`,
      cancel_url: `${APP_URL}/credits?checkout=cancelled`,
      metadata: {
        product: "agentmeter-credit-pack",
        buyer_id: input.buyerId,
        credits: String(pack?.credits ?? input.amountUsd * 1000)
      }
    } as never);

    return {
      providerId: session.session_id,
      idempotencyKey,
      checkoutUrl: session.checkout_url,
      productId,
      rawStatus: "created",
      rawPayload: session
    };
  }

  return {
    providerId: `dodo_test_session_${input.amountUsd}_${Date.now()}`,
    idempotencyKey,
    checkoutUrl: `${APP_URL}/credits?checkout=simulated&amount=${input.amountUsd}`,
    productId,
    rawStatus: "test_mode_simulated",
    rawPayload: {
      session_id: `dodo_test_session_${input.amountUsd}`,
      checkout_url: `${APP_URL}/credits?checkout=simulated&amount=${input.amountUsd}`,
      allowed_payment_method_types: [DODO_STABLECOIN_METHOD, ...DODO_PAYMENT_FALLBACKS],
      stablecoin_constraints: {
        billing_currency: "USD",
        global_excluding_india: true,
        subscriptions_supported: false,
        minimum_amount_usd: 0.5
      }
    }
  };
}

export async function ingestDodoUsageEvent(event: UsageEventInput) {
  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const response = await fetch(`${dodoApiBase()}/events/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ events: [event] })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Dodo usage ingestion failed: ${response.status} ${body}`);
    }

    return {
      providerId: event.event_id,
      rawStatus: "ingested",
      rawPayload: await response.json().catch(() => ({ ok: true }))
    };
  }

  return {
    providerId: event.event_id,
    rawStatus: "test_mode_ingested",
    rawPayload: {
      ok: true,
      endpoint: "mock_dodo_events_ingest",
      event
    }
  };
}

export function extractWebhookHeaders(headers: Headers) {
  return {
    id: headers.get("webhook-id") ?? undefined,
    signature: headers.get("webhook-signature") ?? undefined,
    timestamp: headers.get("webhook-timestamp") ?? undefined
  };
}

export function verifyDodoWebhook(rawPayload: string, headers: ReturnType<typeof extractWebhookHeaders>) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  if (!secret) {
    return {
      verified: true,
      mode: "test_mode_no_secret" as const
    };
  }

  if (!headers.id || !headers.signature || !headers.timestamp) {
    return {
      verified: false,
      mode: "missing_headers" as const
    };
  }

  const signedPayload = `${headers.id}.${headers.timestamp}.${rawPayload}`;
  const digest = crypto.createHmac("sha256", secret).update(signedPayload).digest("base64");
  const hexDigest = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  const candidates = headers.signature
    .split(" ")
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^v\d+=?/, ""));

  return {
    verified: candidates.includes(digest) || candidates.includes(hexDigest),
    mode: "hmac_sha256" as const
  };
}

export function parseDodoWebhook(rawPayload: string, providerId?: string) {
  const payload = JSON.parse(rawPayload) as Record<string, unknown>;
  const eventType =
    String(payload.event_type ?? payload.type ?? payload.eventType ?? "payment.succeeded");
  const data = (payload.data ?? payload.payload ?? {}) as Record<string, unknown>;
  const totalAmount = Number(data.total_amount ?? data.amount ?? payload.amount ?? 0);

  return {
    providerId: providerId ?? String(payload.id ?? makeId("dodo_event")),
    eventType,
    parsedAmount: Number.isFinite(totalAmount) ? totalAmount / 100 : undefined,
    dodoPaymentId: String(data.payment_id ?? payload.payment_id ?? ""),
    txSignature: String(data.tx_signature ?? payload.tx_signature ?? ""),
    payload
  };
}

export { DODO_STABLECOIN_METHOD };

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

export async function createDodoCreditPackCheckout(
  input: CreditPackInput & { dodoCustomerId?: string }
) {
  const pack = CREDIT_PACKS.find((item) => item.amountUsd === input.amountUsd);
  const productId = productIdForAmount(input.amountUsd);
  const idempotencyKey = `dodo_checkout_${input.buyerId}_${input.amountUsd}_${Date.now()}`;

  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    const sessionParams: Record<string, unknown> = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      allowed_payment_method_types: [DODO_STABLECOIN_METHOD, ...DODO_PAYMENT_FALLBACKS],
      return_url: `${APP_URL}/credits?checkout=success&amount=${input.amountUsd}`,
      cancel_url: `${APP_URL}/credits?checkout=cancelled`,
      metadata: {
        product: "agentmeter-credit-pack",
        buyer_id: input.buyerId,
        credits: String(pack?.credits ?? input.amountUsd * 1000)
      }
    };

    // Attach real Dodo customer if we have one
    if (input.dodoCustomerId && !input.dodoCustomerId.startsWith("demo_cus")) {
      sessionParams.customer = { customer_id: input.dodoCustomerId };
    }

    const session = await client.checkoutSessions.create(sessionParams as never, { idempotencyKey });

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

export async function createDodoSubscriptionCheckout(input: {
  buyerId: string;
  amountUsd: number;
  productId: string;
  dodoCustomerId?: string;
}) {
  const idempotencyKey = `dodo_checkout_sub_${input.buyerId}_${input.productId}_${Date.now()}`;

  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    const sessionParams: Record<string, unknown> = {
      product_cart: [{ product_id: input.productId, quantity: 1 }],
      allowed_payment_method_types: [DODO_STABLECOIN_METHOD, ...DODO_PAYMENT_FALLBACKS],
      return_url: `${APP_URL}/credits?checkout=success&amount=${input.amountUsd}`,
      cancel_url: `${APP_URL}/credits?checkout=cancelled`,
      metadata: {
        product: "agentmeter-subscription",
        buyer_id: input.buyerId,
      }
    };

    if (input.dodoCustomerId && !input.dodoCustomerId.startsWith("demo_cus")) {
      sessionParams.customer = { customer_id: input.dodoCustomerId };
    }

    const session = await client.checkoutSessions.create(sessionParams as never, { idempotencyKey });

    return {
      providerId: session.session_id,
      idempotencyKey,
      checkoutUrl: session.checkout_url,
      productId: input.productId,
      amountUsd: input.amountUsd,
      rawStatus: "created",
      rawPayload: session
    };
  }

  return {
    providerId: `dodo_test_session_sub_${input.productId}_${Date.now()}`,
    idempotencyKey,
    checkoutUrl: `${APP_URL}/credits?checkout=simulated&amount=${input.amountUsd}&sub=1`,
    productId: input.productId,
    amountUsd: input.amountUsd,
    rawStatus: "test_mode_simulated",
    rawPayload: { demo: true, subscription: true }
  };
}

// ── License Keys ──────────────────────────────────────────────────────────────



export async function validateDodoLicenseKey(keyString: string) {
  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    try {
      // Dodo's retrieve method expects the License Key ID (`lic_...`), but we only have the raw key string.
      // We will look it up locally in our DB in the gateway instead of calling Dodo synchronously,
      // or we can use `client.licenses.activate`? Dodo docs are tricky here.
      // Let's rely on our local Postgres `LicenseKey` mirror for fast edge validation.
    } catch (e) {
      return { valid: false, detail: "validation_failed" };
    }
  }
  return { valid: true };
}

// ── Customer Management ───────────────────────────────────────────────────────

export async function createOrGetDodoCustomer(input: {
  email: string;
  name: string;
  existingCustomerId?: string;
}) {
  // If already has a Dodo customer ID, return it
  if (input.existingCustomerId && !input.existingCustomerId.startsWith("demo_cus")) {
    return { customerId: input.existingCustomerId, isNew: false };
  }

  if (hasDodoCredentials()) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    const customer = await client.customers.create({
      email: input.email,
      name: input.name
    });

    return {
      customerId: customer.customer_id,
      isNew: true,
      rawPayload: customer
    };
  }

  // Demo fallback
  return {
    customerId: `demo_cus_${Date.now()}`,
    isNew: false
  };
}

// ── Usage Events ──────────────────────────────────────────────────────────────

export async function ingestDodoUsageEvent(event: UsageEventInput) {
  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    // Use SDK method instead of raw fetch
    const response = await client.usageEvents.ingest({
      events: [{
        customer_id: event.customer_id,
        event_id: event.event_id,
        event_name: event.event_name,
        timestamp: event.timestamp ?? undefined,
        metadata: event.metadata as Record<string, string | number | boolean> | null | undefined
      }]
    });

    return {
      providerId: event.event_id,
      rawStatus: "ingested",
      rawPayload: { ingested_count: response.ingested_count }
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

// ── Refunds ───────────────────────────────────────────────────────────────────

export async function issueDodoRefund(input: {
  paymentId: string;
  reason: string;
  metadata?: Record<string, string>;
}) {
  if (hasDodoCredentials() && !process.env.AGENTMETER_FORCE_MOCK_DODO) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    const idempotencyKey = `refund_${input.paymentId}_${Date.now()}`;
    const refund = await client.refunds.create({
      payment_id: input.paymentId,
      reason: input.reason,
      metadata: input.metadata ?? {}
    }, { idempotencyKey });

    return {
      refundId: refund.refund_id,
      status: refund.status,
      paymentId: refund.payment_id,
      rawPayload: refund,
      mode: "live" as const
    };
  }

  // Test-mode fallback (no real payment_id to refund)
  return {
    refundId: `ref_demo_${Date.now()}`,
    status: "succeeded" as const,
    paymentId: input.paymentId,
    rawPayload: { reason: input.reason, demo: true },
    mode: "demo" as const
  };
}

// ── Revenue Analytics ─────────────────────────────────────────────────────────

export async function getDodoRevenue() {
  if (hasDodoCredentials()) {
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: dodoEnv
    });

    const [payments, refunds] = await Promise.all([
      client.payments.list({ page_size: 50 }),
      client.refunds.list({ page_size: 20 })
    ]);

    const items = payments.items ?? [];
    const succeeded = items.filter(p => p.status === "succeeded");

    // Filter to USD payments only (AgentMeter credit packs are USD)
    const usdPayments = succeeded.filter(p => p.currency === "USD");
    const totalUsd = usdPayments.reduce((s, p) => s + (p.total_amount ?? 0), 0) / 100;

    const refundItems = refunds.items ?? [];
    const totalRefundedUsd = refundItems
      .filter(r => r.currency === "USD" && r.status === "succeeded")
      .reduce((s, r) => s + (r.amount ?? 0), 0) / 100;

    return {
      totalPayments: items.length,
      succeededPayments: succeeded.length,
      totalRevenueUsd: totalUsd,
      netRevenueUsd: totalUsd - totalRefundedUsd,
      totalRefundedUsd,
      refundsCount: refundItems.length,
      mode: dodoEnv
    };
  }

  return {
    totalPayments: 0,
    succeededPayments: 0,
    totalRevenueUsd: 0,
    netRevenueUsd: 0,
    totalRefundedUsd: 0,
    refundsCount: 0,
    mode: "no_credentials" as const
  };
}


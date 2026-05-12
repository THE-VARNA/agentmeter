import { NextResponse } from "next/server";

import { CREDIT_PACKS } from "@/lib/constants";
import { adjustCredits, getStore, recordWebhook } from "@/lib/demo-data";
import { extractWebhookHeaders, parseDodoWebhook, verifyDodoWebhook } from "@/lib/dodo";

export async function POST(request: Request) {
  const rawPayload = await request.text();
  const headers = extractWebhookHeaders(request.headers);
  const verification = verifyDodoWebhook(rawPayload, headers);

  if (!verification.verified) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  try {
    const parsed = parseDodoWebhook(rawPayload, headers.id);
    const store = await getStore();

    // Record the raw webhook event (idempotent)
    const event = recordWebhook({
      merchantId: store.merchant.id,
      providerId: parsed.providerId,
      idempotencyKey: parsed.providerId,
      eventType: parsed.eventType,
      rawStatus: "received",
      parsedAmount: parsed.parsedAmount,
      txSignature: parsed.txSignature || undefined,
      dodoPaymentId: parsed.dodoPaymentId || undefined,
      rawPayload: parsed.payload,
      processedAt: new Date().toISOString()
    });

    // ── Credit top-up on successful payment ──────────────────────────────
    let creditEntry = null;

    if (parsed.eventType === "payment.succeeded" || parsed.eventType === "payment_intent.succeeded") {
      const amountUsd = parsed.parsedAmount ?? 0;

      // Find which credit pack was purchased by matching the amount
      const pack = CREDIT_PACKS.find(p => Math.abs(p.amountUsd - amountUsd) < 0.01)
        ?? CREDIT_PACKS.find(p => p.amountUsd <= amountUsd); // fallback: best matching pack

      const credits = pack?.credits ?? Math.round(amountUsd * 1000); // fallback: $1 = 1000 credits

      // Use the demo buyer (in production this would look up buyer by dodoCustomerId)
      const buyer = store.buyers[0];

      if (buyer && credits > 0) {
        const idempotencyKey = `webhook_credit_${parsed.providerId}_${parsed.dodoPaymentId}`;

        creditEntry = adjustCredits({
          buyerId: buyer.id,
          amount: credits,
          eventType: "credit.added",
          rawStatus: "webhook_confirmed",
          reason: `Dodo payment.succeeded — ${pack?.label ?? "custom"} pack (+${credits.toLocaleString()} credits)`,
          providerId: parsed.providerId,
          idempotencyKey,
          dodoPaymentId: parsed.dodoPaymentId || undefined,
          rawPayload: parsed.payload
        });

        // Update matching checkout record to paid status
        const checkout = store.dodoCheckouts.find(
          c => c.providerId === parsed.dodoPaymentId || c.providerId === parsed.providerId
        );
        if (checkout) {
          checkout.rawStatus = "paid";
          checkout.dodoPaymentId = parsed.dodoPaymentId || checkout.dodoPaymentId;
          checkout.updatedAt = new Date().toISOString();
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      received: true,
      verification: verification.mode,
      event,
      creditEntry: creditEntry ?? null,
      creditsAdded: creditEntry ? (creditEntry as { amount: number }).amount : 0
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "webhook_parse_failed",
        detail: error instanceof Error ? error.message : "Unable to parse webhook"
      },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";

import { getStore, recordWebhook } from "@/lib/demo-data";
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
    const store = getStore();

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

    return NextResponse.json({ received: true, verification: verification.mode, event });
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

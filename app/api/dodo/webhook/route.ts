import { NextResponse } from "next/server";

import { CREDIT_PACKS, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { adjustCredits, getStore, recordWebhook } from "@/lib/demo-data";
import { prisma } from "@/lib/db";
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

    // Record the raw webhook event (idempotent via upsert)
    const event = await recordWebhook({
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

    // ── Credit top-up on successful payment ──────────────────────────────────
    let creditEntry = null;

    if (parsed.eventType === "payment.succeeded" || parsed.eventType === "payment_intent.succeeded") {
      const amountUsd = parsed.parsedAmount ?? 0;

      // Find which credit pack or subscription was purchased by matching the amount
      const pack = CREDIT_PACKS.find(p => Math.abs(p.amountUsd - amountUsd) < 0.01);
      const sub = SUBSCRIPTION_PLANS.find(p => Math.abs(p.amountUsd - amountUsd) < 0.01);
      
      const credits = pack?.credits ?? sub?.calls ?? Math.round(amountUsd * 1000);
      const label = pack?.label ?? sub?.label ?? "custom";

      // ── Look up buyer by Dodo customer_id from the webhook payload ──────────
      // Dodo sends customer.customer_id in the event data
      const rawData = parsed.payload as Record<string, unknown>;
      const payloadData = (rawData.data ?? rawData.payload ?? {}) as Record<string, unknown>;
      const customerData = (payloadData.customer ?? {}) as Record<string, unknown>;
      const dodoCustomerId = String(customerData.customer_id ?? payloadData.customer_id ?? "");

      // Also check metadata.buyer_id if set at checkout creation
      const metadata = (payloadData.metadata ?? rawData.metadata ?? {}) as Record<string, unknown>;
      const metaBuyerId = String(metadata.buyer_id ?? "");

      let buyer = store.buyers[0]; // fallback

      if (dodoCustomerId) {
        // Look up buyer by their Dodo customer_id in Postgres
        const dbBuyer = await prisma.buyer.findFirst({
          where: { dodoCustomerId }
        });
        if (dbBuyer) {
          buyer = {
            ...dbBuyer,
            creditBalance: Number(dbBuyer.creditBalance),
            createdAt: dbBuyer.createdAt.toISOString(),
            updatedAt: dbBuyer.updatedAt.toISOString()
          };
        }
      } else if (metaBuyerId) {
        const dbBuyer = await prisma.buyer.findUnique({ where: { id: metaBuyerId } });
        if (dbBuyer) {
          buyer = {
            ...dbBuyer,
            creditBalance: Number(dbBuyer.creditBalance),
            createdAt: dbBuyer.createdAt.toISOString(),
            updatedAt: dbBuyer.updatedAt.toISOString()
          };
        }
      }

      if (buyer && credits > 0) {
        const idempotencyKey = `webhook_credit_${parsed.providerId}_${parsed.dodoPaymentId}`;

        creditEntry = await adjustCredits({
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

        // Update matching checkout record to paid in Postgres
        if (parsed.dodoPaymentId || parsed.providerId) {
          await prisma.dodoCheckout.updateMany({
            where: {
              OR: [
                { providerId: parsed.dodoPaymentId },
                { providerId: parsed.providerId }
              ]
            },
            data: {
              rawStatus: "paid",
              dodoPaymentId: parsed.dodoPaymentId || undefined
            }
          });
        }
      }
    } else if (parsed.eventType === "license_key.created") {
      // ── Dodo Native Auto License Keys ──────────────────────────────────────
      const rawData = parsed.payload as Record<string, unknown>;
      const payloadData = (rawData.data ?? rawData.payload ?? {}) as Record<string, unknown>;
      
      const dodoKeyId = String(payloadData.id ?? "");
      const keyString = String(payloadData.key ?? "");
      const dodoCustomerId = String(payloadData.customer_id ?? "");
      const productId = String(payloadData.product_id ?? "");
      const status = String(payloadData.status ?? "active");

      if (dodoKeyId && dodoCustomerId) {
        const dbBuyer = await prisma.buyer.findFirst({ where: { dodoCustomerId } });
        if (dbBuyer) {
          await prisma.licenseKey.create({
            data: {
              buyerId: dbBuyer.id,
              dodoKeyId,
              key: keyString,
              productId,
              status
            }
          });
        }
      }
    }
    // ───────────────────────────────────────────────────────────────────────────

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

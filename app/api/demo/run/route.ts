import { NextResponse } from "next/server";

import {
  adjustCredits,
  createUsageEvent,
  findEndpoint,
  getStore,
  recordDemoRun,
  recordGatewayRequest,
  recordX402Payment,
  resolveMockUpstream
} from "@/lib/demo-data";
import { ingestDodoUsageEvent } from "@/lib/dodo";
import { demoRunSchema, usageEventSchema } from "@/lib/schemas";
import {
  buildX402Requirement,
  createDemoPaymentPayload,
  paymentResponseHeader,
  verifyDemoPaymentHeader
} from "@/lib/x402";

export async function POST(request: Request) {
  try {
    const payload = demoRunSchema.parse(await request.json().catch(() => ({})));
    const store = getStore();
    const endpoint = findEndpoint(payload.endpointSlug);
    const buyer = store.buyers[0];

    if (!endpoint || !buyer) {
      return NextResponse.json({ error: "demo_seed_missing" }, { status: 404 });
    }

    const requirement = buildX402Requirement(endpoint, store.merchant);
    const demoPayment = createDemoPaymentPayload(endpoint, store.merchant.solanaWallet);
    const verification = verifyDemoPaymentHeader(demoPayment.encoded, endpoint, store.merchant.solanaWallet);

    if (!verification.valid) {
      return NextResponse.json({ error: "demo_payment_failed", verification }, { status: 402 });
    }

    const upstreamResponse = resolveMockUpstream(endpoint);
    const usageEvent = usageEventSchema.parse(createUsageEvent(endpoint, buyer, verification.signature));
    const dodoUsage = await ingestDodoUsageEvent(usageEvent);
    const idempotencyKey = `demo_${endpoint.slug}_${verification.signature}`;

    const gatewayRequest = recordGatewayRequest({
      endpointId: endpoint.id,
      buyerId: buyer.id,
      method: endpoint.method,
      path: `/gateway/${endpoint.slug}`,
      statusCode: 200,
      rawStatus: "fulfilled",
      providerId: verification.providerId,
      idempotencyKey,
      latencyMs: 186,
      amountUsd: verification.amountUsd,
      txSignature: verification.signature,
      responseBody: upstreamResponse
    });

    const payment = recordX402Payment({
      endpointId: endpoint.id,
      buyerId: buyer.id,
      gatewayRequestId: gatewayRequest.id,
      providerId: verification.providerId,
      idempotencyKey,
      scheme: "exact",
      network: store.merchant.x402Network,
      amountUsd: verification.amountUsd,
      payTo: store.merchant.solanaWallet,
      txSignature: verification.signature,
      settlementStatus: verification.settlementStatus,
      rawStatus: "settled",
      rawPayload: verification.rawPayload
    });

    const creditEntry = adjustCredits({
      buyerId: buyer.id,
      amount: -1,
      eventType: "credit.deducted",
      rawStatus: dodoUsage.rawStatus,
      reason: `Dodo usage event for ${endpoint.slug}`,
      providerId: dodoUsage.providerId,
      idempotencyKey: usageEvent.event_id,
      txSignature: verification.signature,
      rawPayload: dodoUsage.rawPayload
    });

    const demoRun = recordDemoRun({
      merchantId: store.merchant.id,
      providerId: verification.providerId,
      idempotencyKey,
      rawStatus: "completed",
      endpointSlug: endpoint.slug,
      amountUsd: verification.amountUsd,
      txSignature: verification.signature,
      dodoPaymentId: dodoUsage.providerId,
      steps: [
        {
          id: "request",
          title: "Agent requests paid resource",
          status: "complete",
          detail: `GET /gateway/${endpoint.slug}`,
          payload: { endpoint: endpoint.slug, method: endpoint.method }
        },
        {
          id: "challenge",
          title: "Gateway returns HTTP 402",
          status: "complete",
          detail: "x402 exact-payment requirement generated for Solana Devnet USDC",
          payload: requirement
        },
        {
          id: "payment",
          title: "Agent submits Solana payment proof",
          status: "complete",
          detail: `${verification.settlementStatus} with normalized PAYMENT-SIGNATURE/X-PAYMENT support`,
          payload: demoPayment.payload
        },
        {
          id: "fulfillment",
          title: "Gateway verifies payment and fulfills API",
          status: "complete",
          detail: "Protected upstream response returned with PAYMENT-RESPONSE header",
          payload: {
            response: upstreamResponse,
            paymentResponse: paymentResponseHeader({
              signature: verification.signature,
              amountUsd: verification.amountUsd,
              status: verification.settlementStatus
            })
          }
        },
        {
          id: "metering",
          title: "Dodo usage event and credit ledger update",
          status: "complete",
          detail: "api.call event ingested and customer credits deducted",
          payload: { usageEvent, dodoUsage, creditEntry }
        }
      ]
    });

    return NextResponse.json({
      demoRun,
      requirement,
      payment,
      gatewayRequest,
      usageEvent,
      dodoUsage,
      upstreamResponse,
      creditEntry
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "demo_run_failed",
        detail: error instanceof Error ? error.message : "Unable to complete demo"
      },
      { status: 500 }
    );
  }
}

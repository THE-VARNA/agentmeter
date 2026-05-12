import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import {
  adjustCredits,
  createUsageEvent,
  findEndpoint,
  getStore,
  recordGatewayRequest,
  recordX402Payment,
  resolveMockUpstream
} from "@/lib/demo-data";
import { ingestDodoUsageEvent, issueDodoRefund } from "@/lib/dodo";
import { checkRateLimit } from "@/lib/rate-limit";
import { usageEventSchema } from "@/lib/schemas";
import {
  buildX402Requirement,
  normalizePaymentHeader,
  paymentResponseHeader,
  verifyDemoPaymentHeader,
  verifySolanaDevnetTx
} from "@/lib/x402";
import type { Method } from "@/lib/types";

// ── Shared handler (supports GET and POST) ────────────────────────────────────
async function handleGatewayRequest(
  request: Request,
  slug: string,
  method: Method,
  requestBody?: unknown
) {
  const startedAt = Date.now();
  const store = await getStore();
  const endpoint = await findEndpoint(slug);
  const buyer = store.buyers[0];

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint_not_found" }, { status: 404 });
  }

  if (!endpoint.active) {
    return NextResponse.json({ error: "endpoint_inactive" }, { status: 423 });
  }

  // Reject method mismatch (endpoint config defines allowed method)
  if (endpoint.method !== method) {
    return NextResponse.json(
      { error: "method_not_allowed", expected: endpoint.method },
      { status: 405 }
    );
  }

  const remote = request.headers.get("x-forwarded-for") ?? "local";
  const limit = await checkRateLimit(`${remote}:${endpoint.slug}`, 120);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", resetAt: new Date(limit.resetAt).toISOString() },
      { status: 429 }
    );
  }

  const licenseKeyHeader = request.headers.get("x-license-key");
  let license: any = null;
  
  if (licenseKeyHeader) {
    license = await prisma.licenseKey.findUnique({
      where: { key: licenseKeyHeader },
      include: { buyer: true }
    });
    
    if (!license || license.status !== "active") {
      return NextResponse.json({ error: "invalid_license_key" }, { status: 403 });
    }
  }

  const paymentHeader = normalizePaymentHeader(request.headers);
  if (!paymentHeader && !license) {
    const requirement = buildX402Requirement(endpoint, store.merchant);
    return NextResponse.json(requirement, {
      status: 402,
      headers: {
        "Cache-Control": "no-store",
        "X-AgentMeter-Endpoint": endpoint.slug
      }
    });
  }

  let verificationSignature = `license_${license?.id ?? Date.now()}`;
  let finalSettlementStatus = "settled" as any;
  let devnetCheck: any = { settlementStatus: "settled" };
  let providerId = license ? license.dodoKeyId : "";
  let amountUsd = license ? 0 : endpoint.priceUsd;
  let verificationRawPayload: any = { license: true };

  if (!license) {
    const verification = verifyDemoPaymentHeader(paymentHeader!, endpoint, store.merchant.solanaWallet);
    if (!verification.valid) {
      await recordGatewayRequest({
        endpointId: endpoint.id,
        buyerId: buyer?.id,
        method,
        path: `/gateway/${endpoint.slug}`,
        statusCode: 402,
        rawStatus: verification.error,
        idempotencyKey: `${endpoint.slug}_${Date.now()}_failed`,
        latencyMs: Date.now() - startedAt,
        amountUsd: endpoint.priceUsd,
        errorCode: verification.error,
        requestBody,
        responseBody: verification
      });

      return NextResponse.json(
        {
          ...buildX402Requirement(endpoint, store.merchant),
          reason: verification.error
        },
        { status: 402 }
      );
    }
    
    verificationSignature = verification.signature;
    providerId = verification.providerId;
    amountUsd = verification.amountUsd;
    verificationRawPayload = verification.rawPayload;

    // ── Real Solana devnet verification ────────────────────────────────────────
    devnetCheck = await verifySolanaDevnetTx(
      verificationSignature,
      store.merchant.solanaWallet
    );
    finalSettlementStatus = devnetCheck.settlementStatus;
  } else {
    finalSettlementStatus = "settled_license";
  }

  const usageEvent = usageEventSchema.parse(
    createUsageEvent(endpoint, license ? license.buyer : buyer, verificationSignature)
  );

  // Use Dodo SDK directly (client.usageEvents.ingest)
  const dodoUsage = await ingestDodoUsageEvent(usageEvent);

  const idempotencyKey = `gateway_${endpoint.slug}_${verificationSignature}`;

  // ── Attempt upstream call ──────────────────────────────────────────────────
  let responseBody: unknown;
  let upstreamFailed = false;

  try {
    responseBody = resolveMockUpstream(endpoint);
  } catch {
    upstreamFailed = true;
  }

  // ── If upstream failed: record failure + issue Dodo refund + credit back ───
  if (upstreamFailed || responseBody === null) {
    await recordGatewayRequest({
      endpointId: endpoint.id,
      buyerId: buyer?.id,
      method,
      path: `/gateway/${endpoint.slug}`,
      statusCode: 502,
      rawStatus: "upstream_failed",
      providerId: providerId,
      idempotencyKey: `${idempotencyKey}_failed`,
      latencyMs: Date.now() - startedAt,
      amountUsd: amountUsd,
      txSignature: verificationSignature,
      errorCode: "upstream_error",
      requestBody,
      responseBody: { error: "upstream_failed" }
    });

    let refundId = "skipped_due_to_license";
    if (!license) {
      // Issue Dodo refund using the payment ID from verification
      const refund = await issueDodoRefund({
        paymentId: providerId,
        reason: "upstream_failure",
        metadata: {
          endpoint: endpoint.slug,
          buyer_id: buyer?.id ?? "",
          tx_signature: verificationSignature
        }
      });
      refundId = refund.refundId;

      // Credit the buyer back
      if (buyer) {
        const creditsToReturn = Math.round(amountUsd * 1000);
        await adjustCredits({
          buyerId: buyer.id,
          amount: creditsToReturn,
          eventType: "credit.refunded",
          rawStatus: "refunded",
          reason: `Upstream failure refund — ${endpoint.slug} (+${creditsToReturn} credits back)`,
          providerId: refundId,
          idempotencyKey: `refund_${idempotencyKey}`,
          rawPayload: refund.rawPayload as Record<string, unknown>
        });
      }
    }

    return NextResponse.json(
      {
        error: "upstream_failed",
        refunded: !license,
        refund_id: refundId,
        detail: license ? "Upstream API failed. No credits deducted from your license." : "Payment collected but upstream API failed. Full refund issued automatically."
      },
      { status: 502 }
    );
  }

  // ── Record successful payment ──────────────────────────────────────────────
  const gatewayRequest = await recordGatewayRequest({
    endpointId: endpoint.id,
    buyerId: buyer?.id,
    method,
    path: `/gateway/${endpoint.slug}`,
    statusCode: 200,
    rawStatus: "fulfilled",
    providerId: providerId,
    idempotencyKey,
    latencyMs: Date.now() - startedAt,
    amountUsd: amountUsd,
    txSignature: verificationSignature,
    requestBody,
    responseBody
  });

  await recordX402Payment({
    endpointId: endpoint.id,
    buyerId: buyer?.id,
    gatewayRequestId: gatewayRequest.id,
    providerId: providerId,
    idempotencyKey,
    scheme: "exact",
    network: store.merchant.x402Network,
    amountUsd: amountUsd,
    payTo: store.merchant.solanaWallet,
    txSignature: verificationSignature,
    settlementStatus: finalSettlementStatus,
    rawStatus: "settled",
    rawPayload: {
      payment: verificationRawPayload,
      dodoUsage,
      devnetCheck,
      requestBody
    }
  });

  // Solana Explorer link for the tx (devnet)
  const solanaExplorerUrl = `https://explorer.solana.com/tx/${verificationSignature}?cluster=devnet`;

  return NextResponse.json(
    {
      data: responseBody,
      metering: {
        dodo_event_id: usageEvent.event_id,
        dodo_status: dodoUsage.rawStatus,
        endpoint: endpoint.slug,
        price_usd: endpoint.priceUsd,
        license_used: !!license
      },
      payment: {
        network: store.merchant.x402Network,
        tx_signature: verificationSignature,
        status: finalSettlementStatus,
        devnet_check: devnetCheck.detail,
        explorer: solanaExplorerUrl
      }
    },
    {
      status: 200,
      headers: {
        "PAYMENT-RESPONSE": paymentResponseHeader({
          signature: verificationSignature,
          amountUsd: amountUsd,
          status: finalSettlementStatus
        })
      }
    }
  );
}

// ── Route Handlers ────────────────────────────────────────────────────────────

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  return handleGatewayRequest(request, slug, "GET");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  let body: unknown;
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  return handleGatewayRequest(request, slug, "POST", body);
}

import { NextResponse } from "next/server";

import {
  createUsageEvent,
  findEndpoint,
  getStore,
  recordGatewayRequest,
  recordX402Payment,
  resolveMockUpstream
} from "@/lib/demo-data";
import { ingestDodoUsageEvent } from "@/lib/dodo";
import { checkRateLimit } from "@/lib/rate-limit";
import { usageEventSchema } from "@/lib/schemas";
import {
  buildX402Requirement,
  normalizePaymentHeader,
  paymentResponseHeader,
  verifyDemoPaymentHeader
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
  const store = getStore();
  const endpoint = findEndpoint(slug);
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
  const limit = checkRateLimit(`${remote}:${endpoint.slug}`, 120);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", resetAt: new Date(limit.resetAt).toISOString() },
      { status: 429 }
    );
  }

  const paymentHeader = normalizePaymentHeader(request.headers);
  if (!paymentHeader) {
    const requirement = buildX402Requirement(endpoint, store.merchant);
    return NextResponse.json(requirement, {
      status: 402,
      headers: {
        "Cache-Control": "no-store",
        "X-AgentMeter-Endpoint": endpoint.slug
      }
    });
  }

  const verification = verifyDemoPaymentHeader(paymentHeader, endpoint, store.merchant.solanaWallet);
  if (!verification.valid) {
    recordGatewayRequest({
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

  const responseBody = resolveMockUpstream(endpoint);
  const usageEvent = usageEventSchema.parse(
    createUsageEvent(endpoint, buyer, verification.signature)
  );

  // Use Dodo SDK directly (client.usageEvents.ingest)
  const dodoUsage = await ingestDodoUsageEvent(usageEvent);

  const idempotencyKey = `gateway_${endpoint.slug}_${verification.signature}`;
  const gatewayRequest = recordGatewayRequest({
    endpointId: endpoint.id,
    buyerId: buyer?.id,
    method,
    path: `/gateway/${endpoint.slug}`,
    statusCode: 200,
    rawStatus: "fulfilled",
    providerId: verification.providerId,
    idempotencyKey,
    latencyMs: Date.now() - startedAt,
    amountUsd: verification.amountUsd,
    txSignature: verification.signature,
    requestBody,
    responseBody
  });

  recordX402Payment({
    endpointId: endpoint.id,
    buyerId: buyer?.id,
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
    rawPayload: {
      payment: verification.rawPayload,
      dodoUsage,
      requestBody
    }
  });

  // Solana Explorer link for the tx (devnet)
  const solanaExplorerUrl = `https://explorer.solana.com/tx/${verification.signature}?cluster=devnet`;

  return NextResponse.json(
    {
      data: responseBody,
      metering: {
        dodo_event_id: usageEvent.event_id,
        dodo_status: dodoUsage.rawStatus,
        endpoint: endpoint.slug,
        price_usd: endpoint.priceUsd
      },
      payment: {
        network: store.merchant.x402Network,
        tx_signature: verification.signature,
        status: verification.settlementStatus,
        explorer: solanaExplorerUrl
      }
    },
    {
      status: 200,
      headers: {
        "PAYMENT-RESPONSE": paymentResponseHeader({
          signature: verification.signature,
          amountUsd: verification.amountUsd,
          status: verification.settlementStatus
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

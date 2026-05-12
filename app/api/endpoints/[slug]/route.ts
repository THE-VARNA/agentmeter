import { NextResponse } from "next/server";

import { findEndpoint, getSerializableState } from "@/lib/demo-data";

export async function GET(_request: Request, context: { params: { slug: string } }) {
  const endpoint = findEndpoint(context.params.slug);

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint_not_found" }, { status: 404 });
  }

  const state = getSerializableState();
  return NextResponse.json({
    endpoint,
    requests: state.gatewayRequests.filter((request) => request.endpointId === endpoint.id),
    payments: state.x402Payments.filter((payment) => payment.endpointId === endpoint.id)
  });
}

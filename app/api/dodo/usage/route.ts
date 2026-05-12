import { NextResponse } from "next/server";

import { adjustCredits, getStore } from "@/lib/demo-data";
import { ingestDodoUsageEvent } from "@/lib/dodo";
import { usageEventSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const event = usageEventSchema.parse(await request.json());
    const store = await getStore();
    const buyer = store.buyers.find((item) => item.dodoCustomerId === event.customer_id);
    const result = await ingestDodoUsageEvent(event);

    if (buyer) {
      adjustCredits({
        buyerId: buyer.id,
        amount: -1,
        eventType: "credit.deducted",
        rawStatus: result.rawStatus,
        reason: `Metered API call: ${event.metadata.endpoint}`,
        providerId: result.providerId,
        idempotencyKey: event.event_id,
        txSignature: event.metadata.tx_signature,
        rawPayload: result.rawPayload
      });
    }

    return NextResponse.json({ usage: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: "usage_ingestion_failed",
        detail: error instanceof Error ? error.message : "Unable to ingest usage"
      },
      { status: 400 }
    );
  }
}

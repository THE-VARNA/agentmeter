import { NextResponse } from "next/server";

import { CREDIT_PACKS } from "@/lib/constants";
import { adjustCredits, getStore } from "@/lib/demo-data";

export async function POST(request: Request) {
  try {
    const { amountUsd } = await request.json();
    const store = await getStore();
    const buyer = store.buyers[0];

    if (!buyer) return NextResponse.json({ error: "buyer_not_found" }, { status: 404 });

    const pack = CREDIT_PACKS.find(p => Math.abs(p.amountUsd - amountUsd) < 0.01)
      ?? CREDIT_PACKS.find(p => p.amountUsd <= amountUsd);
    const credits = pack?.credits ?? Math.round(amountUsd * 1000);

    const idempotencyKey = `simulate_credit_${Date.now()}`;
    const entry = await adjustCredits({
      buyerId: buyer.id,
      amount: credits,
      eventType: "credit.added",
      rawStatus: "simulated_webhook",
      reason: `Simulated Dodo payment.succeeded — ${pack?.label ?? "custom"} pack (+${credits.toLocaleString()} credits)`,
      idempotencyKey,
      rawPayload: { simulated: true, amountUsd, credits }
    });

    return NextResponse.json({
      ok: true,
      credits,
      newBalance: buyer.creditBalance,
      entry
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "failed" }, { status: 500 });
  }
}

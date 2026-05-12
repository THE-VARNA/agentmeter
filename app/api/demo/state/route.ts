import { NextResponse } from "next/server";

import { getLedger, getMetrics, getSerializableState } from "@/lib/demo-data";

export async function GET() {
  const [state, metrics, ledger] = await Promise.all([
    getSerializableState(),
    getMetrics(),
    getLedger()
  ]);

  return NextResponse.json({
    state,
    metrics,
    ledger
  });
}

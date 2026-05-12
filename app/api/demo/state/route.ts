import { NextResponse } from "next/server";

import { getLedger, getMetrics, getSerializableState } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({
    state: getSerializableState(),
    metrics: getMetrics(),
    ledger: getLedger()
  });
}

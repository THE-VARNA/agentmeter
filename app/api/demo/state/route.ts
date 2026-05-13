import { NextResponse } from "next/server";

import { getLedger, getMetrics, getSerializableState } from "@/lib/demo-data";

export async function GET() {
  try {
    const [state, metrics, ledger] = await Promise.all([
      getSerializableState(),
      getMetrics(),
      getLedger()
    ]);

    return NextResponse.json({ state, metrics, ledger });
  } catch (err) {
    // Safety net — always return valid JSON so the client never gets empty body
    console.error("[demo/state] Unexpected error:", err);
    return NextResponse.json(
      { 
        state: { merchant: { name: "AgentMeter", slug: "agentmeter" }, endpoints: [], buyers: [] }, 
        metrics: { totalRequests: 0, totalRevenue: 0, activeAgents: 0, successRate: 100 }, 
        ledger: [] 
      },
      { status: 200 }
    );
  }
}

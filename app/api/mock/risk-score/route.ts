import { NextResponse } from "next/server";

import { nowIso } from "@/lib/utils";

export async function GET() {
  return NextResponse.json({
    model: "risk-score",
    score: 21,
    band: "low",
    rationale: "Counterparty wallet, amount, and endpoint history are within policy.",
    generated_at: nowIso()
  });
}

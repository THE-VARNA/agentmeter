import { NextResponse } from "next/server";

import { nowIso } from "@/lib/utils";

export async function GET() {
  return NextResponse.json({
    model: "weather-alpha",
    location: "Bengaluru",
    signal: "clear-route-window",
    confidence: 0.94,
    recommendation: "Dispatch within 18 minutes to avoid monsoon drift.",
    generated_at: nowIso()
  });
}

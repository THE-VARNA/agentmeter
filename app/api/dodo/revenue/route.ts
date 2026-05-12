import { NextResponse } from "next/server";

import { getDodoRevenue } from "@/lib/dodo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const revenue = await getDodoRevenue();
    return NextResponse.json(revenue);
  } catch (error) {
    return NextResponse.json(
      { error: "revenue_fetch_failed", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

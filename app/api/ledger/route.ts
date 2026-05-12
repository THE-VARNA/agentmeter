import { NextResponse } from "next/server";

import { getLedger } from "@/lib/demo-data";

export async function GET() {
  const ledger = await getLedger();
  return NextResponse.json({ ledger });
}

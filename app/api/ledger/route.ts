import { NextResponse } from "next/server";

import { getLedger } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ ledger: getLedger() });
}

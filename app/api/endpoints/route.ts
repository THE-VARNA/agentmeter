import { NextResponse } from "next/server";

import { addEndpoint, getSerializableState } from "@/lib/demo-data";
import { endpointSchema } from "@/lib/schemas";

export async function GET() {
  return NextResponse.json({ endpoints: getSerializableState().endpoints });
}

export async function POST(request: Request) {
  try {
    const payload = endpointSchema.parse(await request.json());
    const endpoint = addEndpoint(payload);

    return NextResponse.json({ endpoint }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "endpoint_validation_failed",
        detail: error instanceof Error ? error.message : "Invalid endpoint payload"
      },
      { status: 400 }
    );
  }
}

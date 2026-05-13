import { Suspense } from "react";
import { CreditsClient } from "@/components/credits/credits-client";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const state = await getSerializableState();
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "white" }}>Loading credits…</div>}>
      <CreditsClient buyer={state.buyers[0]} initialCheckouts={state.dodoCheckouts} />
    </Suspense>
  );
}

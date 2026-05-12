import { CreditsClient } from "@/components/credits/credits-client";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function CreditsPage() {
  const state = getSerializableState();
  return <CreditsClient buyer={state.buyers[0]} initialCheckouts={state.dodoCheckouts} />;
}

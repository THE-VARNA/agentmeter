import { CreditsClient } from "@/components/credits/credits-client";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const state = await getSerializableState();
  return <CreditsClient buyer={state.buyers[0]} initialCheckouts={state.dodoCheckouts} />;
}

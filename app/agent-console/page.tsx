import { AgentConsoleClient } from "@/components/demo/agent-console-client";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AgentConsolePage() {
  const state = await getSerializableState();
  return <AgentConsoleClient />;
}

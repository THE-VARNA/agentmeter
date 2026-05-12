import { AgentConsoleClient } from "@/components/demo/agent-console-client";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function AgentConsolePage() {
  const state = getSerializableState();
  return <AgentConsoleClient initialRun={state.demoRuns[0]} />;
}

import { AgentConsoleClient } from "@/components/demo/agent-console-client";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AgentConsolePage() {
  try {
    const state = await getSerializableState();
    return <AgentConsoleClient />;
  } catch (error) {
    console.error("AgentConsolePage error:", error);
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h1>500 - Internal Server Error</h1>
        <p>Failed to load demo state. Please check the logs.</p>
        <pre style={{ fontSize: 12, opacity: 0.7 }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}

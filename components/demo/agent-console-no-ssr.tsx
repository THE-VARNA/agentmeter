"use client";

import nextDynamic from "next/dynamic";

const AgentConsoleClient = nextDynamic(
  () => import("./agent-console-client").then(m => m.AgentConsoleClient),
  { ssr: false }
);

export function AgentConsoleNoSSR() {
  return <AgentConsoleClient />;
}

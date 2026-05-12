"use client";

import { CheckCircle2, Loader2, Play, RefreshCw, TerminalSquare } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import type { DemoRun, DemoStep } from "@/lib/types";

type DemoResponse = {
  demoRun: DemoRun;
  requirement: unknown;
  upstreamResponse: unknown;
  usageEvent: unknown;
  dodoUsage: unknown;
};

const agentScript = `const response = await fetch("/gateway/weather-alpha");

if (response.status === 402) {
  const requirement = await response.json();
  const payment = await agentWallet.signX402(requirement);

  return fetch("/gateway/weather-alpha", {
    headers: {
      "PAYMENT-SIGNATURE": payment
    }
  });
}`;

export function AgentConsoleClient({ initialRun }: { initialRun?: DemoRun }) {
  const [run, setRun] = useState<DemoRun | undefined>(initialRun);
  const [response, setResponse] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function execute() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointSlug: "weather-alpha" })
      });
      const body = await result.json();
      if (!result.ok) {
        throw new Error(body.detail ?? body.error ?? "Demo failed");
      }
      setRun(body.demoRun);
      setResponse(body);
    } catch (executeError) {
      setError(executeError instanceof Error ? executeError.message : "Demo failed");
    } finally {
      setLoading(false);
    }
  }

  const steps: DemoStep[] = run?.steps ?? [
    { id: "request", title: "Agent request", status: "pending", detail: "Waiting for execution" },
    { id: "challenge", title: "HTTP 402 challenge", status: "pending", detail: "Gateway will emit payment terms" },
    { id: "payment", title: "Solana payment", status: "pending", detail: "Agent signs x402 payload" },
    { id: "fulfillment", title: "API fulfillment", status: "pending", detail: "Gateway returns protected data" },
    { id: "metering", title: "Dodo metering", status: "pending", detail: "Usage event updates ledger" }
  ];

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <StatusPill tone="live">Scripted judge path</StatusPill>
            <h1 className="mt-4 text-3xl font-semibold text-white">Agent Console</h1>
            <p className="mt-2 text-sm text-slate-400">
              Watch a machine client hit a paid route, receive 402, pay on Solana, and trigger Dodo usage.
            </p>
          </div>
          <Button type="button" onClick={execute} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Execute flow
          </Button>
        </div>
      </GlassCard>

      {error ? <div className="rounded-lg border border-rose/25 bg-rose/10 p-4 text-sm text-rose">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1fr_0.9fr]">
        <GlassCard>
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-cyanline" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Agent Script</h2>
          </div>
          <pre className="mt-5 overflow-auto rounded-lg border border-white/10 bg-black/35 p-4 text-xs leading-6 text-slate-300">
            {agentScript}
          </pre>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Payment Timeline</h2>
          <div className="mt-5 grid gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="grid grid-cols-[32px_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/8">
                    {step.status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4 text-mint" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    )}
                  </div>
                  {index < steps.length - 1 ? <div className="h-8 w-px bg-white/10" /> : null}
                </div>
                <div className="rounded-lg border border-white/10 bg-white/6 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <StatusPill tone={step.status === "complete" ? "live" : "pending"}>{step.status}</StatusPill>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Live Response</h2>
          <div className="mt-5 rounded-lg border border-white/10 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Transaction</p>
            <p className="mt-2 break-all font-mono text-xs text-mint">
              {run?.txSignature ?? "Waiting for Solana payment"}
            </p>
          </div>
          <pre className="mt-4 max-h-[440px] overflow-auto rounded-lg border border-white/10 bg-black/35 p-4 text-xs leading-6 text-slate-300">
            {JSON.stringify(response ?? run ?? { status: "ready" }, null, 2)}
          </pre>
        </GlassCard>
      </div>
    </div>
  );
}

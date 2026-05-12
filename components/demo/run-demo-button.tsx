"use client";

import { ArrowRight, Loader2, Play, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import type { DemoRun } from "@/lib/types";

export function RunDemoButton({
  onComplete,
  compact = false
}: {
  onComplete?: (run: DemoRun) => void;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<DemoRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDemo() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointSlug: "weather-alpha" })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail ?? body.error ?? "Demo failed");
      }
      setLastRun(body.demoRun);
      onComplete?.(body.demoRun);
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : "Demo failed");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <Button type="button" onClick={runDemo} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Run Agent Payment Demo
      </Button>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <StatusPill tone="live">First-prize demo path</StatusPill>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white md:text-6xl">
            Metered APIs for autonomous agents, paid per call on Solana.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Dodo handles checkout, credits, usage billing, webhooks, and receipts. AgentMeter handles HTTP
            402 challenges, Solana x402 settlement, and protected API fulfillment.
          </p>
        </div>
        <div className="w-full shrink-0 md:w-72">
          <Button type="button" size="lg" className="w-full" onClick={runDemo} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Agent Payment Demo
          </Button>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
            {lastRun ? (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-mint" aria-hidden="true" />
                Completed: {lastRun.txSignature}
              </div>
            ) : error ? (
              <span className="text-rose">{error}</span>
            ) : (
              <div className="flex items-center gap-2">
                Shows 402 <ArrowRight className="h-4 w-4" aria-hidden="true" /> payment{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" /> Dodo usage.
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

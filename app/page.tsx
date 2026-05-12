import { Activity, Cable, Coins, DollarSign, ExternalLink, RadioTower, Zap } from "lucide-react";
import Link from "next/link";

import { RunDemoButton } from "@/components/demo/run-demo-button";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getLedger, getMetrics, getSerializableState } from "@/lib/demo-data";
import { formatCompact, formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const state = getSerializableState();
  const metrics = getMetrics();
  const ledger = getLedger().slice(0, 6);

  return (
    <div className="grid gap-5">
      <RunDemoButton />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Metered revenue"
          value={formatUsd(metrics.totalRevenue)}
          detail="Tracked from fulfilled x402 requests and Dodo usage events."
          icon={DollarSign}
          tone="mint"
        />
        <MetricCard
          label="API requests"
          value={formatCompact(metrics.totalRequests)}
          detail="Every successful call creates an auditable gateway request."
          icon={Activity}
          tone="cyan"
        />
        <MetricCard
          label="Active endpoints"
          value={String(metrics.activeEndpoints)}
          detail="Merchant-owned routes protected by HTTP 402 payments."
          icon={Cable}
          tone="amber"
        />
        <MetricCard
          label="Agent credits"
          value={formatCompact(metrics.creditBalance)}
          detail="Dodo credit balance mirrored for the demo buyer."
          icon={Coins}
          tone="mint"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Endpoint Health</h2>
              <p className="mt-1 text-sm text-slate-400">Live routes priced for autonomous agent calls.</p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/endpoints">
                Manage endpoints <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_100px_120px] bg-white/6 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
              <span>Endpoint</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            {state.endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className="grid grid-cols-[1fr_100px_120px] items-center border-t border-white/10 px-4 py-4 text-sm"
              >
                <Link href={`/endpoints/${endpoint.slug}`} className="focus-ring rounded-lg">
                  <p className="font-medium text-white">{endpoint.name}</p>
                  <p className="mt-1 text-xs text-slate-400">/gateway/{endpoint.slug}</p>
                </Link>
                <span className="font-mono text-cyanline">{formatUsd(endpoint.priceUsd, 4)}</span>
                <StatusPill tone={endpoint.active ? "live" : "pending"}>
                  {endpoint.active ? "Active" : "Paused"}
                </StatusPill>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Rail</h2>
              <p className="mt-1 text-sm text-slate-400">Dodo, x402, Solana, and gateway events.</p>
            </div>
            <RadioTower className="h-5 w-5 text-cyanline" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3">
            {ledger.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 p-5 text-sm text-slate-400">
                No live demo events yet. Run the agent payment demo to populate the rail.
              </div>
            ) : (
              ledger.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-white/6 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <StatusPill tone={item.status.includes("failed") ? "error" : "live"}>
                      {item.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 truncate font-mono text-xs text-slate-400">
                    {item.txSignature ?? item.providerId ?? item.id}
                  </p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Dodo", "Checkout Sessions, stablecoin method, usage events, credit ledger, webhooks."],
            ["Solana x402", "HTTP 402 exact payments with devnet USDC settlement semantics."],
            ["Gateway", "Merchant-owned endpoint protection, SSRF allowlist, idempotent audit trail."]
          ].map(([title, detail]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-black/18 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-mint" aria-hidden="true" />
                <h3 className="font-medium text-white">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

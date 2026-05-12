import { Activity, Code2, DollarSign, Globe2, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/copy-button";
import { GlassCard } from "@/components/ui/glass-card";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusPill } from "@/components/ui/status-pill";
import { findEndpoint, getSerializableState } from "@/lib/demo-data";
import { buildX402Requirement } from "@/lib/x402";
import { formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EndpointDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const endpoint = await findEndpoint(slug);
  if (!endpoint) {
    notFound();
  }

  const state = await getSerializableState();
  const requests = state.gatewayRequests.filter((request) => request.endpointId === endpoint.id);
  const payments = state.x402Payments.filter((payment) => payment.endpointId === endpoint.id);
  const requirement = buildX402Requirement(endpoint, state.merchant);
  const snippet = `const response = await fetch("${state.merchant.slug === "agentmeter-demo" ? "http://localhost:3000" : ""}/gateway/${endpoint.slug}", {
  headers: { "PAYMENT-SIGNATURE": signedX402Payload }
});`;

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusPill tone={endpoint.active ? "live" : "pending"}>{endpoint.active ? "Active" : "Paused"}</StatusPill>
            <h1 className="mt-4 text-4xl font-semibold text-white">{endpoint.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{endpoint.description}</p>
          </div>
          <CopyButton value={snippet} label="Copy integration" />
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Price" value={formatUsd(endpoint.priceUsd, 4)} detail="Exact x402 price per request." icon={DollarSign} />
        <MetricCard label="Requests" value={String(endpoint.requestCount)} detail="Fulfilled requests recorded by gateway." icon={Activity} tone="mint" />
        <MetricCard label="Revenue" value={formatUsd(endpoint.revenueUsd)} detail="Demo revenue from fulfilled calls." icon={ShieldCheck} tone="amber" />
        <MetricCard label="Payments" value={String(payments.length)} detail="x402 settlement records for this route." icon={Globe2} tone="cyan" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyanline" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">x402 Config</h2>
          </div>
          <pre className="mt-5 max-h-[420px] overflow-auto rounded-lg border border-white/10 bg-black/35 p-4 text-xs leading-6 text-slate-300">
            {JSON.stringify(requirement, null, 2)}
          </pre>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-semibold text-white">Dodo Meter Mapping</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/6 p-4">
              <p className="text-slate-400">Meter ID</p>
              <p className="mt-2 font-mono text-cyanline">{endpoint.dodoMeterId}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/6 p-4">
              <p className="text-slate-400">Event</p>
              <p className="mt-2 font-mono text-white">api.call</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/6 p-4">
              <p className="text-slate-400">Credit policy</p>
              <p className="mt-2 text-white">1 fulfilled request deducts 1 API call credit.</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-xl font-semibold text-white">Recent Calls</h2>
        <div className="mt-4 grid gap-3">
          {requests.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 p-5 text-sm text-slate-400">
              No calls yet. Run the agent demo or call the gateway with a payment header.
            </p>
          ) : (
            requests.slice(0, 8).map((request) => (
              <div key={request.id} className="grid gap-2 rounded-lg border border-white/10 bg-white/6 p-4 md:grid-cols-[1fr_120px_160px] md:items-center">
                <div>
                  <p className="font-mono text-sm text-white">{request.path}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{request.txSignature}</p>
                </div>
                <StatusPill tone={request.statusCode === 200 ? "live" : "error"}>{request.rawStatus}</StatusPill>
                <p className="font-mono text-sm text-cyanline">{formatUsd(request.amountUsd, 4)}</p>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

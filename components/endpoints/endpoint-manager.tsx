"use client";

import { Loader2, Plus, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import type { Endpoint } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

const emptyForm = {
  name: "",
  slug: "",
  method: "GET",
  upstreamUrl: "/api/mock/weather-alpha",
  priceUsd: "0.001",
  description: "",
  mimeType: "application/json",
  active: true
};

export function EndpointManager({ initialEndpoints }: { initialEndpoints: Endpoint[] }) {
  const [endpoints, setEndpoints] = useState(initialEndpoints);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      endpoints.filter((endpoint) =>
        `${endpoint.name} ${endpoint.slug} ${endpoint.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [endpoints, query]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priceUsd: Number(form.priceUsd) })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail ?? body.error ?? "Unable to create endpoint");
      }
      setEndpoints((current) => [body.endpoint, ...current]);
      setForm(emptyForm);
      setOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create endpoint");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Endpoints</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Merchant-owned routes that answer with HTTP 402 until an agent submits a valid Solana x402 payment.
            </p>
          </div>
          <Button type="button" onClick={() => setOpen((value) => !value)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New endpoint
          </Button>
        </div>
      </GlassCard>

      {open ? (
        <GlassCard>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                Name
                <input
                  className="focus-ring min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-white"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Premium Route Intelligence"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Slug
                <input
                  className="focus-ring min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-white"
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="route-intel"
                  pattern="[a-z0-9-]+"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Price per call
                <input
                  className="focus-ring min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-white"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  max="10"
                  value={form.priceUsd}
                  onChange={(event) => setForm((current) => ({ ...current, priceUsd: event.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Upstream URL
                <input
                  className="focus-ring min-h-10 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-white"
                  value={form.upstreamUrl}
                  onChange={(event) => setForm((current) => ({ ...current, upstreamUrl: event.target.value }))}
                  placeholder="https://api.example.com/tool"
                  required
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-300">
              Description
              <textarea
                className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="What the agent buys from this endpoint"
                required
              />
            </label>
            {error ? <p className="rounded-lg border border-rose/25 bg-rose/10 p-3 text-sm text-rose">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Create protected route
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="focus-ring min-h-10 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter endpoints"
              type="search"
            />
          </label>
          <StatusPill tone="live">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Verified Gateway
          </StatusPill>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
          <div className="grid grid-cols-[1fr_110px_110px_110px] bg-white/6 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
            <span>Route</span>
            <span>Price</span>
            <span>Requests</span>
            <span>Status</span>
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400">No endpoints match this filter.</p>
              <Button type="button" className="mt-4" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create endpoint
              </Button>
            </div>
          ) : (
            filtered.map((endpoint) => (
              <div
                key={endpoint.id}
                className="grid grid-cols-[1fr_110px_110px_110px] items-center border-t border-white/10 px-4 py-4 text-sm"
              >
                <Link href={`/endpoints/${endpoint.slug}`} className="focus-ring rounded-lg">
                  <p className="font-medium text-white">{endpoint.name}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-400">/gateway/{endpoint.slug}</p>
                </Link>
                <span className="font-mono text-cyanline">{formatUsd(endpoint.priceUsd, 4)}</span>
                <span className="font-mono text-slate-300">{endpoint.requestCount}</span>
                <StatusPill tone={endpoint.active ? "live" : "pending"}>{endpoint.active ? "Active" : "Paused"}</StatusPill>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

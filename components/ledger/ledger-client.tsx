"use client";

import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import type { LedgerItem } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function LedgerClient({ initialLedger }: { initialLedger: LedgerItem[] }) {
  const [ledger, setLedger] = useState(initialLedger);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(
    () =>
      ledger.filter((item) =>
        `${item.title} ${item.status} ${item.txSignature ?? ""} ${item.providerId ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [ledger, query]
  );

  async function refresh() {
    setLoading(true);
    const response = await fetch("/api/ledger");
    const body = await response.json();
    setLedger(body.ledger);
    setLoading(false);
  }

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Ledger</h1>
            <p className="mt-2 text-sm text-slate-400">
              Unified trace across Dodo payments, credits, usage events, Solana signatures, and gateway requests.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={refresh} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <label className="relative block max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="focus-ring min-h-10 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transaction, webhook, or status"
            type="search"
          />
        </label>

        <div className="mt-5 grid gap-3">
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 p-5 text-sm text-slate-400">
              No ledger entries match your filter.
            </p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-white/10 bg-white/6 p-4 lg:grid-cols-[130px_1fr_150px_170px] lg:items-center">
                <StatusPill tone={item.status.includes("failed") ? "error" : item.status.includes("pending") ? "pending" : "live"}>
                  {item.kind}
                </StatusPill>
                <div className="min-w-0">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-400">
                    {item.txSignature ?? item.providerId ?? item.id}
                  </p>
                </div>
                <p className="font-mono text-sm text-cyanline">{item.amountUsd ? formatUsd(item.amountUsd, 4) : "n/a"}</p>
                <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

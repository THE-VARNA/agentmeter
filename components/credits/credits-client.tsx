"use client";

import { CreditCard, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import { CREDIT_PACKS, DODO_STABLECOIN_METHOD } from "@/lib/constants";
import type { Buyer, DodoCheckout } from "@/lib/types";
import { formatCompact, formatUsd } from "@/lib/utils";

export function CreditsClient({ buyer, initialCheckouts }: { buyer: Buyer; initialCheckouts: DodoCheckout[] }) {
  const [checkouts, setCheckouts] = useState(initialCheckouts);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createCheckout(amountUsd: number) {
    setLoading(amountUsd);
    setError(null);
    try {
      const response = await fetch("/api/dodo/checkout/credit-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd, buyerId: buyer.id })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail ?? body.error ?? "Checkout failed");
      }
      setCheckouts((current) => [body.checkout, ...current]);
      window.open(body.checkout.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <StatusPill tone="live">Dodo credit packs</StatusPill>
            <h1 className="mt-4 text-3xl font-semibold text-white">Credits</h1>
            <p className="mt-2 text-sm text-slate-400">
              One-time Dodo checkout sessions fund API-call credits for the demo agent.
            </p>
          </div>
          <div className="rounded-lg border border-mint/20 bg-mint/10 p-4">
            <p className="text-sm text-mint">Current balance</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatCompact(buyer.creditBalance)} credits</p>
          </div>
        </div>
      </GlassCard>

      {error ? <div className="rounded-lg border border-rose/25 bg-rose/10 p-4 text-sm text-rose">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <GlassCard key={pack.amountUsd}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{pack.label}</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{formatUsd(pack.amountUsd)}</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyanline/20 bg-cyanline/12 text-cyanline">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">{formatCompact(pack.credits)} API-call credits</p>
            <Button
              type="button"
              className="mt-5 w-full"
              onClick={() => createCheckout(pack.amountUsd)}
              disabled={loading === pack.amountUsd}
            >
              {loading === pack.amountUsd ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Launch Dodo checkout
            </Button>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Checkout Status</h2>
            <p className="mt-1 text-sm text-slate-400">
              Stablecoin method `{DODO_STABLECOIN_METHOD}` plus credit/debit fallback, aligned to Dodo docs.
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="https://customer.dodopayments.com" target="_blank" rel="noreferrer">
              Customer portal <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {checkouts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 p-5 text-sm text-slate-400">
              No credit-pack checkout yet. Launch one above to create a Dodo Checkout Session record.
            </p>
          ) : (
            checkouts.map((checkout) => (
              <div key={checkout.id} className="grid gap-3 rounded-lg border border-white/10 bg-white/6 p-4 md:grid-cols-[1fr_120px_150px] md:items-center">
                <div>
                  <p className="font-medium text-white">{checkout.productId}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-400">{checkout.providerId}</p>
                </div>
                <p className="font-mono text-cyanline">{formatUsd(checkout.amountUsd)}</p>
                <StatusPill tone={checkout.rawStatus.includes("failed") ? "error" : "live"}>{checkout.rawStatus}</StatusPill>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

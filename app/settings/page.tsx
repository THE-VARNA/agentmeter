import { AlertTriangle, CheckCircle2, KeyRound, RadioTower, ShieldCheck, WalletCards } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import { DODO_STABLECOIN_METHOD, OFFICIAL_SOURCE_NOTES } from "@/lib/constants";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const state = getSerializableState();
  const rows = [
    {
      label: "Dodo API key",
      value: process.env.DODO_PAYMENTS_API_KEY ? "Configured" : "Demo adapter",
      ok: Boolean(process.env.DODO_PAYMENTS_API_KEY),
      icon: KeyRound
    },
    {
      label: "Webhook secret",
      value: process.env.DODO_PAYMENTS_WEBHOOK_KEY ? "HMAC enabled" : "Test-mode accept",
      ok: Boolean(process.env.DODO_PAYMENTS_WEBHOOK_KEY),
      icon: ShieldCheck
    },
    {
      label: "Stablecoin method",
      value: DODO_STABLECOIN_METHOD,
      ok: true,
      icon: CheckCircle2
    },
    {
      label: "Solana network",
      value: state.merchant.x402Network,
      ok: true,
      icon: RadioTower
    },
    {
      label: "Merchant wallet",
      value: state.merchant.solanaWallet,
      ok: true,
      icon: WalletCards
    }
  ];

  return (
    <div className="grid gap-5">
      <GlassCard>
        <StatusPill tone="pending">Test mode warning</StatusPill>
        <h1 className="mt-4 text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Environment health for Dodo, Solana, x402, and the deterministic demo adapter.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <GlassCard key={row.label}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-cyanline">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <StatusPill tone={row.ok ? "live" : "pending"}>{row.ok ? "Ready" : "Demo"}</StatusPill>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">{row.label}</h2>
              <p className="mt-2 break-all font-mono text-sm text-slate-400">{row.value}</p>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-white">Source-Audit Constraints</h2>
        </div>
        <div className="mt-5 grid gap-3">
          {OFFICIAL_SOURCE_NOTES.map((note) => (
            <div key={note} className="rounded-lg border border-white/10 bg-white/6 p-4 text-sm leading-6 text-slate-300">
              {note}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

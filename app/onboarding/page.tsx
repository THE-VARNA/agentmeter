import { CheckCircle2, CircleDashed, KeyRound, RadioTower, ShieldCheck, WalletCards } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  const state = getSerializableState();
  const hasDodoKey = Boolean(process.env.DODO_PAYMENTS_API_KEY);
  const hasWebhook = Boolean(process.env.DODO_PAYMENTS_WEBHOOK_KEY);

  const steps = [
    {
      title: "Dodo test keys",
      detail: hasDodoKey ? "Server can call Dodo Checkout and usage APIs." : "Demo adapter active until test keys are added.",
      done: hasDodoKey,
      icon: KeyRound
    },
    {
      title: "Webhook endpoint",
      detail: hasWebhook ? "HMAC verification configured." : "Endpoint is ready; add DODO_PAYMENTS_WEBHOOK_KEY to verify signatures.",
      done: hasWebhook,
      icon: ShieldCheck
    },
    {
      title: "Solana wallet",
      detail: state.merchant.solanaWallet,
      done: true,
      icon: WalletCards
    },
    {
      title: "First endpoint",
      detail: `${state.endpoints[0]?.name ?? "No endpoint"} at /gateway/${state.endpoints[0]?.slug ?? ""}`,
      done: state.endpoints.length > 0,
      icon: RadioTower
    }
  ];

  return (
    <div className="grid gap-5">
      <GlassCard>
        <StatusPill tone="live">Setup checklist</StatusPill>
        <h1 className="mt-4 text-3xl font-semibold text-white">Onboarding</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Four checks to move from deterministic hackathon demo mode to live Dodo test mode and Solana settlement.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <GlassCard key={step.title}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-cyanline">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-mint" aria-hidden="true" />
                ) : (
                  <CircleDashed className="h-5 w-5 text-amber" aria-hidden="true" />
                )}
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">{step.title}</h2>
              <p className="mt-2 break-words text-sm leading-6 text-slate-400">{step.detail}</p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

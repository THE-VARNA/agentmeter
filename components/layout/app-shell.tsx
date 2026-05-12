"use client";

import {
  Activity,
  Cable,
  Coins,
  Gauge,
  Home,
  KeyRound,
  ListChecks,
  Settings,
  TerminalSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Command", icon: Home },
  { href: "/onboarding", label: "Onboarding", icon: ListChecks },
  { href: "/endpoints", label: "Endpoints", icon: Cable },
  { href: "/agent-console", label: "Agent Console", icon: TerminalSquare },
  { href: "/credits", label: "Credits", icon: Coins },
  { href: "/ledger", label: "Ledger", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex min-h-10 items-center gap-3 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyanline/25 bg-cyanline/12 text-cyanline">
              <Gauge className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">AgentMeter</p>
              <p className="text-xs text-slate-400">Dodo x Solana x402</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <StatusPill tone="live">Dodo test mode</StatusPill>
            <StatusPill tone="live">Solana devnet</StatusPill>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="glass-rail h-fit rounded-lg p-2 lg:sticky lg:top-20">
          <nav className="grid gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                    active
                      ? "bg-white/12 text-white shadow-rail"
                      : "text-slate-400 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/18 p-3">
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="status-rail pulse-line h-1.5 w-4/5 origin-left rounded-full" />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Gateway, Dodo metering, and x402 settlement are wired for a live judge demo.
            </p>
          </div>
        </aside>

        <main className="min-w-0 pb-10">{children}</main>
      </div>
    </div>
  );
}

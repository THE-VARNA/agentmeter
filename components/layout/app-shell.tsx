"use client";

import {
  Activity, Cable, Coins, Gauge,
  Home, KeyRound, ListChecks,
  Settings, TerminalSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/onboarding",    label: "Onboarding",    icon: ListChecks },
  { href: "/endpoints",     label: "Endpoints",     icon: Cable },
  { href: "/agent-console", label: "Agent Console", icon: TerminalSquare },
  { href: "/credits",       label: "Credits",       icon: Coins },
  { href: "/ledger",        label: "Ledger",        icon: Activity },
  { href: "/settings",      label: "Settings",      icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(3,5,8,0.85)",
        backdropFilter: "blur(24px)"
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", gap: 16
        }}>
          <Link href="/" className="focus-ring" style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none", borderRadius: 8
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(129,140,248,0.2))",
              border: "1px solid rgba(34,211,238,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Gauge size={18} color="#22d3ee" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#eef2f7", letterSpacing: "-0.02em" }}>AgentMeter</p>
              <p style={{ margin: 0, fontSize: 11, color: "#8899aa", letterSpacing: "0.02em" }}>Dodo × Solana x402</p>
            </div>
          </Link>

          <div style={{ display: "flex", gap: 8 }}>
            <span className="pill pill-live">Dodo test</span>
            <span className="pill pill-cyan">Solana devnet</span>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid", gridTemplateColumns: "220px 1fr",
        gap: 20, padding: "20px 24px 60px"
      }}>
        {/* Sidebar */}
        <aside style={{ position: "sticky", top: 80, height: "fit-content" }}>
          <nav className="glass-rail" style={{ borderRadius: 14, padding: 8, display: "grid", gap: 2 }}>
            {nav.map((item) => {
              const active = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("nav-link focus-ring", active && "active")}>
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Live status bar */}
          <div className="glass" style={{ borderRadius: 12, padding: "14px 16px", marginTop: 10 }}>
            <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
              <div className="status-rail pulse-line" style={{ height: 4, width: "80%", borderRadius: 99 }} />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11.5, lineHeight: 1.6, color: "#8899aa" }}>
              Gateway, Dodo metering & x402 settlement live for demo.
            </p>
          </div>
        </aside>

        <main style={{ minWidth: 0, paddingBottom: 20 }}>{children}</main>
      </div>
    </div>
  );
}

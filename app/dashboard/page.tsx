"use client";

import { motion } from "framer-motion";
import { Activity, Cable, Coins, DollarSign, ExternalLink, RadioTower, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { RunDemoButton } from "@/components/demo/run-demo-button";
import type { AppState, LedgerItem } from "@/lib/types";
import { formatCompact, formatUsd } from "@/lib/utils";

function MetricCard({ label, value, detail, icon: Icon, color, bg, index }: {
  label: string; value: string; detail: string;
  icon: React.ElementType; color: string; bg: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="glass hover-gradient-border"
      style={{ borderRadius: 16, padding: "22px 20px", cursor: "default" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#8899aa", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
          <p style={{ margin: "10px 0 0", fontSize: 28, fontWeight: 800, color: "#eef2f7", letterSpacing: "-0.03em" }}>{value}</p>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: "#8899aa", lineHeight: 1.5 }}>{detail}</p>
    </motion.div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isLive = !status.includes("fail") && !status.includes("pending");
  const cls = isLive ? "pill pill-live" : status.includes("fail") ? "pill pill-error" : "pill pill-pending";
  return <span className={cls}>{status}</span>;
}

export default function DashboardPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);

  useEffect(() => {
    fetch("/api/demo/state")
      .then(r => r.json())
      .then(d => { setState(d.state); setLedger(d.ledger?.slice(0, 6) ?? []); });
  }, []);

  const metrics = state ? [
    { label: "Metered revenue", value: formatUsd(state.endpoints.reduce((s, e) => s + e.revenueUsd, 0)), detail: "From fulfilled x402 requests and Dodo usage events.", icon: DollarSign, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    { label: "API requests", value: formatCompact(state.endpoints.reduce((s, e) => s + e.requestCount, 0)), detail: "Every successful call creates an auditable gateway request.", icon: Activity, color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
    { label: "Active endpoints", value: String(state.endpoints.filter(e => e.active).length), detail: "Merchant-owned routes protected by HTTP 402 payments.", icon: Cable, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    { label: "Agent credits", value: formatCompact(state.buyers[0]?.creditBalance ?? 0), detail: "Dodo credit balance mirrored for the demo buyer.", icon: Coins, color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  ] : [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span className="pill pill-live" style={{ marginBottom: 10, display: "inline-flex" }}>Live demo</span>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#eef2f7", letterSpacing: "-0.03em" }}>Dashboard</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#8899aa" }}>AgentMeter gateway metrics and recent payment rail.</p>
          </div>
          <RunDemoButton />
        </div>
      </motion.div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {metrics.map((m, i) => <MetricCard key={m.label} {...m} index={i} />)}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        {/* Endpoint health */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="glass" style={{ borderRadius: 16, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#eef2f7" }}>Endpoint Health</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8899aa" }}>Live routes priced for autonomous agent calls.</p>
            </div>
            <Link href="/endpoints" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#8899aa", fontSize: 12, fontWeight: 600, textDecoration: "none"
            }}>
              Manage <ExternalLink size={12} />
            </Link>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px", padding: "10px 16px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Endpoint", "Price", "Status"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#8899aa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>
            {state?.endpoints.map((ep, i) => (
              <motion.div key={ep.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px", alignItems: "center", padding: "14px 16px", borderBottom: i < (state.endpoints.length - 1) ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 150ms" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Link href={`/endpoints/${ep.slug}`} style={{ textDecoration: "none" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#eef2f7" }}>{ep.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8899aa", fontFamily: "JetBrains Mono, monospace" }}>/gateway/{ep.slug}</p>
                </Link>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>{formatUsd(ep.priceUsd, 4)}</span>
                <StatusPill status={ep.active ? "live" : "paused"} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent rail */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="glass" style={{ borderRadius: 16, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#eef2f7" }}>Recent Rail</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8899aa" }}>Dodo, x402, Solana & gateway events.</p>
            </div>
            <RadioTower size={16} color="#22d3ee" />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {ledger.length === 0 ? (
              <div style={{ border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 12, padding: "24px", textAlign: "center", color: "#8899aa", fontSize: 13 }}>
                Run the demo to populate the payment rail.
              </div>
            ) : ledger.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#eef2f7" }}>{item.title}</p>
                  <StatusPill status={item.status} />
                </div>
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#8899aa", fontFamily: "JetBrains Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.txSignature ?? item.providerId ?? item.id}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stack info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="glass" style={{ borderRadius: 16, padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {[
            { icon: DollarSign, color: "#22d3ee", bg: "rgba(34,211,238,0.1)", title: "Dodo", body: "Checkout Sessions, stablecoin payments, usage events, credit ledger, and Standard Webhooks." },
            { icon: Zap, color: "#818cf8", bg: "rgba(129,140,248,0.1)", title: "Solana x402", body: "HTTP 402 exact payments with Devnet USDC settlement semantics and x402.org facilitator." },
            { icon: Cable, color: "#34d399", bg: "rgba(52,211,153,0.1)", title: "Gateway", body: "Merchant-owned endpoint protection, SSRF allowlist, rate limits, idempotent audit trail." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={item.color} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>{item.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#8899aa", lineHeight: 1.6 }}>{item.body}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

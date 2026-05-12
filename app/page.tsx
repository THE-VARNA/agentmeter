"use client";

import { motion } from "framer-motion";
import {
  Activity, ArrowRight, Cable, ChevronRight,
  Coins, Gauge, Play, Shield, Zap
} from "lucide-react";
import Link from "next/link";

// Helper for consistent fade-up animation
function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, type: "tween" }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const steps = [
  { num: "01", color: "#22d3ee", title: "Merchant creates endpoint", body: "Set a per-request price ($0.001–$10). AgentMeter wraps it with HTTP 402 protection and generates a Dodo usage meter.", icon: Cable },
  { num: "02", color: "#818cf8", title: "Agent hits the gateway", body: "The AI agent sends a standard HTTP request. The gateway returns 402 with an x402 payment requirement — USDC on Solana.", icon: Zap },
  { num: "03", color: "#34d399", title: "Solana payment verified", body: "The agent submits a signed PAYMENT-SIGNATURE header. The gateway verifies the x402 payload and routes to the upstream API.", icon: Shield },
  { num: "04", color: "#fbbf24", title: "Dodo bills & webhooks", body: "Every fulfilled call emits a Dodo usage event. Credits deduct from the buyer's balance. Webhooks reconcile the ledger.", icon: Activity },
];

const features = [
  { icon: Gauge, color: "#22d3ee", bg: "rgba(34,211,238,0.1)", title: "Dodo-grade billing", body: "Checkout sessions, stablecoin payments, credit ledger, usage events, and Standard Webhooks — all wired in." },
  { icon: Zap, color: "#818cf8", bg: "rgba(129,140,248,0.1)", title: "x402 native payments", body: "HTTP 402 protocol for autonomous agents. No API keys, no OAuth, no invoices. Just pay-per-call at machine speed." },
  { icon: Coins, color: "#34d399", bg: "rgba(52,211,153,0.1)", title: "Solana USDC micropayments", body: "$0.001 calls are viable. 400ms finality, $0.00025 fees. Solana is the only chain that makes agent commerce real." },
  { icon: Shield, color: "#fbbf24", bg: "rgba(251,191,36,0.1)", title: "Audit-first ledger", body: "Every request, payment, usage event, and webhook is idempotently logged with tx signatures and Dodo payment IDs." },
  { icon: Cable, color: "#fb7185", bg: "rgba(251,113,133,0.1)", title: "Zero-config gateway", body: "Paste an upstream URL, set a price, deploy. No SDK changes needed on the protected API — fully transparent proxy." },
  { icon: Activity, color: "#c084fc", bg: "rgba(192,132,252,0.1)", title: "Real-time dashboard", body: "Live metrics, endpoint health, gateway request logs, and credit balances — all updating without a page refresh." },
];

const stats = [
  { value: "$0.001", label: "Min per-call price" },
  { value: "400ms", label: "Solana finality" },
  { value: "HTTP 402", label: "Standard protocol" },
  { value: "∞", label: "API endpoints" },
];

export default function LandingPage() {
  return (
    <div style={{ position: "relative", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(3,5,8,0.8)", backdropFilter: "blur(24px)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(129,140,248,0.2))", border: "1px solid rgba(34,211,238,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Gauge size={17} color="#22d3ee" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#eef2f7", letterSpacing: "-0.02em" }}>AgentMeter</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg, #22d3ee, #818cf8)", color: "#04080e", textDecoration: "none", boxShadow: "0 4px 14px rgba(34,211,238,0.25)" }}>
              Launch app <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 130, paddingBottom: 80, position: "relative", textAlign: "center" }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 50, left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(129,140,248,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "tween" }}>
            <span className="pill pill-cyan" style={{ marginBottom: 24, display: "inline-flex" }}>Dodo × Solana x402 × AI Agents</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "tween" }}
            style={{ margin: "0 0 24px", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#eef2f7" }}
          >
            The payment layer{" "}
            <span style={{ background: "linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI agents</span>
            <br />were built for
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: "tween" }}
            style={{ margin: "0 0 40px", fontSize: "clamp(16px, 2vw, 20px)", color: "#8899aa", lineHeight: 1.65, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}
          >
            Sell metered API access to autonomous agents using Dodo-grade billing and Solana USDC micropayments.
            No accounts, no invoices — just{" "}
            <code style={{ color: "#22d3ee", fontFamily: "JetBrains Mono, monospace", fontSize: "0.9em" }}>HTTP 402</code>.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, type: "tween" }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)", color: "#04080e", textDecoration: "none", boxShadow: "0 8px 32px rgba(34,211,238,0.32)" }}>
              <Play size={15} fill="#04080e" /> Launch Demo
            </Link>
            <Link href="/agent-console" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#eef2f7", textDecoration: "none", backdropFilter: "blur(12px)" }}>
              Watch x402 flow <ChevronRight size={14} />
            </Link>
          </motion.div>

          {/* Hero visual */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7, type: "tween" }}
            style={{ marginTop: 64 }}>
            <div className="glass-strong" style={{ borderRadius: 20, padding: "32px 24px", maxWidth: 760, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", rowGap: 20 }}>
                {[
                  { label: "AI Agent", sub: "autonomous client", color: "#818cf8", arrow: false },
                  { label: "→", sub: "HTTP GET", color: "#8899aa", arrow: true },
                  { label: "AgentMeter", sub: "x402 gateway", color: "#22d3ee", main: true, arrow: false },
                  { label: "→", sub: "USDC on Solana", color: "#8899aa", arrow: true },
                  { label: "Your API", sub: "protected endpoint", color: "#34d399", arrow: false },
                ].map((node, i) =>
                  node.arrow ? (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "0 0 auto" }}>
                      <span style={{ fontSize: 22, color: node.color }}>→</span>
                      <span style={{ fontSize: 10, color: "#445566" }}>{node.sub}</span>
                    </div>
                  ) : (
                    <div key={i} style={{ flex: 1, minWidth: 120, background: node.main ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${node.main ? "rgba(34,211,238,0.28)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "14px 16px", textAlign: "center", boxShadow: node.main ? "0 0 28px rgba(34,211,238,0.1)" : "none" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: node.color }}>{node.label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#8899aa" }}>{node.sub}</p>
                    </div>
                  )
                )}
              </div>
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { label: "HTTP 402", detail: "payment challenge", color: "#fbbf24" },
                  { label: "Dodo usage", detail: "event ingested", color: "#22d3ee" },
                  { label: "Credit ledger", detail: "updated & auditable", color: "#34d399" },
                ].map(t => (
                  <div key={t.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: t.color }}>{t.label}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8899aa" }}>{t.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "20px 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div className="glass hover-gradient-border" style={{ borderRadius: 14, padding: "24px 20px", textAlign: "center", cursor: "default" }}>
                <p style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #22d3ee, #818cf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#8899aa" }}>{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "60px 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <span className="pill pill-violet" style={{ marginBottom: 14, display: "inline-flex" }}>How it works</span>
              <h2 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#eef2f7" }}>
                Four steps to{" "}
                <span style={{ background: "linear-gradient(135deg, #22d3ee, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>agent-native billing</span>
              </h2>
            </div>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeUp key={step.num} delay={i * 0.1}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, type: "tween" }}
                    className="glass hover-gradient-border"
                    style={{ borderRadius: 16, padding: "28px 24px", cursor: "default" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: "0.08em", opacity: 0.7 }}>{step.num}</span>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${step.color}18`, border: `1px solid ${step.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={step.color} />
                      </div>
                    </div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#eef2f7" }}>{step.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#8899aa", lineHeight: 1.65 }}>{step.body}</p>
                  </motion.div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "60px 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="pill pill-live" style={{ marginBottom: 14, display: "inline-flex" }}>Features</span>
              <h2 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#eef2f7" }}>
                Enterprise billing.{" "}
                <span style={{ background: "linear-gradient(135deg, #22d3ee, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Agent speed.</span>
              </h2>
            </div>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeUp key={f.title} delay={i * 0.07}>
                  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2, type: "tween" }}
                    className="glass hover-gradient-border"
                    style={{ borderRadius: 16, padding: "26px 24px", cursor: "default" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, border: `1px solid ${f.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                      <Icon size={20} color={f.color} />
                    </div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#eef2f7" }}>{f.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#8899aa", lineHeight: 1.65 }}>{f.body}</p>
                  </motion.div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px 120px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <FadeUp>
            <div className="glass-strong" style={{ borderRadius: 24, padding: "56px 40px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
              <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#eef2f7", position: "relative" }}>
                Ready to monetize your API{" "}
                <span style={{ background: "linear-gradient(135deg, #22d3ee, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>for agents?</span>
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: 16, color: "#8899aa", lineHeight: 1.6, position: "relative" }}>
                Launch the demo — watch the full x402 payment flow, Dodo usage events,
                and credit ledger update in real time.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, #22d3ee, #818cf8)", color: "#04080e", textDecoration: "none", boxShadow: "0 8px 32px rgba(34,211,238,0.35)" }}>
                  <Play size={15} fill="#04080e" /> Open Dashboard
                </Link>
                <Link href="/agent-console" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, fontSize: 15, fontWeight: 600, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#eef2f7", textDecoration: "none" }}>
                  Agent Console <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Gauge size={16} color="#22d3ee" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#8899aa" }}>AgentMeter</span>
          <span style={{ fontSize: 12, color: "#445566" }}>— Dodo Payments × Solana Hackathon 2026</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[{ label: "Dashboard", href: "/dashboard" }, { label: "Endpoints", href: "/endpoints" }, { label: "Agent Console", href: "/agent-console" }, { label: "Ledger", href: "/ledger" }].map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "#8899aa", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

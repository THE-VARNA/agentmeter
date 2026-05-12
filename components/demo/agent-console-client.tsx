"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Play, RefreshCw, TerminalSquare, Zap } from "lucide-react";
import { useState } from "react";

import type { DemoRun, DemoStep } from "@/lib/types";

const agentScript = `// Autonomous agent payment flow
const response = await fetch("/gateway/weather-alpha");

if (response.status === 402) {
  const requirement = await response.json();
  // x402 version 2 — exact USDC on Solana Devnet
  const payment = await agentWallet.signX402(requirement);

  return fetch("/gateway/weather-alpha", {
    headers: { "PAYMENT-SIGNATURE": payment }
  });
}`;

type DemoResponse = { demoRun: DemoRun; requirement: unknown; upstreamResponse: unknown; usageEvent: unknown; dodoUsage: unknown; };

const stepColors: Record<string, string> = {
  request: "#22d3ee", challenge: "#818cf8", payment: "#34d399", fulfillment: "#fbbf24", metering: "#fb7185"
};

export function AgentConsoleClient({ initialRun }: { initialRun?: DemoRun }) {
  const [run, setRun] = useState<DemoRun | undefined>(initialRun);
  const [response, setResponse] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function execute() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/demo/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointSlug: "weather-alpha" })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? body.error ?? "Demo failed");
      setRun(body.demoRun); setResponse(body);
    } catch (e) { setError(e instanceof Error ? e.message : "Demo failed"); }
    finally { setLoading(false); }
  }

  const steps: DemoStep[] = run?.steps ?? [
    { id: "request",     title: "Agent requests paid resource", status: "pending", detail: "GET /gateway/weather-alpha — no payment header yet" },
    { id: "challenge",   title: "Gateway returns HTTP 402",     status: "pending", detail: "x402 payment requirement for Solana Devnet USDC" },
    { id: "payment",     title: "Agent submits payment proof",  status: "pending", detail: "Signed PAYMENT-SIGNATURE header with x402 v2 payload" },
    { id: "fulfillment", title: "Gateway fulfills API call",    status: "pending", detail: "Protected upstream response + PAYMENT-RESPONSE header" },
    { id: "metering",    title: "Dodo usage & credit update",   status: "pending", detail: "api.call event ingested, credit balance deducted" },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass" style={{ borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <span className="pill pill-violet" style={{ marginBottom: 10, display: "inline-flex" }}>Scripted judge path</span>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#eef2f7", letterSpacing: "-0.03em" }}>Agent Console</h1>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8899aa", maxWidth: 480 }}>
                Watch an AI agent hit a paid route, receive HTTP 402, pay on Solana, and trigger Dodo usage metering.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={execute} disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: "linear-gradient(135deg, #22d3ee, #818cf8)",
                color: "#04080e", border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 6px 24px rgba(34,211,238,0.3)"
              }}
            >
              {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={15} fill="#04080e" />}
              {loading ? "Executing…" : "Execute Flow"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.22)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#fb7185" }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-column content */}
      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 0.9fr", gap: 16 }}>

        {/* Agent script */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass" style={{ borderRadius: 16, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(34,211,238,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TerminalSquare size={14} color="#22d3ee" />
            </div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>Agent Script</h2>
          </div>
          <pre className="code-block" style={{ margin: 0, fontSize: 11.5 }}>{agentScript}</pre>
        </motion.div>

        {/* Payment timeline */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass" style={{ borderRadius: 16, padding: "22px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>Payment Timeline</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {steps.map((step, i) => {
              const color = stepColors[step.id] ?? "#22d3ee";
              const done = step.status === "complete";
              return (
                <motion.div key={step.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 10 }}
                >
                  {/* Connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <motion.div
                      animate={done ? { scale: [1, 1.2, 1], boxShadow: [`0 0 0px ${color}00`, `0 0 14px ${color}80`, `0 0 8px ${color}40`] } : {}}
                      transition={{ duration: 0.5 }}
                      style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: done ? `${color}20` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${done ? color + "40" : "rgba(255,255,255,0.09)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      {done
                        ? <CheckCircle2 size={13} color={color} />
                        : <RefreshCw size={11} color="#8899aa" style={loading ? { animation: "spin 1s linear infinite" } : {}} />
                      }
                    </motion.div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 10, background: done ? `linear-gradient(to bottom, ${color}40, rgba(255,255,255,0.06))` : "rgba(255,255,255,0.06)", marginTop: 2 }} />
                    )}
                  </div>

                  {/* Step content */}
                  <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${done ? color + "25" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: done ? "#eef2f7" : "#8899aa" }}>{step.title}</p>
                      <span className={done ? "pill pill-live" : "pill pill-pending"} style={{ fontSize: 10 }}>{step.status}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#8899aa", lineHeight: 1.5 }}>{step.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Live response */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass" style={{ borderRadius: 16, padding: "22px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>Live Response</h2>

          {/* Tx signature */}
          <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#8899aa", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>Tx Signature</p>
            <AnimatePresence mode="wait">
              <motion.p key={run?.txSignature ?? "waiting"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ margin: 0, fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#34d399", wordBreak: "break-all" }}>
                {run?.txSignature ?? "Waiting for Solana payment…"}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Collapsible response sections */}
          {response && [
            { key: "upstreamResponse", label: "API Response", color: "#34d399" },
            { key: "usageEvent", label: "Dodo Usage Event", color: "#22d3ee" },
            { key: "dodoUsage", label: "Dodo Ingest Result", color: "#818cf8" },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <button onClick={() => setExpanded(expanded === key ? null : key)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "9px 12px", cursor: "pointer", color: color, fontSize: 12, fontWeight: 600 }}>
                {label}
                {expanded === key ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              <AnimatePresence>
                {expanded === key && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <pre className="code-block" style={{ borderRadius: "0 0 10px 10px", borderTop: "none", fontSize: 10.5, maxHeight: 200 }}>
                      {JSON.stringify((response as Record<string, unknown>)[key], null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {!response && (
            <div style={{ border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: "24px", textAlign: "center", color: "#8899aa", fontSize: 13 }}>
              <Zap size={20} color="#8899aa" style={{ marginBottom: 8, display: "block", margin: "0 auto 10px" }} />
              Execute the flow to see live data
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

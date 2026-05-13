"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Play, RefreshCw, TerminalSquare, Zap } from "lucide-react";
import { useState } from "react";

import type { DemoRun, DemoStep } from "@/lib/types";

/* ── VS-Code-style token colours ── */
const C = {
  keyword:  "#c586c0",  // purple  — const, await, return, if
  fn:       "#dcdcaa",  // yellow  — fetch, signX402
  str:      "#ce9178",  // orange  — string literals
  prop:     "#9cdcfe",  // light blue — .status, .json
  comment:  "#6a9955",  // green   — comments
  punct:    "#d4d4d4",  // white-grey — brackets, operators
  num:      "#b5cea8",  // light green — 402
  var:      "#4fc1ff",  // cyan    — response, requirement, payment
};

/* Minimal hand-tokenised JSX for the agent script */
function AgentScriptHighlighted() {
  return (
    <pre style={{
      margin: 0, fontFamily: "JetBrains Mono, 'Fira Code', monospace",
      fontSize: 12.5, lineHeight: 1.75, overflowX: "auto",
      background: "transparent", whiteSpace: "pre"
    }}>
      {/* line 1 */}
      <span style={{ color: C.comment }}>{"// Autonomous agent payment flow"}</span>{"\n"}

      {/* line 2 */}
      <span style={{ color: C.keyword }}>{"const "}</span>
      <span style={{ color: C.var }}>{"response"}</span>
      <span style={{ color: C.punct }}>{" = "}</span>
      <span style={{ color: C.keyword }}>{"await "}</span>
      <span style={{ color: C.fn }}>{"fetch"}</span>
      <span style={{ color: C.punct }}>{"("}</span>
      <span style={{ color: C.str }}>{`"/gateway/weather-alpha"`}</span>
      <span style={{ color: C.punct }}>{")"}</span>
      <span style={{ color: C.punct }}>{";"}</span>{"\n\n"}

      {/* line 3 */}
      <span style={{ color: C.keyword }}>{"if "}</span>
      <span style={{ color: C.punct }}>{"("}</span>
      <span style={{ color: C.var }}>{"response"}</span>
      <span style={{ color: C.prop }}>{".status"}</span>
      <span style={{ color: C.punct }}>{" === "}</span>
      <span style={{ color: C.num }}>{"402"}</span>
      <span style={{ color: C.punct }}>{") {"}</span>{"\n"}

      {/* line 4 */}
      {"  "}
      <span style={{ color: C.keyword }}>{"const "}</span>
      <span style={{ color: C.var }}>{"requirement"}</span>
      <span style={{ color: C.punct }}>{" = "}</span>
      <span style={{ color: C.keyword }}>{"await "}</span>
      <span style={{ color: C.var }}>{"response"}</span>
      <span style={{ color: C.fn }}>{".json"}</span>
      <span style={{ color: C.punct }}>{"()"}</span>
      <span style={{ color: C.punct }}>{";"}</span>{"\n"}

      {/* line 5 - comment */}
      {"  "}
      <span style={{ color: C.comment }}>{"// x402 v2 — exact USDC on Solana Devnet"}</span>{"\n"}

      {/* line 6 */}
      {"  "}
      <span style={{ color: C.keyword }}>{"const "}</span>
      <span style={{ color: C.var }}>{"payment"}</span>
      <span style={{ color: C.punct }}>{" = "}</span>
      <span style={{ color: C.keyword }}>{"await "}</span>
      <span style={{ color: C.var }}>{"agentWallet"}</span>
      <span style={{ color: C.fn }}>{".signX402"}</span>
      <span style={{ color: C.punct }}>{"("}</span>
      <span style={{ color: C.var }}>{"requirement"}</span>
      <span style={{ color: C.punct }}>{")"}</span>
      <span style={{ color: C.punct }}>{";"}</span>{"\n\n"}

      {/* line 7 */}
      {"  "}
      <span style={{ color: C.keyword }}>{"return "}</span>
      <span style={{ color: C.fn }}>{"fetch"}</span>
      <span style={{ color: C.punct }}>{"("}</span>
      <span style={{ color: C.str }}>{`"/gateway/weather-alpha"`}</span>
      <span style={{ color: C.punct }}>{", {"}</span>{"\n"}

      {/* line 8 */}
      {"    "}
      <span style={{ color: C.prop }}>{"headers"}</span>
      <span style={{ color: C.punct }}>{": { "}</span>
      <span style={{ color: C.str }}>{`"PAYMENT-SIGNATURE"`}</span>
      <span style={{ color: C.punct }}>{": "}</span>
      <span style={{ color: C.var }}>{"payment"}</span>
      <span style={{ color: C.punct }}>{" }"}</span>{"\n"}

      {/* line 9 */}
      {"  "}
      <span style={{ color: C.punct }}>{"})"}</span>
      <span style={{ color: C.punct }}>{";"}</span>{"\n"}

      {/* line 10 */}
      <span style={{ color: C.punct }}>{"}"}</span>
    </pre>
  );
}

type DemoResponse = { demoRun: DemoRun; requirement: unknown; upstreamResponse: unknown; usageEvent: unknown; dodoUsage: unknown; };

const stepColors: Record<string, string> = {
  request: "#22d3ee", challenge: "#818cf8", payment: "#34d399", fulfillment: "#fbbf24", metering: "#fb7185"
};

export function AgentConsoleClient({ initialRun }: { initialRun?: DemoRun }) {
  const [run, setRun] = useState<DemoRun | undefined>(initialRun);
  const [response, setResponse] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>("upstreamResponse");

  function reset() {
    setRun(undefined);
    setResponse(null);
    setError(null);
    setExpanded("upstreamResponse");
  }

  async function execute() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/demo/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointSlug: "weather-alpha" })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? body.error ?? "Demo failed");

      // Reveal steps one-by-one with 1s delay between each
      const completedSteps: DemoStep[] = body.demoRun.steps;
      const pendingSteps: DemoStep[] = completedSteps.map(s => ({ ...s, status: "pending" as const }));

      // Start with all pending
      setRun({ ...body.demoRun, steps: pendingSteps });

      // Reveal each step after a 1-second delay
      for (let i = 0; i < completedSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRun(prev => {
          if (!prev) return prev;
          const updated = [...prev.steps];
          updated[i] = completedSteps[i];
          return { ...prev, steps: updated };
        });
      }

      // Show response data after all steps complete
      setResponse(body);
      setExpanded("upstreamResponse");
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="glass" style={{ borderRadius: 20, padding: "24px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div>
              <span className="pill pill-violet" style={{ marginBottom: 10, display: "inline-flex" }}>Scripted judge path</span>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#eef2f7", letterSpacing: "-0.03em" }}>Agent Console</h1>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8899aa", maxWidth: 480 }}>
                Watch an AI agent hit a paid route, receive HTTP 402, pay on Solana, and trigger Dodo usage metering.
              </p>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              {run && !loading && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#eef2f7", cursor: "pointer"
                  }}>
                  <RefreshCw size={15} />
                  Reset
                </motion.button>
              )}
              
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={execute} disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                  padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: "linear-gradient(135deg, #22d3ee, #818cf8)",
                  color: "#04080e", border: "none", cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1, boxShadow: "0 6px 24px rgba(34,211,238,0.3)"
                }}>
                {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={15} fill="#04080e" />}
                {loading ? "Executing…" : "Execute Flow"}
              </motion.button>
            </div>
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

      {/* Top row: Agent Script (full width) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass" style={{ borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TerminalSquare size={15} color="#22d3ee" />
          </div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>Agent Script</h2>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#8899aa", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 8px" }}>JavaScript</span>
        </div>
        {/* VS Code dark theme container */}
        <div style={{
          background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12,
          padding: "18px 20px", overflowX: "auto"
        }}>
          {/* Window dots */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["#ff5f57", "#ffbd2e", "#28ca41"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
            ))}
          </div>
          <AgentScriptHighlighted />
        </div>
      </motion.div>

      {/* Bottom row: Timeline + Live Response side by side, responsive */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        {/* Payment Timeline */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass" style={{ borderRadius: 16, padding: "22px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>Payment Timeline</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {steps.map((step, i) => {
              const color = stepColors[step.id] ?? "#22d3ee";
              const done = step.status === "complete";
              return (
                <motion.div key={step.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 10 }}>
                  {/* Icon + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <motion.div
                      animate={done ? { scale: [1, 1.2, 1], boxShadow: [`0 0 0px ${color}00`, `0 0 14px ${color}80`, `0 0 8px ${color}40`] } : {}}
                      transition={{ duration: 0.5 }}
                      style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: done ? `${color}20` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${done ? color + "40" : "rgba(255,255,255,0.09)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                      {done
                        ? <CheckCircle2 size={13} color={color} />
                        : <RefreshCw size={11} color="#8899aa" style={loading ? { animation: "spin 1s linear infinite" } : {}} />}
                    </motion.div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 8, background: done ? `linear-gradient(to bottom, ${color}40, rgba(255,255,255,0.05))` : "rgba(255,255,255,0.06)", marginTop: 2 }} />
                    )}
                  </div>
                  {/* Step card */}
                  <div style={{
                    background: done ? `${color}08` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${done ? color + "25" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 10, padding: "10px 12px", marginBottom: 2, transition: "all 300ms"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: done ? "#eef2f7" : "#8899aa" }}>{step.title}</p>
                      <span className={done ? "pill pill-live" : "pill pill-pending"} style={{ fontSize: 10, flexShrink: 0 }}>{step.status}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#8899aa", lineHeight: 1.5 }}>{step.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Response */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass" style={{ borderRadius: 16, padding: "22px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#eef2f7" }}>Live Response</h2>

          {/* Tx Signature */}
          <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, color: "#8899aa", letterSpacing: "0.06em", textTransform: "uppercase" }}>Tx Signature</p>
            <AnimatePresence mode="wait">
              <motion.p key={run?.txSignature ?? "waiting"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ margin: 0, fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#34d399", wordBreak: "break-all", lineHeight: 1.6 }}>
                {run?.txSignature ?? "Waiting for Solana payment…"}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Collapsible sections */}
          {response && [
            { key: "upstreamResponse", label: "API Response",       color: "#34d399" },
            { key: "usageEvent",       label: "Dodo Usage Event",   color: "#22d3ee" },
            { key: "dodoUsage",        label: "Dodo Ingest Result", color: "#818cf8" },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <button onClick={() => setExpanded(expanded === key ? null : key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: expanded === key ? `${color}10` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${expanded === key ? color + "30" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: expanded === key ? "10px 10px 0 0" : 10,
                  padding: "10px 14px", cursor: "pointer", color, fontSize: 12.5, fontWeight: 600,
                  transition: "all 150ms"
                }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                </span>
                {expanded === key ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              <AnimatePresence>
                {expanded === key && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <pre style={{
                      margin: 0, background: "#1e1e1e", border: `1px solid ${color}20`, borderTop: "none",
                      borderRadius: "0 0 10px 10px", padding: "14px 16px",
                      fontSize: 11.5, fontFamily: "JetBrains Mono, monospace",
                      color: "#d4d4d4", overflowX: "auto", maxHeight: 220, lineHeight: 1.65
                    }}>
                      {JSON.stringify((response as Record<string, unknown>)[key], null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {!response && (
            <div style={{ border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: "28px 20px", textAlign: "center", color: "#8899aa", fontSize: 13 }}>
              <Zap size={22} color="#445566" style={{ display: "block", margin: "0 auto 10px" }} />
              Execute the flow to see live data
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

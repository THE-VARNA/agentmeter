"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight, CheckCircle, Loader2, Play, Zap } from "lucide-react";
import { useState } from "react";

import type { DemoRun } from "@/lib/types";

export function RunDemoButton({
  onComplete,
  compact = false
}: {
  onComplete?: (run: DemoRun) => void;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<DemoRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDemo() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/demo/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointSlug: "weather-alpha" })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? body.error ?? "Demo failed");
      setLastRun(body.demoRun);
      onComplete?.(body.demoRun);
    } catch (e) { setError(e instanceof Error ? e.message : "Demo failed"); }
    finally { setLoading(false); }
  }

  if (compact) {
    return (
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={runDemo} disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
          borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer",
          background: "linear-gradient(135deg, #22d3ee, #818cf8)", color: "#04080e",
          boxShadow: "0 4px 16px rgba(34,211,238,0.25)", opacity: loading ? 0.7 : 1
        }}>
        {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={14} fill="#04080e" />}
        {loading ? "Running…" : "Run Demo"}
      </motion.button>
    );
  }

  return (
    <div className="glass" style={{ borderRadius: 16, padding: "28px", overflow: "hidden", position: "relative" }}>
      {/* Background accent */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div>
          <span className="pill pill-live" style={{ marginBottom: 12, display: "inline-flex" }}>First-prize demo path</span>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 3.5vw, 40px)", fontWeight: 900, color: "#eef2f7", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Metered APIs for autonomous agents,{" "}
            <span className="gradient-text">paid per call on Solana.</span>
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.65, color: "#8899aa", maxWidth: 580 }}>
            Dodo handles checkout, credits, usage billing, webhooks, and receipts.
            AgentMeter handles HTTP 402 challenges, Solana x402 settlement, and protected API fulfillment.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 10px 36px rgba(34,211,238,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={runDemo} disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg, #22d3ee, #818cf8)", color: "#04080e",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 28px rgba(34,211,238,0.32)", opacity: loading ? 0.75 : 1,
              transition: "opacity 200ms"
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={16} fill="#04080e" />}
            {loading ? "Executing x402 flow…" : "Run Agent Payment Demo"}
          </motion.button>

          {/* Status bar */}
          <AnimatePresence mode="wait">
            <motion.div key={lastRun?.id ?? error ?? "idle"}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 10,
                background: lastRun ? "rgba(52,211,153,0.08)" : error ? "rgba(251,113,133,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${lastRun ? "rgba(52,211,153,0.22)" : error ? "rgba(251,113,133,0.22)" : "rgba(255,255,255,0.09)"}`,
                fontSize: 13, color: lastRun ? "#34d399" : error ? "#fb7185" : "#8899aa"
              }}
            >
              {lastRun ? <CheckCircle size={14} /> : error ? null : <Activity size={14} />}
              <span>
                {lastRun
                  ? `✓ ${lastRun.txSignature?.slice(0, 28)}…`
                  : error || "Shows 402 → Solana payment → Dodo usage event"}
              </span>
              {!lastRun && !error && <ArrowRight size={12} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

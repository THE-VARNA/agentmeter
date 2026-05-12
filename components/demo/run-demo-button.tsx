"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function RunDemoButton() {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: "28px", overflow: "hidden", position: "relative" }}>
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
          <motion.div whileHover={{ scale: 1.03, boxShadow: "0 10px 36px rgba(34,211,238,0.4)" }} whileTap={{ scale: 0.97 }}>
            <Link href="/agent-console" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg, #22d3ee, #818cf8)", color: "#04080e",
              textDecoration: "none", boxShadow: "0 6px 28px rgba(34,211,238,0.32)"
            }}>
              <Play size={16} fill="#04080e" />
              Run Agent Payment Demo
            </Link>
          </motion.div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            fontSize: 13, color: "#8899aa"
          }}>
            <span>402 → Solana payment → Dodo usage event</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

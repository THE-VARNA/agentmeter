"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, CreditCard, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { useState } from "react";

import { CREDIT_PACKS, DODO_STABLECOIN_METHOD } from "@/lib/constants";
import type { Buyer, DodoCheckout } from "@/lib/types";
import { formatCompact, formatUsd } from "@/lib/utils";

const packColors = ["#22d3ee", "#818cf8", "#34d399"];
const packBgs    = ["rgba(34,211,238,0.1)", "rgba(129,140,248,0.1)", "rgba(52,211,153,0.1)"];

export function CreditsClient({ buyer, initialCheckouts }: { buyer: Buyer; initialCheckouts: DodoCheckout[] }) {
  const [checkouts, setCheckouts] = useState(initialCheckouts);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPurchased, setLastPurchased] = useState<number | null>(null);

  async function createCheckout(amountUsd: number) {
    setLoading(amountUsd); setError(null);
    try {
      const res = await fetch("/api/dodo/checkout/credit-pack", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd, buyerId: buyer.id })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? body.error ?? "Checkout failed");
      setCheckouts(c => [body.checkout, ...c]);
      setLastPurchased(amountUsd);
      window.open(body.checkout.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (e) { setError(e instanceof Error ? e.message : "Checkout failed"); }
    finally { setLoading(null); }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass" style={{ borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <span className="pill pill-live" style={{ marginBottom: 10, display: "inline-flex" }}>Dodo credit packs</span>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#eef2f7", letterSpacing: "-0.03em" }}>Credits</h1>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8899aa", maxWidth: 440 }}>
                One-time Dodo Checkout Sessions fund API-call credits for autonomous agents.
              </p>
            </div>

            {/* Balance card */}
            <motion.div
              animate={{ boxShadow: ["0 0 20px rgba(52,211,153,0.1)", "0 0 40px rgba(52,211,153,0.2)", "0 0 20px rgba(52,211,153,0.1)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 14, padding: "18px 24px", textAlign: "center", minWidth: 180 }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#34d399", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Current balance</p>
              <motion.p
                key={buyer.creditBalance}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 900, color: "#eef2f7", letterSpacing: "-0.04em" }}
              >
                {formatCompact(buyer.creditBalance)}
              </motion.p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8899aa" }}>API call credits</p>
            </motion.div>
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

      {/* Credit packs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {CREDIT_PACKS.map((pack, i) => {
          const color = packColors[i];
          const bg = packBgs[i];
          const isLoading = loading === pack.amountUsd;
          const isLast = lastPurchased === pack.amountUsd;

          return (
            <motion.div key={pack.amountUsd}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="hover-gradient-border"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 16, padding: "24px 22px",
                backdropFilter: "blur(20px)", cursor: "default"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#8899aa", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{pack.label}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 38, fontWeight: 900, color: "#eef2f7", letterSpacing: "-0.04em" }}>{formatUsd(pack.amountUsd)}</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <WalletCards size={20} color={color} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color }}>
                  {formatCompact(pack.credits)}
                </span>
                <span style={{ fontSize: 14, color: "#8899aa", marginLeft: 6 }}>API call credits</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => createCheckout(pack.amountUsd)}
                disabled={isLoading}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: isLast ? `${color}20` : `linear-gradient(135deg, ${color}20, ${color}10)`,
                  border: `1px solid ${color}40`, color, cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1, transition: "all 200ms"
                }}
              >
                {isLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> :
                 isLast ? <CheckCircle size={14} /> : <CreditCard size={14} />}
                {isLoading ? "Opening Dodo…" : isLast ? "Session created!" : "Launch Dodo checkout"}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Checkout status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="glass" style={{ borderRadius: 16, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#eef2f7" }}>Checkout Status</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8899aa" }}>
              Stablecoin method: <code style={{ color: "#22d3ee", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{DODO_STABLECOIN_METHOD}</code>
            </p>
          </div>
          <a href="https://customer.dodopayments.com" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#8899aa", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            Customer portal <ExternalLink size={11} />
          </a>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {checkouts.length === 0 ? (
            <div style={{ border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 12, padding: "28px", textAlign: "center", color: "#8899aa", fontSize: 13 }}>
              No checkout sessions yet — launch a credit pack above.
            </div>
          ) : (
            checkouts.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#eef2f7" }}>{c.productId}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8899aa", fontFamily: "JetBrains Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.providerId}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>{formatUsd(c.amountUsd)}</span>
                <span className={c.rawStatus.includes("fail") ? "pill pill-error" : "pill pill-live"} style={{ fontSize: 10 }}>{c.rawStatus}</span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { LedgerItem } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

const kindColors: Record<string, string> = {
  dodo: "#22d3ee", credit: "#34d399", x402: "#818cf8", gateway: "#fbbf24", demo: "#fb7185"
};

export function LedgerClient({ initialLedger }: { initialLedger: LedgerItem[] }) {
  const [ledger, setLedger] = useState(initialLedger);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(
    () => ledger.filter((item) =>
      `${item.title} ${item.status} ${item.txSignature ?? ""} ${item.providerId ?? ""}`
        .toLowerCase().includes(query.toLowerCase())
    ), [ledger, query]
  );

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/ledger");
    const body = await res.json();
    setLedger(body.ledger);
    setLoading(false);
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass" style={{ borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <span className="pill pill-live" style={{ marginBottom: 10, display: "inline-flex" }}>Live audit trail</span>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#eef2f7", letterSpacing: "-0.03em" }}>Ledger</h1>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8899aa" }}>
                Unified trace across Dodo payments, credits, usage events, Solana signatures, and gateway requests.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={refresh} disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
                borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#8899aa", opacity: loading ? 0.6 : 1
              }}>
              {loading
                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                : <RefreshCw size={13} />}
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Search + table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="glass" style={{ borderRadius: 16, padding: "24px" }}>

        {/* Search bar */}
        <div style={{ position: "relative", maxWidth: 440, marginBottom: 20 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8899aa", pointerEvents: "none" }} />
          <input className="input-glass focus-ring" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search transaction, webhook, or status…" type="search"
            style={{ paddingLeft: 36 }} />
        </div>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "110px 1fr 90px 170px",
          padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: "10px 10px 0 0",
          border: "1px solid rgba(255,255,255,0.07)", borderBottom: "none"
        }}>
          {["Type", "Event", "Amount", "Timestamp"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#8899aa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#8899aa", fontSize: 13 }}>
              {query ? "No entries match your search." : "Run the demo to populate the ledger."}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const color = kindColors[item.kind] ?? "#8899aa";
                const isError = item.status.includes("fail");
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      display: "grid", gridTemplateColumns: "110px 1fr 90px 170px",
                      alignItems: "center", gap: 12, padding: "13px 14px",
                      borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      transition: "background 150ms"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Kind */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      background: `${color}15`, border: `1px solid ${color}25`, color
                    }}>
                      {item.kind}
                    </span>

                    {/* Event */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#eef2f7" }}>{item.title}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#8899aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.txSignature ?? item.providerId ?? item.id}
                      </p>
                    </div>

                    {/* Amount */}
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "JetBrains Mono, monospace", color: "#22d3ee" }}>
                      {item.amountUsd ? formatUsd(item.amountUsd, 4) : "—"}
                    </span>

                    {/* Time */}
                    <span style={{ fontSize: 11, color: "#8899aa" }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}

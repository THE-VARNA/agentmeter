"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface DodoOverlayProps {
  checkoutUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DodoOverlay({ checkoutUrl, onClose, onSuccess }: DodoOverlayProps) {
  // Listen for postMessage from Dodo iframe on payment success
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (
        typeof e.data === "object" &&
        (e.data?.type === "DODO_PAYMENT_SUCCESS" ||
          e.data?.status === "success" ||
          e.data?.event === "payment.completed")
      ) {
        onSuccess?.();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  // Trap escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
      >
        <motion.div
          key="overlay-panel"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%", maxWidth: 520,
            background: "rgba(12,16,25,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22d3ee", boxShadow: "0 0 8px #22d3ee" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#8899aa" }}>Dodo Payments · Secure Checkout</span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.06)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#8899aa",
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Iframe */}
          <iframe
            src={checkoutUrl}
            title="Dodo Checkout"
            allow="payment"
            style={{
              width: "100%",
              height: 560,
              border: "none",
              display: "block",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

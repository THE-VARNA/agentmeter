"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function GlassCard({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`glass ${className ?? ""}`}
      style={{ borderRadius: 16, padding: "24px", ...style }}
    >
      {children}
    </motion.div>
  );
}

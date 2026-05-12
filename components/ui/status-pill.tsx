import type { ReactNode } from "react";

type Tone = "live" | "pending" | "error" | "cyan" | "violet";

const cls: Record<Tone, string> = {
  live:    "pill pill-live",
  pending: "pill pill-pending",
  error:   "pill pill-error",
  cyan:    "pill pill-cyan",
  violet:  "pill pill-violet",
};

export function StatusPill({ tone = "pending", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cls[tone]}>{children}</span>;
}

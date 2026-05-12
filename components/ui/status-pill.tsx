import { CheckCircle2, CircleAlert, Clock3, RadioTower } from "lucide-react";

import { cn } from "@/lib/utils";

const styles = {
  live: "border-mint/30 bg-mint/12 text-mint",
  pending: "border-amber/30 bg-amber/12 text-amber",
  error: "border-rose/30 bg-rose/12 text-rose",
  neutral: "border-white/15 bg-white/8 text-slate-300"
} as const;

const icons = {
  live: CheckCircle2,
  pending: Clock3,
  error: CircleAlert,
  neutral: RadioTower
};

export function StatusPill({
  tone = "neutral",
  children,
  className
}: {
  tone?: keyof typeof styles;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[tone];

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        styles[tone],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

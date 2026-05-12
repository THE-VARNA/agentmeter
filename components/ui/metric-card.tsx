import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "cyan"
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "cyan" | "mint" | "amber" | "rose";
}) {
  const toneClass = {
    cyan: "text-cyanline bg-cyanline/12",
    mint: "text-mint bg-mint/12",
    amber: "text-amber bg-amber/12",
    rose: "text-rose bg-rose/12"
  }[tone];

  return (
    <GlassCard className="min-h-36">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-white">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">{detail}</p>
    </GlassCard>
  );
}

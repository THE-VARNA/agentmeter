import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <section className={cn("glass-panel rounded-lg p-5", className)} {...props}>
      {children}
    </section>
  );
}

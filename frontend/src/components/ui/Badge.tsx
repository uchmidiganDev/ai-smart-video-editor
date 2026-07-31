import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "violet" | "cyan";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-white/[0.08] text-white/70 border-white/10",
  success: "bg-signal-success/15 text-signal-success border-signal-success/25",
  warning: "bg-signal-warning/15 text-signal-warning border-signal-warning/25",
  danger: "bg-signal-danger/15 text-signal-danger border-signal-danger/25",
  violet: "bg-accent-violet/15 text-accent-violet border-accent-violet/25",
  cyan: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/25",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import { Check, Loader2 } from "lucide-react";
import type { PipelineStageDef } from "@/types";
import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui";

export type StepStatus = "done" | "active" | "pending";

export function StepRow({
  stage,
  status,
  progress,
  index,
}: {
  stage: PipelineStageDef;
  status: StepStatus;
  progress: number;
  index: number;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
            status === "done" && "border-signal-success/40 bg-signal-success/15 text-signal-success",
            status === "active" && "border-accent-violet/50 bg-brand-gradient text-white shadow-glow-violet",
            status === "pending" && "border-white/10 bg-white/[0.03] text-white/30",
          )}
        >
          {status === "done" ? (
            <Check className="h-4 w-4" />
          ) : status === "active" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            index + 1
          )}
        </div>
        <div className={cn("mt-1 w-px flex-1", status === "done" ? "bg-signal-success/30" : "bg-white/10")} />
      </div>

      <div className={cn("min-w-0 flex-1 pb-6", status === "pending" && "opacity-40")}>
        <p
          className={cn(
            "text-sm font-medium",
            status === "active" ? "text-white" : status === "done" ? "text-white/80" : "text-white/50",
          )}
        >
          {stage.label}
          {status === "active" && "..."}
        </p>
        <p className="mt-0.5 text-xs text-white/35">{stage.hint}</p>
        {status === "active" && (
          <div className="mt-2 max-w-xs">
            <ProgressBar value={progress} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
}

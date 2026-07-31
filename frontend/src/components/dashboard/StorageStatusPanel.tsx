import { HardDrive } from "lucide-react";
import type { Project } from "@/types";
import { GlassCard, ProgressBar } from "@/components/ui";
import { formatBytes } from "@/lib/format";

const TOTAL_QUOTA_BYTES = 10 * 1024 * 1024 * 1024;

export function StorageStatusPanel({ projects }: { projects: Project[] }) {
  const used = projects.reduce((sum, p) => sum + p.sourceSizeBytes, 0);
  const pct = Math.min(100, (used / TOTAL_QUOTA_BYTES) * 100);

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center gap-2 text-white/70">
        <HardDrive className="h-4 w-4" />
        <p className="text-sm font-semibold text-white">Xotira holati</p>
      </div>
      <ProgressBar value={pct} className="h-2" />
      <div className="mt-2 flex items-center justify-between text-xs text-white/45">
        <span>{formatBytes(used)} ishlatildi</span>
        <span>{formatBytes(TOTAL_QUOTA_BYTES)} dan</span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/35">
        Barcha yuklangan videolar va tayyor highlight fayllar shu xotirada saqlanadi.
      </p>
    </GlassCard>
  );
}

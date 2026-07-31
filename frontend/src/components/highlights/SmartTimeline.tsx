import type { Highlight } from "@/types";
import { GlassCard } from "@/components/ui";
import { formatTime } from "@/lib/format";
import { CATEGORY_COLORS } from "@/lib/labels";

export function SmartTimeline({ highlights, durationSec }: { highlights: Highlight[]; durationSec: number }) {
  return (
    <GlassCard className="p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Smart Timeline</p>
      <div className="relative h-12 w-full rounded-lg bg-white/[0.04]">
        {highlights.map((h) => {
          const left = (h.start / durationSec) * 100;
          const width = Math.max(0.6, ((h.end - h.start) / durationSec) * 100);
          return (
            <div
              key={h.id}
              className="absolute top-1 h-10 rounded-md transition-opacity"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: CATEGORY_COLORS[h.category],
                opacity: h.included ? 0.85 : 0.25,
              }}
              title={`${h.title} — ${h.score}% (${formatTime(h.start)}–${formatTime(h.end)})`}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-white/30">
        <span>00:00</span>
        <span>{formatTime(durationSec / 2)}</span>
        <span>{formatTime(durationSec)}</span>
      </div>
    </GlassCard>
  );
}

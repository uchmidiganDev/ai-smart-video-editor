import type { Highlight } from "@/types";
import { GlassCard, Switch, Badge } from "@/components/ui";
import { formatTime } from "@/lib/format";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

function scoreTone(score: number): "success" | "warning" | "violet" {
  if (score >= 85) return "success";
  if (score >= 70) return "violet";
  return "warning";
}

export function HighlightCard({
  highlight,
  onToggle,
}: {
  highlight: Highlight;
  onToggle: (id: string) => void;
}) {
  return (
    <GlassCard className={`p-4 transition-opacity ${!highlight.included ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge
              tone="neutral"
              style={{ color: CATEGORY_COLORS[highlight.category], borderColor: `${CATEGORY_COLORS[highlight.category]}40` }}
            >
              {CATEGORY_LABELS[highlight.category]}
            </Badge>
            <span className="font-mono text-[11px] text-white/35">
              {formatTime(highlight.start)}–{formatTime(highlight.end)}
            </span>
          </div>
          <p className="text-sm font-semibold text-white">{highlight.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{highlight.reason}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <Badge tone={scoreTone(highlight.score)} className="text-sm font-bold">
            {highlight.score}%
          </Badge>
          <Switch checked={highlight.included} onCheckedChange={() => onToggle(highlight.id)} />
        </div>
      </div>
    </GlassCard>
  );
}

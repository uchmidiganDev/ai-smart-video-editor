import type { SubtitleLang, SubtitleLine } from "@/types";
import { GlassCard, Badge } from "@/components/ui";
import { formatTime } from "@/lib/format";

export function SubtitleEditor({ lines, lang }: { lines: SubtitleLine[]; lang: SubtitleLang }) {
  return (
    <GlassCard className="max-h-[420px] divide-y divide-white/[0.06] overflow-y-auto">
      {lines.map((line) => (
        <div key={line.id} className="flex items-start gap-3 px-4 py-3">
          <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] text-white/35">
            {formatTime(line.start)}
          </span>
          <p className="flex-1 text-sm text-white/85">{line.text}</p>
          {lang !== "uz" && (
            <Badge tone="cyan" className="shrink-0 text-[10px]">
              AI tarjima
            </Badge>
          )}
        </div>
      ))}
    </GlassCard>
  );
}

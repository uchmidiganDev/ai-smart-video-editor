import type { Speaker } from "@/types";
import { GlassCard } from "@/components/ui";
import { formatTime } from "@/lib/format";

export function SpeakerTimeline({ speakers, durationSec }: { speakers: Speaker[]; durationSec: number }) {
  const flatSegments = speakers
    .flatMap((sp) => sp.segments.map((seg) => ({ ...seg, speaker: sp })))
    .sort((a, b) => a.start - b.start);

  const totalTalk = speakers.reduce((sum, sp) => sum + sp.talkTimeSec, 0) || 1;

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {speakers.map((sp) => (
            <div key={sp.id} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
              <span className="font-medium text-white/80">{sp.name}</span>
              <span className="text-white/35">
                {formatTime(sp.talkTimeSec)} · {Math.round((sp.talkTimeSec / totalTalk) * 100)}%
              </span>
            </div>
          ))}
        </div>

        <div className="relative h-10 w-full overflow-hidden rounded-lg bg-white/[0.04]">
          {flatSegments.map((seg, i) => {
            const left = (seg.start / durationSec) * 100;
            const width = Math.max(0.4, ((seg.end - seg.start) / durationSec) * 100);
            return (
              <div
                key={i}
                className="group absolute top-0 h-full cursor-pointer opacity-90 transition-opacity hover:opacity-100"
                style={{ left: `${left}%`, width: `${width}%`, backgroundColor: seg.speaker.color }}
                title={`${seg.speaker.name}: ${formatTime(seg.start)}–${formatTime(seg.end)}`}
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

      <GlassCard className="divide-y divide-white/[0.06]">
        {flatSegments.map((seg, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.speaker.color }} />
            <span className="w-28 shrink-0 font-mono text-xs text-white/45">
              {formatTime(seg.start)}–{formatTime(seg.end)}
            </span>
            <span className="font-medium text-white/85">{seg.speaker.name}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

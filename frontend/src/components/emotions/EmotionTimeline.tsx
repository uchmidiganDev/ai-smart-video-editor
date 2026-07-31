import type { EmotionPoint, EmotionType } from "@/types";
import { GlassCard } from "@/components/ui";
import { formatTime } from "@/lib/format";
import { EMOTION_COLORS, EMOTION_EMOJI, EMOTION_LABELS } from "@/lib/labels";

const ALL_EMOTIONS: EmotionType[] = ["joy", "laugh", "excitement", "surprise", "sad", "anger"];

export function EmotionTimeline({
  points,
  durationSec,
}: {
  points: EmotionPoint[];
  durationSec: number;
}) {
  const sorted = [...points].sort((a, b) => a.t - b.t);

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {ALL_EMOTIONS.map((type) => (
            <div key={type} className="flex items-center gap-1.5 text-xs">
              <span>{EMOTION_EMOJI[type]}</span>
              <span className="text-white/60">{EMOTION_LABELS[type]}</span>
            </div>
          ))}
        </div>

        <div className="relative h-16 w-full rounded-lg bg-white/[0.04]">
          {sorted.map((p) => {
            const left = (p.t / durationSec) * 100;
            return (
              <div
                key={p.id}
                className="absolute bottom-1.5 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${left}%` }}
                title={`${formatTime(p.t)} — ${EMOTION_LABELS[p.type]}`}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 6 + p.intensity * 10,
                    height: 6 + p.intensity * 10,
                    backgroundColor: EMOTION_COLORS[p.type],
                    boxShadow: `0 0 12px ${EMOTION_COLORS[p.type]}80`,
                  }}
                />
              </div>
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
        {sorted.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="text-base">{EMOTION_EMOJI[p.type]}</span>
            <span className="w-16 shrink-0 font-mono text-xs text-white/45">{formatTime(p.t)}</span>
            <span className="font-medium text-white/85">{EMOTION_LABELS[p.type]}</span>
            <span className="ml-auto text-xs text-white/35">{Math.round(p.intensity * 100)}% kuchda</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

import * as React from "react";
import { Play } from "lucide-react";
import type { SubtitleLine } from "@/types";
import { GlassCard } from "@/components/ui";
import { cn } from "@/lib/cn";

export function SubtitlePreviewTikTok({
  sourceUrl,
  lines,
}: {
  sourceUrl?: string;
  lines: SubtitleLine[];
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const activeLine = lines.find((l) => currentTime >= l.start && currentTime < l.end);

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative flex items-center justify-center bg-black">
        {sourceUrl ? (
          <video
            ref={videoRef}
            src={sourceUrl}
            className="max-h-[420px] w-full bg-black"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center text-white/30">Video mavjud emas</div>
        )}

        {activeLine && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 w-[88%] -translate-x-1/2 text-center">
            <p className="flex flex-wrap justify-center gap-x-1.5 text-lg font-extrabold leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-xl">
              {activeLine.words.map((w, i) => {
                const isSpoken = currentTime >= w.start;
                const isCurrent = currentTime >= w.start && currentTime < w.end;
                return (
                  <span
                    key={i}
                    className={cn(
                      "transition-all duration-150",
                      isCurrent
                        ? "scale-110 text-accent-cyan"
                        : isSpoken
                          ? "text-white"
                          : "text-white/50",
                    )}
                  >
                    {w.text}
                  </span>
                );
              })}
            </p>
          </div>
        )}

        {sourceUrl && (
          <button
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) void v.play();
              else v.pause();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20"
          >
            {!isPlaying && (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                <Play className="ml-1 h-6 w-6 text-white" />
              </span>
            )}
          </button>
        )}
      </div>
    </GlassCard>
  );
}

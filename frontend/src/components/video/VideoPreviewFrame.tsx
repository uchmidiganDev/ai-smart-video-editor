import * as React from "react";
import { Camera } from "lucide-react";
import type { Speaker } from "@/types";
import { GlassCard, Badge } from "@/components/ui";
import { FaceFocusOverlay } from "@/components/video/FaceFocusOverlay";

export function VideoPreviewFrame({ sourceUrl, speakers }: { sourceUrl?: string; speakers: Speaker[] }) {
  const [currentTime, setCurrentTime] = React.useState(0);

  let activeSpeaker: Speaker | undefined;
  let activeIndex = 0;
  speakers.forEach((sp, i) => {
    if (sp.segments.some((seg) => currentTime >= seg.start && currentTime < seg.end)) {
      activeSpeaker = sp;
      activeIndex = i;
    }
  });

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 text-white/70">
          <Camera className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">Active Speaker Camera &amp; Face Tracking</p>
        </div>
        {activeSpeaker && (
          <Badge tone="violet">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {activeSpeaker.name} gapiryapti
          </Badge>
        )}
      </div>
      <div className="relative bg-black">
        {sourceUrl ? (
          <video
            src={sourceUrl}
            controls
            className="max-h-[420px] w-full"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-white/30">Video mavjud emas</div>
        )}
        <FaceFocusOverlay activeSpeaker={activeSpeaker} speakerIndex={activeIndex} />
      </div>
      <p className="px-4 py-2.5 text-[11px] text-white/30">
        AI kamerani doim gapirayotgan odamga avtomatik burib, yuzni kuzatib boradi.
      </p>
    </GlassCard>
  );
}

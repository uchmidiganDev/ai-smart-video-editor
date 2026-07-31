import * as React from "react";
import { Copy, Check, Hash } from "lucide-react";
import type { HashtagSet } from "@/types";
import { GlassCard, Button } from "@/components/ui";

const PLATFORM_LABELS: Record<keyof HashtagSet, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

export function HashtagGroups({ hashtags }: { hashtags: HashtagSet }) {
  const [copiedPlatform, setCopiedPlatform] = React.useState<string | null>(null);

  function copyGroup(platform: keyof HashtagSet) {
    void navigator.clipboard.writeText(hashtags[platform].join(" "));
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform((cur) => (cur === platform ? null : cur)), 1500);
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center gap-2 text-white/70">
        <Hash className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">AI Hashtaglar</p>
      </div>
      <div className="space-y-4">
        {(Object.keys(hashtags) as (keyof HashtagSet)[]).map((platform) => (
          <div key={platform}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">{PLATFORM_LABELS[platform]}</span>
              <Button variant="ghost" size="sm" onClick={() => copyGroup(platform)}>
                {copiedPlatform === platform ? (
                  <Check className="h-3.5 w-3.5 text-signal-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags[platform].map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-accent-cyan">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

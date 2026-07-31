import * as React from "react";
import { Copy, Check, Type } from "lucide-react";
import { GlassCard } from "@/components/ui";

export function TitleSuggestions({ titles }: { titles: string[] }) {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  function copy(text: string, idx: number) {
    void navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx((cur) => (cur === idx ? null : cur)), 1500);
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center gap-2 text-white/70">
        <Type className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">AI Sarlavhalar</p>
      </div>
      <div className="space-y-1.5">
        {titles.map((title, i) => (
          <button
            key={i}
            onClick={() => copy(title, i)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/[0.05]"
          >
            <span className="min-w-0 flex-1 truncate">{title}</span>
            {copiedIdx === i ? (
              <Check className="h-4 w-4 shrink-0 text-signal-success" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-white/25" />
            )}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

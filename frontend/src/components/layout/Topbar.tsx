import { Clapperboard, CircleDot } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-base-950/70 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
          <Clapperboard className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">AI Video Editor</span>
      </div>

      <div className="hidden items-center gap-2 text-xs text-white/40 md:flex">
        <CircleDot className="h-3.5 w-3.5 text-signal-success animate-pulse-slow" />
        AI tizim faol — hybrid rejim (mahalliy + bulut)
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-glow-violet">
          TS
        </div>
      </div>
    </header>
  );
}

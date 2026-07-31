import type { ElementType } from "react";
import { FolderOpen, Loader2, CheckCircle2, TrendingUp } from "lucide-react";
import type { Project } from "@/types";
import { GlassCard } from "@/components/ui";

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ElementType;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-white leading-tight">{value}</p>
          <p className="truncate text-xs text-white/45">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

export function StatsCards({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const processing = projects.filter((p) => p.status === "processing" || p.status === "uploading").length;
  const ready = projects.filter((p) => p.status === "ready").length;
  const readyProjects = projects.filter((p) => p.status === "ready" && p.result);
  const avgScore = readyProjects.length
    ? Math.round(
        readyProjects.reduce((sum, p) => sum + (p.result?.viralScore.score ?? 0), 0) / readyProjects.length,
      )
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <Stat icon={FolderOpen} label="Jami loyihalar" value={String(total)} tone="bg-accent-blue/15 text-accent-blue" />
      <Stat
        icon={Loader2}
        label="AI ishlamoqda"
        value={String(processing)}
        tone="bg-accent-violet/15 text-accent-violet"
      />
      <Stat icon={CheckCircle2} label="Tayyor videolar" value={String(ready)} tone="bg-signal-success/15 text-signal-success" />
      <Stat
        icon={TrendingUp}
        label="O'rtacha viral ball"
        value={avgScore ? `${avgScore}/100` : "—"}
        tone="bg-accent-cyan/15 text-accent-cyan"
      />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Clapperboard, Sparkles, Users } from "lucide-react";
import type { Project } from "@/types";
import { GlassCard, Badge, ProgressBar } from "@/components/ui";
import { gradientFor } from "@/lib/gradients";
import { formatDuration, formatRelativeTime } from "@/lib/format";
import { PIPELINE_STAGES } from "@/lib/pipelineStages";

export function ProjectCard({ project }: { project: Project }) {
  const href = project.status === "ready" ? `/project/${project.id}` : `/project/${project.id}/processing`;
  const stageLabel = project.currentStage
    ? PIPELINE_STAGES.find((s) => s.id === project.currentStage)?.label
    : null;

  return (
    <Link to={href}>
      <GlassCard hover className="group overflow-hidden">
        <div className={`relative flex h-32 items-center justify-center ${gradientFor(project.gradientSeed)}`}>
          <Clapperboard className="h-9 w-9 text-white/70 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute right-2.5 top-2.5">
            {project.status === "ready" && (
              <Badge tone="violet" className="bg-black/30 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> {project.result?.viralScore.score ?? "—"} / 100
              </Badge>
            )}
            {project.status === "processing" && (
              <Badge tone="neutral" className="bg-black/30 backdrop-blur-sm">
                {Math.round(project.overallProgress)}%
              </Badge>
            )}
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <Badge tone="neutral" className="bg-black/30 backdrop-blur-sm">
              {formatDuration(project.durationSec)}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <p className="truncate text-sm font-semibold text-white">{project.name}</p>
          <p className="mt-0.5 text-xs text-white/40">{formatRelativeTime(project.createdAt)}</p>

          {project.status === "processing" && (
            <div className="mt-3">
              <ProgressBar value={project.overallProgress} className="h-1.5" />
              <p className="mt-1.5 truncate text-[11px] text-white/45">{stageLabel}...</p>
            </div>
          )}

          {project.status === "ready" && project.result && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/40">
              <Users className="h-3 w-3" />
              {project.result.speakers.length} spiker · {project.result.highlights.length} highlight
            </div>
          )}

          {project.status === "failed" && (
            <Badge tone="danger" className="mt-3">
              Xatolik yuz berdi
            </Badge>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}

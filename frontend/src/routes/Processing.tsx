import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper, ArrowLeft } from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { GlassCard, Button, Skeleton } from "@/components/ui";
import { ProcessingStepper } from "@/components/pipeline/ProcessingStepper";
import { LiveLogFeed } from "@/components/pipeline/LiveLogFeed";
import { formatDuration } from "@/lib/format";

export function Processing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === id));
  const fetchProject = useProjectsStore((s) => s.fetchProject);
  const startPipeline = usePipelineStore((s) => s.startPipeline);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    if (project) {
      setChecked(true);
      if (project.status === "processing" || project.status === "uploading") startPipeline(id);
      return;
    }
    fetchProject(id).finally(() => setChecked(true));
  }, [id, project, fetchProject, startPipeline]);

  React.useEffect(() => {
    if (project?.status === "ready") {
      const t = setTimeout(() => navigate(`/project/${project.id}`), 1100);
      return () => clearTimeout(t);
    }
  }, [project?.status, project?.id, navigate]);

  if (!project) {
    if (!checked) {
      return (
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="mx-auto h-6 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-white/50">Loyiha topilmadi.</p>
        <Link to="/">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Dashboard'ga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  const isDone = project.status === "ready";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-white md:text-2xl">
          {isDone ? "Video tayyor!" : "AI video tahlil qilmoqda..."}
        </h1>
        <p className="mt-1 text-sm text-white/45">
          {project.name} · {formatDuration(project.durationSec)}
        </p>
      </div>

      <div className="mx-auto flex max-w-xs items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 70}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - project.overallProgress / 100) }}
              transition={{ ease: "easeOut", duration: 0.25 }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="55%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            {isDone ? (
              <PartyPopper className="h-8 w-8 text-accent-cyan" />
            ) : (
              <span className="text-3xl font-bold text-white">{Math.round(project.overallProgress)}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5 md:p-6">
          <ProcessingStepper overallProgress={project.overallProgress} />
        </GlassCard>
        <LiveLogFeed logs={project.logs} />
      </div>
    </div>
  );
}

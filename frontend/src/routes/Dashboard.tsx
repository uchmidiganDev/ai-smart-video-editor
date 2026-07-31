import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Wand2, WifiOff } from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { useUiStore } from "@/store/uiStore";
import { Button, GlassCard, ProgressBar } from "@/components/ui";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentProjectsGrid } from "@/components/dashboard/RecentProjectsGrid";
import { StorageStatusPanel } from "@/components/dashboard/StorageStatusPanel";
import { PIPELINE_STAGES } from "@/lib/pipelineStages";

export function Dashboard() {
  const projects = useProjectsStore((s) => s.projects);
  const connectionError = useProjectsStore((s) => s.error);
  const openUploadModal = useUiStore((s) => s.openUploadModal);

  const activeProject = projects.find((p) => p.status === "processing" || p.status === "uploading");
  const activeStage = activeProject?.currentStage
    ? PIPELINE_STAGES.find((s) => s.id === activeProject.currentStage)
    : null;

  return (
    <div className="space-y-6 md:space-y-8">
      {connectionError && (
        <div className="flex items-center gap-2 rounded-xl border border-signal-warning/30 bg-signal-warning/10 px-4 py-3 text-xs text-signal-warning">
          <WifiOff className="h-4 w-4 shrink-0" />
          Backend serverga ulanib bo'lmadi ({connectionError}). Backend ishga tushirilganini tekshiring.
        </div>
      )}

      <GlassCard className="relative overflow-hidden p-6 md:p-10">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/60">
              <Sparkles className="h-3.5 w-3.5 text-accent-violet" />
              Sun'iy intellekt asosidagi avtomatik montaj
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Video yuklang — <span className="text-gradient">qolganini AI qiladi</span>
            </h1>
            <p className="mt-2 text-sm text-white/50 md:text-base">
              Spikerlarni aniqlash, yuzni kuzatish, eng qiziqarli lahzalarni topish va tayyor
              highlight video yaratish — hammasi avtomatik, qo'lda montajsiz.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" onClick={openUploadModal}>
                <Wand2 className="h-4 w-4" />
                Video yuklash
              </Button>
              <Link to="/projects">
                <Button size="lg" variant="secondary">
                  Barcha loyihalar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>

      <StatsCards projects={projects} />

      {activeProject && activeStage && (
        <Link to={`/project/${activeProject.id}/processing`}>
          <GlassCard hover className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{activeProject.name}</p>
                <p className="mt-0.5 text-xs text-white/45">{activeStage.label}...</p>
              </div>
              <span className="text-sm font-bold text-gradient">{Math.round(activeProject.overallProgress)}%</span>
            </div>
            <ProgressBar value={activeProject.overallProgress} className="mt-3" />
          </GlassCard>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <RecentProjectsGrid projects={projects} />
        <StorageStatusPanel projects={projects} />
      </div>
    </div>
  );
}

import * as React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, Users, Sparkles, Clock, Languages } from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { Tabs, TabsList, TabsTrigger, TabsContent, GlassCard, Button, Skeleton } from "@/components/ui";
import { formatDuration } from "@/lib/format";

import { ViralScoreCard } from "@/components/export/ViralScoreCard";
import { VideoPreviewFrame } from "@/components/video/VideoPreviewFrame";
import { SpeakerTimeline } from "@/components/speakers/SpeakerTimeline";
import { EmotionTimeline } from "@/components/emotions/EmotionTimeline";
import { SmartTimeline } from "@/components/highlights/SmartTimeline";
import { HighlightCard } from "@/components/highlights/HighlightCard";
import { LanguageSwitch } from "@/components/subtitles/LanguageSwitch";
import { SubtitlePreviewTikTok } from "@/components/subtitles/SubtitlePreviewTikTok";
import { SubtitleEditor } from "@/components/subtitles/SubtitleEditor";
import { LengthSelector } from "@/components/export/LengthSelector";
import { StyleTogglesPanel } from "@/components/export/StyleTogglesPanel";
import { TitleSuggestions } from "@/components/export/TitleSuggestions";
import { DescriptionBox } from "@/components/export/DescriptionBox";
import { HashtagGroups } from "@/components/export/HashtagGroups";
import { ExportButton } from "@/components/export/ExportButton";
import type { SubtitleLang } from "@/types";

function QuickStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/60">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-[11px] text-white/40">{label}</p>
      </div>
    </div>
  );
}

export function Workspace() {
  const { id } = useParams<{ id: string }>();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === id));
  const fetchProject = useProjectsStore((s) => s.fetchProject);
  const toggleHighlight = useProjectsStore((s) => s.toggleHighlight);
  const updateExportSettings = useProjectsStore((s) => s.updateExportSettings);
  const [subtitleLang, setSubtitleLang] = React.useState<SubtitleLang>("uz");
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!id || project) {
      setChecked(true);
      return;
    }
    fetchProject(id).finally(() => setChecked(true));
  }, [id, project, fetchProject]);

  if (!project) {
    if (!checked) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-96 w-full" />
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

  if (project.status !== "ready" || !project.result) {
    return <Navigate to={`/project/${project.id}/processing`} replace />;
  }

  const { result } = project;
  const includedCount = result.highlights.filter((h) => h.included).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/projects" className="mb-2 inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70">
            <ArrowLeft className="h-3.5 w-3.5" />
            Loyihalar
          </Link>
          <h1 className="text-xl font-bold text-white md:text-2xl">{project.name}</h1>
        </div>
        <div className="flex flex-wrap gap-5">
          <QuickStat icon={Clock} label="Davomiyligi" value={formatDuration(project.durationSec)} />
          <QuickStat icon={Users} label="Spikerlar" value={String(result.speakers.length)} />
          <QuickStat icon={Sparkles} label="Highlightlar" value={`${includedCount}/${result.highlights.length}`} />
          <QuickStat icon={Languages} label="Tillar" value="UZ · EN · RU" />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="speakers">Spikerlar</TabsTrigger>
          <TabsTrigger value="emotions">Emotsiyalar</TabsTrigger>
          <TabsTrigger value="highlights">Highlightlar</TabsTrigger>
          <TabsTrigger value="subtitles">Subtitle</TabsTrigger>
          <TabsTrigger value="export">Eksport</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <ViralScoreCard viralScore={result.viralScore} />
          <VideoPreviewFrame sourceUrl={project.sourceUrl} speakers={result.speakers} />
        </TabsContent>

        <TabsContent value="speakers" className="mt-5">
          <SpeakerTimeline speakers={result.speakers} durationSec={project.durationSec} />
        </TabsContent>

        <TabsContent value="emotions" className="mt-5">
          <EmotionTimeline points={result.emotionPoints} durationSec={project.durationSec} />
        </TabsContent>

        <TabsContent value="highlights" className="mt-5 space-y-5">
          <SmartTimeline highlights={result.highlights} durationSec={project.durationSec} />
          <div className="grid gap-3 md:grid-cols-2">
            {[...result.highlights]
              .sort((a, b) => b.score - a.score)
              .map((h) => (
                <HighlightCard key={h.id} highlight={h} onToggle={(hid) => toggleHighlight(project.id, hid)} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="subtitles" className="mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">Til tanlang — subtitle avtomatik tarjima qilingan</p>
            <LanguageSwitch value={subtitleLang} onChange={setSubtitleLang} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <SubtitlePreviewTikTok sourceUrl={project.sourceUrl} lines={result.subtitles[subtitleLang]} />
            <SubtitleEditor lines={result.subtitles[subtitleLang]} lang={subtitleLang} />
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-5 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <GlassCard className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                  Highlight video uzunligi
                </p>
                <LengthSelector
                  value={project.exportSettings.lengthSec}
                  durationSec={project.durationSec}
                  onChange={(sec) => updateExportSettings(project.id, { lengthSec: sec })}
                />
              </GlassCard>

              <StyleTogglesPanel
                settings={project.exportSettings}
                musicTrack={project.exportSettings.musicTrack}
                onUpdate={(patch) => updateExportSettings(project.id, patch)}
              />

              <ExportButton projectId={project.id} includedCount={includedCount} />
            </div>

            <div className="space-y-5">
              <TitleSuggestions titles={result.titles} />
              <DescriptionBox description={result.description} />
              <HashtagGroups hashtags={result.hashtags} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

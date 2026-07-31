import * as React from "react";
import { Download, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, GlassCard, ProgressBar } from "@/components/ui";
import { startExportJob, getExportJob, exportDownloadUrl } from "@/lib/apiClient";

type State = "idle" | "rendering" | "done" | "failed";

export function ExportButton({ projectId, includedCount }: { projectId: string; includedCount: number }) {
  const [state, setState] = React.useState<State>("idle");
  const [progress, setProgress] = React.useState(0);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function startExport() {
    if (includedCount === 0) return;
    setState("rendering");
    setProgress(0);
    setError(null);

    try {
      const job = await startExportJob(projectId);
      setJobId(job.id);

      while (true) {
        await new Promise((r) => setTimeout(r, 900));
        const status = await getExportJob(job.id);
        setProgress(status.progress);
        if (status.status === "done") {
          setState("done");
          break;
        }
        if (status.status === "failed") {
          setError(status.errorMessage || "Eksport muvaffaqiyatsiz tugadi");
          setState("failed");
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eksportni boshlab bo'lmadi");
      setState("failed");
    }
  }

  return (
    <GlassCard glow className="p-6 text-center">
      {state === "idle" && (
        <>
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent-violet" />
          <p className="text-sm font-semibold text-white">Yakuniy videoni eksport qilish</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-white/45">
            {includedCount} ta tanlangan highlight tanlangan sozlamalar bilan birlashtiriladi.
          </p>
          <Button size="lg" className="mt-5" onClick={startExport} disabled={includedCount === 0}>
            <Sparkles className="h-4 w-4" />
            Video yaratish
          </Button>
          {includedCount === 0 && (
            <p className="mt-2 text-[11px] text-signal-warning">Kamida bitta highlight tanlanishi kerak</p>
          )}
        </>
      )}

      {state === "rendering" && (
        <>
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-violet" />
          <p className="text-sm font-semibold text-white">Video render qilinmoqda (FFmpeg)...</p>
          <div className="mx-auto mt-4 max-w-xs">
            <ProgressBar value={progress} />
            <p className="mt-2 text-xs text-white/40">{progress}%</p>
          </div>
        </>
      )}

      {state === "done" && jobId && (
        <>
          <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-signal-success" />
          <p className="text-sm font-semibold text-white">Video tayyor!</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-white/45">
            Highlight video muvaffaqiyatli yaratildi va yuklab olishga tayyor.
          </p>
          <a href={exportDownloadUrl(jobId)} className="mt-5 inline-block">
            <Button size="lg">
              <Download className="h-4 w-4" />
              Yuklab olish
            </Button>
          </a>
        </>
      )}

      {state === "failed" && (
        <>
          <AlertCircle className="mx-auto mb-3 h-9 w-9 text-signal-danger" />
          <p className="text-sm font-semibold text-white">Eksport muvaffaqiyatsiz tugadi</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-signal-danger">{error}</p>
          <Button size="lg" variant="secondary" className="mt-5" onClick={startExport}>
            Qayta urinish
          </Button>
        </>
      )}
    </GlassCard>
  );
}

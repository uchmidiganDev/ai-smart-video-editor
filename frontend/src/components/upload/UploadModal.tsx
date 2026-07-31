import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FileVideo, X, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, ProgressBar, Button } from "@/components/ui";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { useUiStore } from "@/store/uiStore";
import { useProjectsStore } from "@/store/projectsStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { uploadVideo } from "@/lib/apiClient";
import { formatBytes } from "@/lib/format";

export function UploadModal() {
  const isOpen = useUiStore((s) => s.uploadModalOpen);
  const close = useUiStore((s) => s.closeUploadModal);
  const upsertProject = useProjectsStore((s) => s.upsertProject);
  const startPipeline = usePipelineStore((s) => s.startPipeline);
  const navigate = useNavigate();

  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [phase, setPhase] = React.useState<"idle" | "uploading">("idle");
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setFile(null);
    setProgress(0);
    setPhase("idle");
    setError(null);
  }

  async function handleFile(selected: File) {
    setFile(selected);
    setPhase("uploading");
    setProgress(0);
    setError(null);

    try {
      const project = await uploadVideo(selected, setProgress);
      upsertProject(project);
      close();
      reset();
      navigate(`/project/${project.id}/processing`);
      startPipeline(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklashda xatolik yuz berdi. Backend ishga tushganini tekshiring.");
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
          reset();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Yangi video yuklash</DialogTitle>
        <DialogDescription>
          Video yuklang — AI avtomatik ravishda spikerlarni aniqlaydi, eng qiziqarli lahzalarni
          topadi va tayyor highlight video yaratadi.
        </DialogDescription>

        <div className="mt-5">
          {phase === "idle" && <UploadDropzone onFile={handleFile} />}

          {phase === "uploading" && file && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
                  <FileVideo className="h-5 w-5 text-accent-violet" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-white/40">{formatBytes(file.size)}</p>
                </div>
                {progress < 100 && !error && (
                  <button
                    onClick={() => reset()}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!error && (
                <div className="mt-4">
                  <ProgressBar value={progress} />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                    <span>{progress < 100 ? "Yuklanmoqda..." : "Yuklandi, AI tahlil boshlanmoqda..."}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-signal-danger/30 bg-signal-danger/10 p-3 text-xs text-signal-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 text-[11px] text-white/35">Format: MP4, MOV, AVI, MKV</div>

          <div className="mt-4 flex justify-end gap-2">
            {error && (
              <Button variant="secondary" size="sm" onClick={reset}>
                Qayta urinish
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                close();
                reset();
              }}
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react";
import { UploadCloud, FileVideo } from "lucide-react";
import { cn } from "@/lib/cn";

const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv"];

export interface UploadDropzoneProps {
  onFile: (file: File) => void;
  error?: string | null;
}

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function UploadDropzone({ onFile, error }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isAcceptedFile(file)) {
      setLocalError("Faqat MP4, MOV, AVI yoki MKV formatidagi videolarni yuklash mumkin.");
      return;
    }
    setLocalError(null);
    onFile(file);
  }

  const shownError = error ?? localError;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          isDragging
            ? "border-accent-violet bg-accent-violet/10"
            : "border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft">
          {isDragging ? (
            <FileVideo className="h-7 w-7 text-accent-violet" />
          ) : (
            <UploadCloud className="h-7 w-7 text-white/70" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            Videoni shu yerga tashlang yoki tanlash uchun bosing
          </p>
          <p className="mt-1 text-xs text-white/40">MP4, MOV, AVI, MKV — 10, 20 yoki 60 daqiqalik video</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mov,.avi,.mkv,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {shownError && <p className="mt-3 text-xs text-signal-danger">{shownError}</p>}
    </div>
  );
}

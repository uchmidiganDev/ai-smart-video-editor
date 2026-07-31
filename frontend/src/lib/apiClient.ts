import type { ExportSettings, Project } from "@/types";
import { seedFromString } from "@/lib/format";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

function toProject(raw: Omit<Project, "gradientSeed" | "sourceUrl"> & { sourceUrl: string }): Project {
  return {
    ...raw,
    gradientSeed: seedFromString(raw.id),
    sourceUrl: raw.sourceUrl.startsWith("http") ? raw.sourceUrl : `${API_BASE}${raw.sourceUrl}`,
  };
}

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`);
  const data = await parseOrThrow(res);
  return data.map(toProject);
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  const data = await parseOrThrow(res);
  return toProject(data);
}

export function uploadVideo(file: File, onProgress: (pct: number) => void): Promise<Project> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/projects/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(toProject(JSON.parse(xhr.responseText)));
        } catch {
          reject(new Error("Serverdan noto'g'ri javob keldi"));
        }
      } else {
        let detail = xhr.statusText;
        try {
          detail = JSON.parse(xhr.responseText).detail || detail;
        } catch {
          /* ignore */
        }
        reject(new Error(detail));
      }
    };
    xhr.onerror = () => reject(new Error("Serverga ulanib bo'lmadi"));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export async function toggleHighlight(projectId: string, highlightId: string, included?: boolean): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/highlights/${highlightId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ included: included ?? null }),
  });
  return toProject(await parseOrThrow(res));
}

export async function updateExportSettings(projectId: string, patch: Partial<ExportSettings>): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/export-settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return toProject(await parseOrThrow(res));
}

export interface ExportJobStatus {
  id: string;
  projectId: string;
  status: "queued" | "rendering" | "done" | "failed";
  progress: number;
  outputAvailable: boolean;
  errorMessage: string | null;
}

export async function startExportJob(projectId: string): Promise<ExportJobStatus> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/export`, { method: "POST" });
  return parseOrThrow(res);
}

export async function getExportJob(jobId: string): Promise<ExportJobStatus> {
  const res = await fetch(`${API_BASE}/api/export-jobs/${jobId}`);
  return parseOrThrow(res);
}

export function exportDownloadUrl(jobId: string): string {
  return `${API_BASE}/api/export-jobs/${jobId}/download`;
}

export type PipelineSocketEvent =
  | { type: "snapshot"; status: string; stage: string | null; overallProgress: number; logs: { id: string; t: number; message: string }[] }
  | { type: "progress"; stage: string; overallProgress: number }
  | { type: "log"; id: string; t: number; message: string }
  | { type: "done"; status: string }
  | { type: "error"; message: string };

export function connectPipelineSocket(projectId: string, onEvent: (event: PipelineSocketEvent) => void): () => void {
  const ws = new WebSocket(`${WS_BASE}/ws/pipeline/${projectId}`);
  ws.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {
      /* ignore malformed frames */
    }
  };
  return () => ws.close();
}

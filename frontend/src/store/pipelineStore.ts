import { create } from "zustand";
import { useProjectsStore } from "@/store/projectsStore";
import { connectPipelineSocket, type PipelineSocketEvent } from "@/lib/apiClient";
import type { PipelineStageId, ProjectStatus } from "@/types";

interface PipelineState {
  activeSockets: Record<string, () => void>;
  startPipeline: (projectId: string) => void;
  stopPipeline: (projectId: string) => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  activeSockets: {},

  startPipeline: (projectId) => {
    if (get().activeSockets[projectId]) return;

    const { patchProject, appendLog, fetchProject } = useProjectsStore.getState();

    const close = connectPipelineSocket(projectId, (event: PipelineSocketEvent) => {
      switch (event.type) {
        case "snapshot":
          patchProject(projectId, {
            status: event.status as ProjectStatus,
            currentStage: (event.stage as PipelineStageId) ?? undefined,
            overallProgress: event.overallProgress,
            logs: event.logs,
          });
          break;
        case "progress":
          patchProject(projectId, {
            currentStage: event.stage as PipelineStageId,
            overallProgress: event.overallProgress,
          });
          break;
        case "log":
          appendLog(projectId, { id: event.id, t: event.t, message: event.message });
          break;
        case "done":
          void fetchProject(projectId);
          get().stopPipeline(projectId);
          break;
        case "error":
          patchProject(projectId, { status: "failed" });
          get().stopPipeline(projectId);
          break;
      }
    });

    set((s) => ({ activeSockets: { ...s.activeSockets, [projectId]: close } }));
  },

  stopPipeline: (projectId) => {
    const close = get().activeSockets[projectId];
    if (close) close();
    set((s) => {
      const next = { ...s.activeSockets };
      delete next[projectId];
      return { activeSockets: next };
    });
  },
}));

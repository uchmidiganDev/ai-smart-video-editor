import { create } from "zustand";
import type { ExportSettings, Project } from "@/types";
import * as api from "@/lib/apiClient";

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  upsertProject: (project: Project) => void;
  patchProject: (id: string, patch: Partial<Project>) => void;
  appendLog: (id: string, entry: { id: string; t: number; message: string }) => void;
  toggleHighlight: (projectId: string, highlightId: string) => Promise<void>;
  updateExportSettings: (projectId: string, patch: Partial<ExportSettings>) => Promise<void>;
  getProject: (id: string) => Project | undefined;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await api.listProjects();
      projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set({ projects, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Loyihalarni yuklab bo'lmadi" });
    }
  },

  fetchProject: async (id) => {
    try {
      const project = await api.getProject(id);
      get().upsertProject(project);
      return project;
    } catch {
      return null;
    }
  },

  upsertProject: (project) => {
    set((state) => {
      const exists = state.projects.some((p) => p.id === project.id);
      return {
        projects: exists
          ? state.projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...state.projects],
      };
    });
  },

  patchProject: (id, patch) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  },

  appendLog: (id, entry) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, logs: [...p.logs, entry].slice(-40) } : p)),
    }));
  },

  toggleHighlight: async (projectId, highlightId) => {
    const project = await api.toggleHighlight(projectId, highlightId);
    get().upsertProject(project);
  },

  updateExportSettings: async (projectId, patch) => {
    const project = await api.updateExportSettings(projectId, patch);
    get().upsertProject(project);
  },

  getProject: (id) => get().projects.find((p) => p.id === id),
}));

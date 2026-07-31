import { create } from "zustand";

interface UiState {
  uploadModalOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  uploadModalOpen: false,
  openUploadModal: () => set({ uploadModalOpen: true }),
  closeUploadModal: () => set({ uploadModalOpen: false }),
}));

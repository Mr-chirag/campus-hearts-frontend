import { create } from "zustand";

interface UiState {
  error: { title: string; message: string } | null;
  setError: (title: string, message: string) => void;
  clearError: () => void;
}

/**
 * Backs the global <ErrorModal />. The house error convention across every
 * store is: catch → console.error the server payload → setError() → re-throw.
 * Screens stay presentational and never render their own error surface.
 */
export const useUiStore = create<UiState>((set) => ({
  error: null,
  setError: (title, message) => set({ error: { title, message } }),
  clearError: () => set({ error: null }),
}));

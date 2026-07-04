import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GenerationState {
  selectedFile: File | null;
  selectedPreview: string | null;
  selectedStyleId: string | null;
  selectedStyleLabel: string | null;
  credits: number | null;
  isGenerating: boolean;

  setFile: (file: File | null, preview: string | null) => void;
  setStyle: (id: string, label: string) => void;
  setCredits: (credits: number) => void;
  decrementCredits: () => void;
  setGenerating: (loading: boolean) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationState>()((set) => ({
  selectedFile: null,
  selectedPreview: null,
  selectedStyleId: null,
  selectedStyleLabel: null,
  credits: null,
  isGenerating: false,

  setFile: (file, preview) =>
    set({ selectedFile: file, selectedPreview: preview }),

  setStyle: (id, label) =>
    set({ selectedStyleId: id, selectedStyleLabel: label }),

  setCredits: (credits) => set({ credits }),

  decrementCredits: () =>
    set((state) => ({
      credits: state.credits !== null ? Math.max(0, state.credits - 1) : null,
    })),

  setGenerating: (loading) => set({ isGenerating: loading }),

  reset: () =>
    set({
      selectedFile: null,
      selectedPreview: null,
      selectedStyleId: null,
      selectedStyleLabel: null,
      isGenerating: false,
    }),
}));

// Persistent credits store (survives page refresh)
interface CreditsStore {
  credits: number | null;
  setCredits: (c: number) => void;
  clear: () => void;
}

export const useCreditsStore = create<CreditsStore>()(
  persist(
    (set) => ({
      credits: null,
      setCredits: (c) => set({ credits: c }),
      clear: () => set({ credits: null }),
    }),
    { name: "celebswap-credits" }
  )
);

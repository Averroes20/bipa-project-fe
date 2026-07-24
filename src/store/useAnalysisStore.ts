import { create } from 'zustand';
import { getLatestAnalysis, getAnalysisById } from '../api/analyze';

interface AnalysisState {
  currentAnalysis: any | null;
  isLoading: boolean;
  error: string | null;

  fetchLatestAnalysis: () => Promise<void>;
  fetchAnalysis: (id: string) => Promise<void>;
  setCurrentAnalysis: (analysis: any) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  isLoading: false,
  error: null,

  fetchLatestAnalysis: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getLatestAnalysis();
      set({ currentAnalysis: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAnalysis: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAnalysisById(id);
      set({ currentAnalysis: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  clearAnalysis: () => set({ currentAnalysis: null, error: null })
}));

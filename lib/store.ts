import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, StoreActions } from '@/types/store';

export type StoryStudioStore = StoreState & StoreActions;

const initialTransientState = {
  status: 'idle' as const,
  currentImageIndex: 0,
  error: null as string | null,
};

export const useStoryStore = create<StoryStudioStore>()(
  persist(
    (set) => ({
      // Settings (persisted)
      childName: 'Evan',
      theme: 'mystical',
      mode: 'dark',
      starDensity: 'medium',
      starDepth: 'flat',
      goldIntensity: 0.5,

      // Story data (persisted)
      story: null,
      style: 'watercolor',
      referenceImageUrl: null,

      // Transient state (not persisted)
      ...initialTransientState,

      // Actions
      setChildName: (name) => set({ childName: name }),
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
      setStarDensity: (density) => set({ starDensity: density }),
      setStarDepth: (depth) => set({ starDepth: depth }),
      setGoldIntensity: (intensity) => set({ goldIntensity: intensity }),
      setStory: (story) => set({ story }),
      setStyle: (style) => set({ style }),
      setReferenceImageUrl: (url) => set({ referenceImageUrl: url }),
      setStatus: (status) => set({ status }),
      setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
      setError: (error) => set({ error }),
      reset: () => set({ story: null, ...initialTransientState }),
    }),
    {
      name: 'evan-story-studio',
      skipHydration: true,
      partialize: (state) => ({
        childName: state.childName,
        theme: state.theme,
        mode: state.mode,
        starDensity: state.starDensity,
        starDepth: state.starDepth,
        goldIntensity: state.goldIntensity,
        story: state.story,
        style: state.style,
        referenceImageUrl: state.referenceImageUrl,
      }),
    }
  )
);

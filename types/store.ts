import type {
  Story,
  StyleKey,
  ThemePreset,
  ColorMode,
  StarDensity,
  StarDepth,
} from '@/types/story';

export interface StoreState {
  // Settings (persisted)
  childName: string;
  theme: ThemePreset;
  mode: ColorMode;
  starDensity: StarDensity;
  starDepth: StarDepth;
  goldIntensity: number;

  // Story data (persisted)
  story: Story | null;
  style: StyleKey;
  referenceImageUrl: string | null;

  // Transient state (not persisted)
  status: 'idle' | 'generating' | 'error';
  currentImageIndex: number;
  error: string | null;
}

export interface StoreActions {
  setChildName: (name: string) => void;
  setTheme: (theme: ThemePreset) => void;
  setMode: (mode: ColorMode) => void;
  setStarDensity: (density: StarDensity) => void;
  setStarDepth: (depth: StarDepth) => void;
  setGoldIntensity: (intensity: number) => void;
  setStory: (story: Story | null) => void;
  setStyle: (style: StyleKey) => void;
  setReferenceImageUrl: (url: string | null) => void;
  setStatus: (status: 'idle' | 'generating' | 'error') => void;
  setCurrentImageIndex: (index: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

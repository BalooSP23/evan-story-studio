export type ThemePreset = 'mystical' | 'dreamy' | 'magical';

export type ColorMode = 'dark' | 'light';

export type StarDensity = 'sparse' | 'medium' | 'dense';

export type StarDepth = 'flat' | 'parallax';

export type StyleKey =
  | 'watercolor'
  | 'pixar'
  | 'anime'
  | 'comic'
  | 'papercut'
  | 'chalk';

export type Locale = 'fr' | 'en' | 'uk';

export interface Character {
  name: string;
  description: string;
  type: 'preset' | 'fiction' | 'custom_evan';
  referenceImageUrl: string | null;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl: string | null;
  imageFallbackGradient: string;
}

export interface Story {
  title: string;
  hero: Character;
  world: string;
  villain: string;
  style: StyleKey;
  pages: StoryPage[];
  locale: Locale;
  createdAt: string;
}

# Phase 1: Foundation & Design System - Research

**Researched:** 2026-02-19
**Domain:** Next.js scaffold, design system (theming, fonts, starry background), Zustand persistence, i18n infrastructure
**Confidence:** HIGH

## Summary

Phase 1 establishes the project scaffold, visual identity, state management, and internationalization infrastructure that all downstream phases build upon. The core technical challenges are: (1) implementing a multi-theme system with Tailwind CSS v4's CSS-first configuration using `@theme` and `data-theme` attributes, (2) handling font selection given that Fredoka does NOT support Cyrillic/Ukrainian script (critical blocker requiring a fallback strategy), (3) building a performant HTML5 Canvas starry background with configurable density and parallax, (4) setting up Zustand v5 persist middleware with the `skipHydration` pattern to avoid Next.js hydration mismatches, and (5) establishing i18n infrastructure using next-intl without routing (cookie-based locale switching, no URL prefixes).

The most important discovery during research is the **Fredoka font limitation**: Fredoka (and its predecessor Fredoka One) only supports Latin, Latin Extended, and Hebrew subsets -- no Cyrillic. Since the app requires Ukrainian language support, the heading font must either use Fredoka for Latin/Hebrew with a Cyrillic fallback, or use an alternative rounded display font that supports all three scripts. Nunito (body font) does support cyrillic and cyrillic-ext subsets.

**Primary recommendation:** Use Fredoka for headings in Latin scripts with a per-locale font swap to Comfortaa (or Rubik) for Ukrainian Cyrillic, or replace Fredoka entirely with a Cyrillic-supporting rounded font. Nunito works as-is for body text across all three languages.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Twinkling stars + occasional shooting stars for animation
- Three configurable density levels: sparse, medium, dense (selectable in settings)
- Depth mode configurable: flat star field vs layered parallax (selectable in settings)
- Sky gradient color selectable from presets in settings
- Default mood: Mystical & deep (jewel tones, muted golds, dark backgrounds)
- Multiple theme presets selectable in settings: Mystical & deep (default), Dreamy & warm, Magical & vibrant
- Each theme preset defines sky gradient, accent colors, and overall mood together
- Dark mode default, with dark/light mode toggle in settings
- Mix of ethereal and tactile: frosted glass cards + solid, glowy buttons
- Subtle sparkle particle effects on key interactions (button tap, story creation, page turn)
- Full-screen language picker on every app launch (3 large buttons: French, English, Ukrainian)
- After language selection: animated title screen with starry background
- Time-aware personalized greeting ("Good evening, Evan") using child's name from settings
- CTA button: "Begin the Adventure" (translated per language)
- Subtle gear icon in corner for parent access to settings
- Child's name configurable in settings
- 3 languages supported: French, English, Ukrainian
- Language affects EVERYTHING: UI text, settings labels, and generated story text
- Language picker shown on every app launch (full welcome screen, not stored)
- i18n infrastructure must be set up in foundation so all downstream phases build on it

### Claude's Discretion
- Gold accent intensity and placement (configurable in settings, Claude picks defaults)
- Border radius values across the app
- Page transition style (fade, slide, page-turn depending on context)
- Sparkle particle implementation details
- Typography sizing and weight hierarchy

### Deferred Ideas (OUT OF SCOPE)
- Settings page UI design and implementation -- may need its own plan or phase depending on complexity
- The generated story language (Claude prompt in French/Ukrainian) is an AI Pipeline concern (Phase 2) but the language selection infrastructure is Phase 1
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWA-03 | Animated starry night background with particle canvas | Canvas-based star field with requestAnimationFrame, configurable density (sparse/medium/dense), parallax layers, shooting stars. Performance capped at 50-100 stars for iPad. See Architecture Patterns: StarryBackground Component |
| PWA-05 | Typography uses Fredoka One for headings and Nunito for body | CRITICAL: Fredoka lacks Cyrillic subset. Strategy: use Fredoka for Latin + fallback font for Ukrainian headings. Nunito has full cyrillic/cyrillic-ext support. Both loaded via next/font/google. See Standard Stack: Fonts section |
| PWA-06 | Story, style preference, and reference photo persist in localStorage | Zustand v5 persist middleware with `skipHydration: true` pattern. Store shape designed for all downstream features. See Architecture Patterns: Zustand Store |
</phase_requirements>

## Standard Stack

### Core (Already Decided -- from PROJECT.md)

| Library | Version | Purpose | Phase 1 Usage |
|---------|---------|---------|---------------|
| Next.js | 16.1.6 | Framework | Scaffold via create-next-app, App Router, next/font |
| React | 19.x | UI | Ships with Next.js 16. React Compiler auto-memoizes |
| TypeScript | 5.x strict | Type safety | All types defined in this phase |
| Tailwind CSS | 4.x | Styling | CSS-first config via `@theme`, `@custom-variant`, dark mode |
| Zustand | 5.0.11 | State | Store with persist middleware, skipHydration |
| Motion | 12.x | Animation | Page transitions, sparkle effects (minimal in Phase 1) |

### Phase 1 Specific

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| next-intl | 4.8.x | Internationalization | Lightweight (~2KB client), native App Router + Server Component support, cookie-based locale without URL routing, actively maintained for Next.js 16 |
| clsx | 2.x | Conditional classNames | Tiny (~200B), needed for theme/mode class composition |
| tailwind-merge | 3.x | Merge Tailwind classes | Prevents class conflicts in themed components |

### Fonts

| Font | Source | Subsets | Weights | Role |
|------|--------|---------|---------|------|
| Fredoka | next/font/google | latin, latin-ext, hebrew | 300-700 (variable) | Headings (Latin/French/English) |
| Nunito | next/font/google | latin, latin-ext, cyrillic, cyrillic-ext, vietnamese | 200-1000 (variable) | Body text (all languages) |

**CRITICAL FONT ISSUE:** Fredoka does NOT support Cyrillic script. Ukrainian headings need an alternative.

**Recommended font strategy:**

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| A: Fredoka + Cyrillic fallback per locale | Keeps Fredoka for EN/FR as specified | Heading font changes for UK, slight visual inconsistency | **Recommended** -- honors requirement, graceful degradation |
| B: Replace Fredoka with Comfortaa everywhere | Single rounded font for all locales, has Cyrillic | Different aesthetic than Fredoka, less "playful/bold" | Acceptable alternative |
| C: Replace Fredoka with Rubik everywhere | Rounded corners, full Cyrillic, many weights | Less playful than Fredoka, more "modern" feel | Last resort |

**Approach A implementation:** Load Fredoka and a Cyrillic-capable fallback (Comfortaa or Rubik) via next/font/google. Apply `font-heading` class that resolves to Fredoka by default, but swap to the fallback when `lang="uk"` is set on the html element. CSS:

```css
@theme {
  --font-heading: var(--font-fredoka);
  --font-body: var(--font-nunito);
}

/* Ukrainian Cyrillic fallback for headings */
:lang(uk) {
  --font-heading: var(--font-comfortaa);
}
```

**Confidence: HIGH** for Nunito (cyrillic confirmed on Google Fonts and npm). **MEDIUM** for Fredoka limitation (confirmed via Adobe Fonts metadata and Google Fonts helper -- does not list cyrillic subset).

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | Manual i18n (JSON + React Context) | Less boilerplate but no Server Component support, no message formatting, no pluralization. next-intl is only ~2KB and handles all edge cases |
| next-intl | react-i18next + next-i18n-router | Heavier, designed for more complex routing needs. Overkill for 3 languages without URL prefixes |
| Fredoka | Comfortaa | Rounded geometric, supports Cyrillic, but less "bold/playful" than Fredoka for a children's app |
| Fredoka | Rubik | Slightly rounded, excellent Cyrillic, but less distinctively childish |
| Canvas starry bg | CSS-only animation (keyframes) | Cannot do parallax layers, configurable density, or shooting star trajectories. Canvas is necessary for the feature set |
| Canvas starry bg | WebGL / Three.js | Overkill for 2D star particles. Adds massive bundle size. Canvas2D is sufficient |

### Installation

```bash
# Create project (if not already scaffolded)
npx create-next-app@latest evan-story-studio --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"

# Phase 1 dependencies
npm install zustand motion next-intl clsx tailwind-merge

# Phase 1 dev dependencies (none beyond what create-next-app provides)
```

**Note:** `next/font/google` is built-in (no install needed). Tailwind CSS v4 is included by create-next-app.

## Architecture Patterns

### Recommended Project Structure (Phase 1)

```
app/
  layout.tsx              # Root layout: fonts, NextIntlClientProvider, html lang attr
  page.tsx                # Landing page: language picker -> title screen -> CTA
  globals.css             # Tailwind v4 config: @theme, @custom-variant, theme presets
components/
  StarryBackground.tsx    # Canvas-based animated star field (client component)
  LanguagePicker.tsx      # Full-screen 3-language selector (client component)
  TitleScreen.tsx         # Animated greeting + CTA (client component)
  SparkleEffect.tsx       # Reusable sparkle particle burst (client component)
lib/
  store.ts                # Zustand store with persist middleware
  themes.ts               # Theme preset definitions (colors, gradients)
  i18n/
    request.ts            # next-intl request config (reads locale from cookie)
types/
  story.ts                # Story, Page, Character, Style, Theme types
  store.ts                # Store state/actions types
messages/
  en.json                 # English translations
  fr.json                 # French translations
  uk.json                 # Ukrainian translations
i18n/
  request.ts              # next-intl getRequestConfig
```

### Pattern 1: Multi-Theme System with Tailwind CSS v4

**What:** Define three theme presets (Mystical, Dreamy, Magical) as CSS custom property overrides activated by `data-theme` attributes on the html element, combined with a dark/light mode toggle via a separate `data-mode` attribute.

**When:** Always active. Theme determines sky gradient, accent colors, card backgrounds, and glow effects.

**Implementation:**

```css
/* globals.css */
@import "tailwindcss";

/* Dark mode via data attribute (not media query, since user toggles it) */
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));

/* Theme defaults (Mystical & deep) */
@theme {
  --color-bg-primary: oklch(0.13 0.03 270);     /* deep navy */
  --color-bg-secondary: oklch(0.18 0.04 270);   /* slightly lighter */
  --color-accent-gold: oklch(0.82 0.15 85);     /* warm gold */
  --color-accent-purple: oklch(0.68 0.15 290);  /* soft purple */
  --color-text-primary: oklch(0.95 0.01 270);   /* near-white */
  --color-text-secondary: oklch(0.75 0.03 270); /* muted */
  --color-card-bg: oklch(0.2 0.03 270 / 0.6);   /* frosted glass base */
  --color-glow: oklch(0.82 0.15 85 / 0.3);      /* gold glow */
  --color-sky-top: oklch(0.1 0.04 270);
  --color-sky-bottom: oklch(0.2 0.05 280);

  --font-heading: var(--font-fredoka);
  --font-body: var(--font-nunito);

  --radius-card: 1rem;
  --radius-button: 0.75rem;
}

/* Theme preset overrides */
@layer base {
  [data-theme="mystical"] {
    --color-bg-primary: oklch(0.13 0.03 270);
    --color-accent-gold: oklch(0.82 0.15 85);
    --color-accent-purple: oklch(0.68 0.15 290);
    --color-sky-top: oklch(0.1 0.04 270);
    --color-sky-bottom: oklch(0.2 0.05 280);
  }

  [data-theme="dreamy"] {
    --color-bg-primary: oklch(0.15 0.02 30);
    --color-accent-gold: oklch(0.85 0.12 60);
    --color-accent-purple: oklch(0.72 0.1 320);
    --color-sky-top: oklch(0.12 0.03 250);
    --color-sky-bottom: oklch(0.25 0.04 300);
  }

  [data-theme="magical"] {
    --color-bg-primary: oklch(0.12 0.05 300);
    --color-accent-gold: oklch(0.88 0.18 90);
    --color-accent-purple: oklch(0.6 0.2 280);
    --color-sky-top: oklch(0.08 0.06 280);
    --color-sky-bottom: oklch(0.22 0.07 300);
  }

  /* Light mode overrides */
  [data-mode="light"] {
    --color-bg-primary: oklch(0.95 0.01 270);
    --color-text-primary: oklch(0.15 0.03 270);
    --color-text-secondary: oklch(0.4 0.03 270);
    --color-card-bg: oklch(1 0 0 / 0.7);
  }
}
```

**Confidence: HIGH** -- Tailwind CSS v4 `@theme` + `@custom-variant` + `data-*` attribute pattern is well-documented in official Tailwind docs and community tutorials.

### Pattern 2: i18n with next-intl (No Routing)

**What:** Use next-intl in "without i18n routing" mode. No locale URL prefixes (`/en/`, `/fr/`). Locale is passed from the language picker to the app via a cookie, and `router.refresh()` re-renders with the new locale. The language picker displays on every app launch as a full-screen overlay.

**When:** On every page load. The language picker is the first screen, always.

**Implementation:**

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const store = await cookies();
  // Default to 'fr' (French) since the primary user is Evan in France
  const locale = store.get('locale')?.value || 'fr';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl({
  // other Next.js config
});
```

```typescript
// components/LanguagePicker.tsx -- client component
'use client';
import { useRouter } from 'next/navigation';

function LanguagePicker({ onSelect }: { onSelect: () => void }) {
  const router = useRouter();

  const selectLanguage = (locale: 'fr' | 'en' | 'uk') => {
    // Set cookie (no expiry -- session only, re-picked each launch)
    document.cookie = `locale=${locale};path=/;SameSite=Lax`;
    router.refresh(); // Re-renders server components with new locale
    onSelect();       // Transition to title screen
  };

  return (
    <div className="flex gap-8">
      <button onClick={() => selectLanguage('fr')}>Francais</button>
      <button onClick={() => selectLanguage('en')}>English</button>
      <button onClick={() => selectLanguage('uk')}>Ukrainska</button>
    </div>
  );
}
```

**Key design decision:** The language picker uses session cookies (no expiry). Because the user decision says "Language picker shown on every app launch," the cookie ensures the rest of the session uses the selected locale, but it expires when the browser closes. On next launch, the picker appears again.

**Confidence: HIGH** -- next-intl 4.8.x is confirmed compatible with Next.js 16. The "without i18n routing" pattern is officially documented and uses cookies + router.refresh().

### Pattern 3: Zustand Store with skipHydration

**What:** Zustand v5 store with `persist` middleware targeting `localStorage`. Use `skipHydration: true` to prevent server/client mismatch. Manually rehydrate in a client-side `useEffect`.

**When:** All client-side state access. The store is the single source of truth for theme, density, child name, and story data.

**Implementation:**

```typescript
// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, StoreActions } from '@/types/store';

type StoryStudioStore = StoreState & StoreActions;

export const useStoryStore = create<StoryStudioStore>()(
  persist(
    (set, get) => ({
      // Settings (persisted)
      childName: 'Evan',
      theme: 'mystical' as const,
      mode: 'dark' as const,
      starDensity: 'medium' as const,
      starDepth: 'flat' as const,
      goldIntensity: 0.5,

      // Story data (persisted)
      story: null,
      style: 'watercolor' as const,
      referenceImageUrl: null,

      // Transient state (not persisted -- excluded via partialize)
      status: 'idle' as const,
      currentImageIndex: 0,
      error: null,

      // Actions
      setChildName: (name) => set({ childName: name }),
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
      setStarDensity: (density) => set({ starDensity: density }),
      setStarDepth: (depth) => set({ starDepth: depth }),
      setGoldIntensity: (intensity) => set({ goldIntensity: intensity }),
      setStory: (story) => set({ story }),
      setStyle: (style) => set({ style }),
      setStatus: (status) => set({ status }),
      reset: () => set({
        story: null,
        status: 'idle',
        currentImageIndex: 0,
        error: null,
      }),
    }),
    {
      name: 'evan-story-studio',
      skipHydration: true,
      partialize: (state) => ({
        // Only persist these fields
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
```

```typescript
// components/StoreHydration.tsx
'use client';
import { useEffect } from 'react';
import { useStoryStore } from '@/lib/store';

export function StoreHydration() {
  useEffect(() => {
    useStoryStore.persist.rehydrate();
  }, []);
  return null;
}

// Place <StoreHydration /> in app/layout.tsx inside the <body>
```

**Confidence: HIGH** -- `skipHydration` + manual `rehydrate()` in `useEffect` is the officially recommended pattern from Zustand docs for Next.js.

### Pattern 4: StarryBackground Canvas Component

**What:** A full-screen `<canvas>` element behind all content, rendering twinkling stars, occasional shooting stars, and optional parallax depth layers. Configurable via store settings (density, depth mode).

**When:** Always visible as the app background.

**Architecture:**

```typescript
// components/StarryBackground.tsx
'use client';
import { useRef, useEffect, useCallback } from 'react';
import { useStoryStore } from '@/lib/store';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0=back, 1=mid, 2=front (for parallax)
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
}

const DENSITY_MAP = { sparse: 30, medium: 60, dense: 100 };

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const density = useStoryStore((s) => s.starDensity);
  const depth = useStoryStore((s) => s.starDepth);
  // theme colors for sky gradient read from CSS custom properties
  // ...

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars based on density
    const starCount = DENSITY_MAP[density];
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      layer: Math.floor(Math.random() * 3),
    }));

    // Animation loop with delta time
    let lastTime = 0;
    let animationId: number;

    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      // Clear and draw sky gradient (read from CSS vars)
      // Draw stars with twinkling
      // Draw shooting stars occasionally
      // Apply parallax offset if depth === 'parallax'

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [density, depth]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
```

**Performance considerations:**
- Cap maximum stars at 100 (dense mode) for iPad performance
- Use `requestAnimationFrame` with delta-time calculation for consistent speed
- Stars are simple arc draws (no images or complex paths)
- Shooting stars spawn randomly (1 every 3-8 seconds) and despawn after ~1 second
- For parallax mode: 3 layers with different movement speeds on slight mouse/gyroscope input
- Use `will-change: transform` on canvas or let the browser composite it naturally
- iPad Safari throttles rAF in low-power mode -- animation gracefully degrades (slower but doesn't break)

**Confidence: HIGH** -- Canvas star field is a well-established pattern with many working examples. Performance considerations are documented for iPad Safari.

### Pattern 5: Font Loading with next/font/google

**What:** Load fonts at build time via `next/font/google`, export as CSS variables, wire into Tailwind v4 `@theme`.

**Implementation:**

```typescript
// app/layout.tsx
import { Fredoka, Nunito, Comfortaa } from 'next/font/google';

const fredoka = Fredoka({
  subsets: ['latin', 'latin-ext', 'hebrew'],
  variable: '--font-fredoka',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-nunito',
  display: 'swap',
});

// Cyrillic fallback for headings in Ukrainian
const comfortaa = Comfortaa({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-comfortaa',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default async function RootLayout({ children }) {
  const locale = /* from next-intl */;
  return (
    <html
      lang={locale}
      data-theme="mystical"
      data-mode="dark"
      className={`${fredoka.variable} ${nunito.variable} ${comfortaa.variable}`}
    >
      <body className="font-body bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
```

```css
/* globals.css */
@theme {
  --font-heading: var(--font-fredoka);
  --font-body: var(--font-nunito);
}

/* Swap heading font for Ukrainian locale */
:lang(uk) {
  --font-heading: var(--font-comfortaa);
}
```

**Confidence: HIGH** for the pattern. **MEDIUM** for Comfortaa as the specific Cyrillic fallback (it has known issues with some Cyrillic characters -- needs visual testing with Ukrainian text).

### Anti-Patterns to Avoid

- **Reading Zustand persist state during SSR:** Always use `skipHydration: true`. Components that read persisted state must be client components with useEffect-guarded rendering.
- **Using `tailwind.config.js` with Tailwind v4:** Tailwind v4 is CSS-first. All configuration goes in `globals.css` via `@theme`, `@custom-variant`, and `@layer base`.
- **Storing theme/mode in URL or cookie for SSR:** Theme and mode are purely client-side visual preferences. Store in Zustand (persisted to localStorage). Apply via `data-theme`/`data-mode` attributes on `<html>` in a client-side effect.
- **Importing from `framer-motion`:** The package was rebranded to `motion`. Import from `motion/react`.
- **Using `requestAnimationFrame` without delta-time:** iPad Safari can throttle rAF to 30fps or lower in low-power mode. Always calculate animation based on elapsed time, not frame count.
- **Large inline style objects for theme colors:** Define all colors as CSS custom properties in `@theme`/`@layer base`. Reference via Tailwind utility classes (`bg-bg-primary`, `text-accent-gold`). Only use inline styles for truly dynamic values (e.g., canvas drawing).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Internationalization | Custom JSON loader + React Context i18n system | next-intl 4.8.x | Handles Server Components, message formatting, pluralization, ICU syntax, cookie-based locale, ~2KB client bundle |
| Theme persistence + SSR guard | Manual localStorage + useEffect theme application | Zustand persist with skipHydration | Built-in serialization, partialize (exclude transient state), rehydration callback |
| Dark mode toggle | Manual CSS class toggling with localStorage | Tailwind v4 `@custom-variant dark` + `data-mode` attribute | Integrates with all Tailwind utilities (`dark:bg-*`, etc.), single source of truth |
| Font loading | `<link>` tags to Google Fonts CDN | next/font/google | Zero network requests to Google, self-hosted at build time, automatic CSS variable export |
| CSS class merging | String concatenation | clsx + tailwind-merge | Handles conditional classes and Tailwind specificity conflicts correctly |

**Key insight:** Phase 1 is all infrastructure. Every system built here (theming, i18n, state, canvas background) will be used by every downstream phase. Getting the foundation APIs right is more important than visual polish.

## Common Pitfalls

### Pitfall 1: Zustand Persist Hydration Mismatch
**What goes wrong:** Server renders with default state, client hydrates with localStorage state. React throws hydration error.
**Why it happens:** `localStorage` is browser-only. Zustand persist reads it synchronously on store creation.
**How to avoid:** Use `skipHydration: true` in persist config. Call `useStoryStore.persist.rehydrate()` in a `useEffect`. Render skeleton/loading state until hydrated.
**Warning signs:** "Text content does not match server-rendered HTML" in console. Flash of default values before persisted values appear.

### Pitfall 2: Tailwind v4 Theme Variables Not Generating Utilities
**What goes wrong:** You define CSS custom properties in `:root` but Tailwind doesn't generate utility classes for them.
**Why it happens:** Only variables defined inside `@theme { }` generate Tailwind utilities. Regular `:root` variables are just CSS -- Tailwind ignores them.
**How to avoid:** Always define design tokens in `@theme { }`. Use `:root` or `@layer base` only for overriding values of variables already declared in `@theme`.
**Warning signs:** Classes like `bg-bg-primary` don't work. Tailwind warns about unknown utility.

### Pitfall 3: next-intl Plugin Conflict with Turbopack
**What goes wrong:** `createNextIntlPlugin()` wraps `next.config.ts`. If it modifies webpack config internally, it may conflict with Turbopack in dev mode.
**Why it happens:** next-intl v4.8 had initial issues with Next.js 16 (issue #2064). These have been resolved but may resurface with specific config combinations.
**How to avoid:** Install latest next-intl (4.8.3+). Test `npm run dev` (Turbopack) and `npm run build` immediately after adding the plugin. If dev fails, check next-intl GitHub issues.
**Warning signs:** Dev server crashes on startup with "headers" or "dynamic" errors.

### Pitfall 4: Canvas Starry Background Performance on iPad
**What goes wrong:** Too many stars or complex drawing operations cause janky scrolling and high CPU usage on iPad.
**Why it happens:** iPad Safari runs canvas on the CPU (not GPU-accelerated for 2D context). Each `arc()` + `fill()` call has a cost. 200+ particles at 60fps can exceed iPad's budget.
**How to avoid:** Cap stars at 100 maximum (dense mode). Use simple circle fills, no shadows or gradients per star. Batch draw calls by layer. Consider reducing to 30fps target if performance is still an issue. Disable shooting stars in low-power mode.
**Warning signs:** Safari Energy Impact showing high CPU. Fan noise on iPad Pro. Stuttering when scrolling overlay content.

### Pitfall 5: Cookie-Based Locale Not Updating Server Components
**What goes wrong:** User selects a language, cookie is set, but server components still render in the old language.
**Why it happens:** Setting `document.cookie` doesn't trigger a re-render. You must call `router.refresh()` to tell Next.js to re-fetch server components with the new cookie.
**How to avoid:** Always call `router.refresh()` after setting the locale cookie. The `router.refresh()` call re-runs the server component tree with the updated cookies.
**Warning signs:** Client components update language but server components stay stale.

### Pitfall 6: Fredoka Rendering Empty Boxes for Ukrainian Text
**What goes wrong:** Ukrainian (Cyrillic) characters render as empty boxes or fallback to system font because Fredoka doesn't have Cyrillic glyphs.
**Why it happens:** Fredoka only includes Latin, Latin-ext, and Hebrew subsets. No Cyrillic.
**How to avoid:** Implement the dual-font strategy: Fredoka for Latin, Comfortaa (or another Cyrillic-supporting rounded font) for Ukrainian. Use CSS `:lang(uk)` selector to swap the heading font variable.
**Warning signs:** Ukrainian headings look different from English/French, or show missing glyph boxes. Test with Ukrainian text early.

## Code Examples

### Time-Aware Greeting

```typescript
// lib/greeting.ts
export function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'greeting.morning';
  if (hour >= 12 && hour < 17) return 'greeting.afternoon';
  if (hour >= 17 && hour < 21) return 'greeting.evening';
  return 'greeting.night';
}
```

```json
// messages/en.json
{
  "landing": {
    "greeting": {
      "morning": "Good morning, {name}",
      "afternoon": "Good afternoon, {name}",
      "evening": "Good evening, {name}",
      "night": "Sweet dreams, {name}"
    },
    "cta": "Begin the Adventure"
  }
}
```

```json
// messages/fr.json
{
  "landing": {
    "greeting": {
      "morning": "Bonjour, {name}",
      "afternoon": "Bon apres-midi, {name}",
      "evening": "Bonsoir, {name}",
      "night": "Fais de beaux reves, {name}"
    },
    "cta": "Commencer l'Aventure"
  }
}
```

```json
// messages/uk.json
{
  "landing": {
    "greeting": {
      "morning": "Dobroho ranku, {name}",
      "afternoon": "Dobroho dnia, {name}",
      "evening": "Dobroho vechora, {name}",
      "night": "Solodkykh sniv, {name}"
    },
    "cta": "Pochaty Pryhodu"
  }
}
```

### Theme Application from Store

```typescript
// components/ThemeApplicator.tsx
'use client';
import { useEffect } from 'react';
import { useStoryStore } from '@/lib/store';

export function ThemeApplicator() {
  const theme = useStoryStore((s) => s.theme);
  const mode = useStoryStore((s) => s.mode);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
  }, [theme, mode]);

  return null;
}
```

### Type Definitions

```typescript
// types/story.ts
export type ThemePreset = 'mystical' | 'dreamy' | 'magical';
export type ColorMode = 'dark' | 'light';
export type StarDensity = 'sparse' | 'medium' | 'dense';
export type StarDepth = 'flat' | 'parallax';
export type StyleKey = 'watercolor' | 'pixar' | 'anime' | 'comic' | 'papercut' | 'chalk';
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
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS config) | `@theme` directive in CSS (CSS-first) | Tailwind v4 (Jan 2025) | No JS config file. All design tokens in globals.css |
| `framer-motion` package | `motion` package, import from `motion/react` | Motion v11+ (2024) | Same API, new package name. Old import works via shim but is deprecated |
| `next-pwa` | `@serwist/turbopack` | 2024 | next-pwa is abandoned. Serwist is the active successor |
| next-intl with middleware routing | next-intl without i18n routing (cookie-based) | Always available | For apps that don't need locale in URL |
| Manual `useMemo`/`useCallback` | React Compiler auto-memoization | React 19 + Next.js 16 | Less boilerplate. Don't add manual memoization unless profiling shows need |
| Zustand `create()` with `devtools` | Same, but v5 uses native `useSyncExternalStore` | Zustand v5 (2024) | Better React 19 integration, no external dependency for store subscription |

**Deprecated/outdated:**
- `Fredoka One` (single weight): Replaced by `Fredoka` (variable font, 300-700 weights). Google Fonts still lists both but Fredoka is the modern variable version
- `tailwind.config.js`: Not needed in Tailwind v4. Some older tutorials still reference it

## Open Questions

1. **Comfortaa Cyrillic quality for Ukrainian**
   - What we know: Comfortaa supports cyrillic/cyrillic-ext subsets. Some issues have been reported with specific Cyrillic characters (GitHub issue #4218).
   - What's unclear: Whether the Ukrainian-specific characters (e.g., the letter "i" with diacritic, "yi") render correctly in the current version.
   - Recommendation: Load Comfortaa and visually test with Ukrainian heading text during implementation. If quality is poor, try Rubik (which has excellent Cyrillic support and slightly rounded corners). The `:lang(uk)` CSS approach allows easy font swapping.

2. **next-intl + Next.js 16.1.6 stability**
   - What we know: next-intl 4.8.3 is current, v4.8 resolved initial Next.js 16.0 issues (#2064). The library is actively maintained.
   - What's unclear: Whether the cookie-based "without routing" mode has edge cases with Next.js 16.1's specific Turbopack version.
   - Recommendation: Install and test immediately during scaffolding. Have a manual fallback ready (React Context + JSON imports) if the plugin causes issues.

3. **Exact oklch values for theme presets**
   - What we know: The user wants Mystical (jewel tones, muted golds, dark), Dreamy (warm), and Magical (vibrant).
   - What's unclear: Precise color values for each preset.
   - Recommendation: This falls under Claude's discretion. Start with the oklch values in the code example above, iterate visually. oklch is recommended over hsl for perceptual uniformity.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- @theme directive, CSS-first config
- [Tailwind CSS v4 Custom Styles](https://tailwindcss.com/docs/adding-custom-styles) -- @custom-variant, @layer directives
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) -- data attribute dark mode
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google usage
- [Zustand Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) -- persist middleware, skipHydration
- [next-intl App Router Without Routing](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing) -- cookie-based locale, no URL prefix

### Secondary (MEDIUM confidence)
- [Simon Swiss: Tailwind v4 Multi-Theme Strategy](https://simonswiss.com/posts/tailwind-v4-multi-theme) -- data-theme attribute pattern
- [Tailwind CSS Discussion #15600](https://github.com/tailwindlabs/tailwindcss/discussions/15600) -- CSS variables for multiple themes
- [next-intl GitHub Issue #2064](https://github.com/amannn/next-intl/issues/2064) -- Next.js 16 compatibility
- [Zustand Discussion #1382](https://github.com/pmndrs/zustand/discussions/1382) -- localStorage persist hydration errors
- [Fredoka on Adobe Fonts](https://fonts.adobe.com/fonts/fredoka-variable) -- Confirmed: Latin + Hebrew only, no Cyrillic
- [Nunito on Google Fonts](https://fonts.google.com/specimen/Nunito) -- Confirmed: cyrillic, cyrillic-ext subsets available
- [Comfortaa on Google Fonts](https://fonts.google.com/specimen/Comfortaa?subset=cyrillic) -- Cyrillic subset available
- [Google Design: Cyrillic Expansion](https://design.google/library/scripting-cyrillic) -- Comfortaa Cyrillic expansion confirmed
- [Comfortaa Cyrillic Issues #4218](https://github.com/google/fonts/issues/4218) -- Known Cyrillic character issues

### Tertiary (LOW confidence)
- [Motion.dev: Browser rAF Throttling](https://motion.dev/blog/when-browsers-throttle-requestanimationframe) -- iOS low-power mode throttles rAF (needs iPad testing to confirm current behavior)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified, compatibility confirmed
- Architecture (theming): HIGH -- Tailwind v4 multi-theme is well-documented
- Architecture (i18n): HIGH -- next-intl without routing is an official pattern
- Architecture (canvas stars): HIGH -- Well-established canvas particle techniques
- Architecture (fonts): MEDIUM -- Fredoka Cyrillic limitation is confirmed, but the fallback strategy (Comfortaa) needs visual testing
- Pitfalls: HIGH -- All pitfalls verified via official docs or GitHub issues

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days -- stable technologies, no fast-moving concerns)

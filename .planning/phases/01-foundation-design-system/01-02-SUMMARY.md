---
phase: 01-foundation-design-system
plan: 02
subsystem: ui
tags: [zustand, canvas, animation, localStorage, framer-motion, i18n, landing-page]

# Dependency graph
requires:
  - phase: 01-foundation-design-system
    plan: 01
    provides: "Tailwind v4 theme system, TypeScript types, i18n infrastructure, font system"
provides:
  - "Zustand store with localStorage persistence via persist middleware and skipHydration"
  - "Canvas-based animated starry night background with twinkling stars and shooting stars"
  - "Full-screen language picker with 3 languages (fr/en/uk) and framer-motion animations"
  - "Animated title screen with time-aware greeting and translated CTA"
  - "StoreHydration client component for SSR-safe rehydration"
  - "ThemeApplicator client component for data-theme/data-mode attribute management"
  - "Landing page state machine: language-picker -> title-screen"
affects: [02-ai-pipeline, 03-character-picker, 04-story-reader, 05-personalization, 06-video-pwa]

# Tech tracking
tech-stack:
  added: []
  patterns: [zustand-persist-skipHydration, canvas-animation-loop, delta-time-animation, cookie-locale-session, framer-motion-stagger]

key-files:
  created:
    - lib/store.ts
    - components/StoreHydration.tsx
    - components/ThemeApplicator.tsx
    - components/StarryBackground.tsx
    - components/LanguagePicker.tsx
    - components/TitleScreen.tsx
  modified:
    - app/layout.tsx
    - app/page.tsx

key-decisions:
  - "Zustand persist with skipHydration to avoid SSR hydration mismatch"
  - "Canvas-based starry background (no DOM elements or CSS animations for star rendering)"
  - "Delta-time animation loop for consistent speed across variable frame rates (iPad Safari 30fps)"
  - "Session cookie for locale (no expiry) so language picker shows on every app launch"
  - "Parallax implemented as continuous horizontal drift (no mouse/gyro input for v1)"

patterns-established:
  - "Zustand store pattern: persist middleware with skipHydration + StoreHydration client component"
  - "Theme application pattern: ThemeApplicator reads store and sets data-* attributes on html element"
  - "Canvas animation pattern: requestAnimationFrame with delta-time, cleanup on unmount"
  - "Landing page pattern: useState state machine for screen transitions"
  - "Cookie locale pattern: document.cookie + router.refresh() for server component re-render"

requirements-completed: [PWA-03, PWA-06]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 1 Plan 02: Store, Starry Background & Landing Page Summary

**Zustand store with localStorage persistence, canvas-based animated starry night with twinkling/shooting stars, and landing experience (language picker into animated title screen with time-aware greeting and CTA)**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-19T10:51:41Z
- **Completed:** 2026-02-19T10:54:58Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created Zustand store with persist middleware, skipHydration, and partialize for selective localStorage persistence
- Built full canvas-based StarryBackground with twinkling stars (configurable density), gold-tinted stars, shooting star trails, and optional parallax layers
- Implemented child-friendly LanguagePicker with 3 large frosted-glass buttons (fr/en/uk) and staggered framer-motion entrance animation
- Built TitleScreen with time-aware greeting, gold-accented title, animated CTA, and placeholder settings gear icon
- Wired StoreHydration and ThemeApplicator into root layout for SSR-safe state management
- Both `npm run dev` and `npm run build` complete successfully with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand store with localStorage persistence and theme/hydration components** - `ca6f367` (feat)
2. **Task 2: Build StarryBackground canvas and landing page with language picker and title screen** - `27b0f1d` (feat)

## Files Created/Modified
- `lib/store.ts` - Zustand store with persist middleware, skipHydration, partialize for selective persistence
- `components/StoreHydration.tsx` - Client component that calls persist.rehydrate() on mount
- `components/ThemeApplicator.tsx` - Client component that syncs store theme/mode to html data attributes
- `components/StarryBackground.tsx` - Full-screen canvas with twinkling stars, shooting stars, parallax, delta-time animation
- `components/LanguagePicker.tsx` - Full-screen overlay with 3 large language buttons and framer-motion animations
- `components/TitleScreen.tsx` - Animated title, time-aware greeting, CTA button, settings gear placeholder
- `app/layout.tsx` - Added StoreHydration, ThemeApplicator, StarryBackground to body
- `app/page.tsx` - Rewritten as state machine: language-picker -> title-screen

## Decisions Made
- Used Zustand persist with skipHydration to prevent SSR hydration mismatch -- StoreHydration component rehydrates client-side on mount
- Built starry background as canvas animation rather than CSS/DOM elements for performance (up to 100 stars + shooting stars)
- Used delta-time animation loop to ensure consistent animation speed across variable frame rates (important for iPad Safari which may throttle to 30fps)
- Set locale via session cookie (no expiry) so language picker shows on every app launch per user decision
- Used RGBA fallback colors for canvas sky gradient since canvas context doesn't support oklch color values natively

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 is fully complete: visual identity, state management, i18n, landing experience all established
- Store is ready for Phase 2 (AI Pipeline) to use for story/status management
- Landing page CTA is wired with onBegin callback ready for Phase 3 (Character Picker) navigation
- Theme system and starry background are persistent across all future pages

## Self-Check: PASSED

All 8 claimed files verified as existing. Both task commits (ca6f367, 27b0f1d) verified in git log. npm run build exits 0. npx tsc --noEmit exits 0.

---
*Phase: 01-foundation-design-system*
*Completed: 2026-02-19*

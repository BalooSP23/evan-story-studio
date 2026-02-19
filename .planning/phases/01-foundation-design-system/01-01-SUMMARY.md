---
phase: 01-foundation-design-system
plan: 01
subsystem: ui
tags: [next.js, tailwind-v4, typescript, next-intl, i18n, fonts, theming, oklch]

# Dependency graph
requires: []
provides:
  - "Next.js 16.1.6 scaffold with Turbopack, React 19, TypeScript strict"
  - "Tailwind v4 CSS-first theme system with 3 presets (mystical, dreamy, magical) and dark/light mode"
  - "All domain types: Story, StoryPage, Character, StyleKey, ThemePreset, ColorMode, StarDensity, StarDepth, Locale"
  - "Store types: StoreState, StoreActions"
  - "Font system: Fredoka (headings), Nunito (body), Comfortaa (Ukrainian Cyrillic fallback)"
  - "i18n infrastructure via next-intl with cookie-based locale for fr, en, uk"
  - "Translation files with greeting, cta, subtitle, language, and settings keys"
  - "Time-aware greeting key function (lib/greeting.ts)"
affects: [01-02, 02-ai-pipeline, 03-character-picker, 04-story-reader, 05-personalization, 06-video-pwa]

# Tech tracking
tech-stack:
  added: [next.js@16.1.6, react@19.2.3, zustand@5.0.11, motion@12.34.2, next-intl@4.8.3, clsx@2.1.1, tailwind-merge@3.5.0, tailwindcss@4, typescript@5]
  patterns: [tailwind-v4-css-first-config, data-theme-attribute-theming, data-mode-dark-light, oklch-color-space, next-font-google-css-variables, next-intl-without-routing, cookie-based-locale]

key-files:
  created:
    - types/story.ts
    - types/store.ts
    - i18n/request.ts
    - messages/en.json
    - messages/fr.json
    - messages/uk.json
    - lib/greeting.ts
  modified:
    - next.config.ts
    - app/globals.css
    - app/layout.tsx
    - app/page.tsx

key-decisions:
  - "Tailwind v4 CSS-first with @theme and @custom-variant dark (no tailwind.config.js)"
  - "oklch color space for perceptually uniform theme presets"
  - "Fredoka for Latin headings with Comfortaa fallback via :lang(uk) for Ukrainian Cyrillic"
  - "next-intl without i18n routing -- cookie-based locale, no URL prefixes"
  - "Default locale is fr (French) since primary user is Evan in France"
  - "Proper French diacritics and actual Ukrainian Cyrillic characters in translation files"

patterns-established:
  - "Theme presets via data-theme attribute with CSS custom property overrides in @layer base"
  - "Dark/light mode via data-mode attribute with @custom-variant dark selector"
  - "Font loading via next/font/google with CSS variable export to @theme"
  - "Ukrainian heading font swap via :lang(uk) CSS rule"
  - "next-intl cookie-based locale with getRequestConfig in i18n/request.ts"

requirements-completed: [PWA-05]

# Metrics
duration: 12min
completed: 2026-02-19
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16.1.6 scaffold with Tailwind v4 multi-theme system (3 oklch presets), tri-lingual font stack (Fredoka/Nunito/Comfortaa), all domain TypeScript types, and next-intl i18n infrastructure for fr/en/uk**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-02-19T07:35:00Z
- **Completed:** 2026-02-19T07:47:31Z
- **Tasks:** 2
- **Files modified:** 24

## Accomplishments
- Scaffolded Next.js 16.1.6 project with Tailwind v4, TypeScript strict, ESLint, Turbopack
- Defined all domain types (Story, StoryPage, Character, StyleKey, ThemePreset, ColorMode, StarDensity, StarDepth, Locale) and store types (StoreState, StoreActions)
- Configured complete Tailwind v4 CSS-first theme system with 3 presets (mystical/dreamy/magical) using oklch color space
- Set up font system: Fredoka (headings), Nunito (body), Comfortaa (Ukrainian Cyrillic fallback via :lang(uk))
- Established i18n infrastructure with next-intl for 3 languages (fr, en, uk) using cookie-based locale
- Created translation files with time-aware greetings, CTA, subtitle, language names, and settings labels
- Both `npm run dev` and `npm run build` complete successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project, install dependencies, and define TypeScript types** - `15989f0` (feat)
2. **Task 2: Configure Tailwind v4 theme system, fonts, i18n infrastructure, and root layout** - `f25c73e` (feat)

## Files Created/Modified
- `package.json` - Project with all Phase 1 dependencies
- `next.config.ts` - next-intl plugin configuration
- `tsconfig.json` - TypeScript strict with @/* path alias
- `app/globals.css` - Tailwind v4 @theme with oklch design tokens, 3 theme presets, dark/light mode, font system
- `app/layout.tsx` - Root layout with Fredoka/Nunito/Comfortaa fonts, NextIntlClientProvider, html lang attribute
- `app/page.tsx` - Minimal page verifying fonts and i18n integration
- `types/story.ts` - All domain types (Story, StoryPage, Character, StyleKey, ThemePreset, ColorMode, StarDensity, StarDepth, Locale)
- `types/store.ts` - Store state and action type definitions (StoreState, StoreActions)
- `i18n/request.ts` - next-intl request config reading locale from cookie
- `messages/en.json` - English UI translations
- `messages/fr.json` - French UI translations with proper diacritics
- `messages/uk.json` - Ukrainian UI translations in actual Cyrillic script
- `lib/greeting.ts` - Time-aware greeting key function (morning/afternoon/evening/night)

## Decisions Made
- Used Tailwind v4 CSS-first configuration exclusively (no tailwind.config.js) with @theme directive for design tokens
- Chose oklch color space for all theme colors for perceptual uniformity across presets
- Implemented Fredoka for Latin headings with Comfortaa fallback via :lang(uk) for Ukrainian (Fredoka lacks Cyrillic glyphs)
- Configured next-intl without i18n routing (cookie-based locale, no URL prefixes) since language picker is shown on every launch
- Set default locale to 'fr' (French) since primary user Evan is in France
- Used proper French diacritics and actual Ukrainian Cyrillic characters in all translation files

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- create-next-app refused to scaffold into directory containing existing files (.planning/, INSTRUCTION.md, nul) -- temporarily moved files, scaffolded, then restored
- Windows created a stray `nul` file (Windows NUL device name artifact) which was removed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All TypeScript types are defined and importable for Plan 02 (Zustand store, starry background, landing page)
- Theme CSS system is ready for Plan 02 components to apply via data-theme/data-mode attributes
- i18n infrastructure is wired and ready for Plan 02's language picker component
- Font system is loaded and ready for Plan 02's UI components

## Self-Check: PASSED

All 13 claimed files verified as existing. Both task commits (15989f0, f25c73e) verified in git log. npm run build exits 0. npx tsc --noEmit exits 0.

---
*Phase: 01-foundation-design-system*
*Completed: 2026-02-19*

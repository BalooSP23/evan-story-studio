# Roadmap: Evan's Story Studio

## Overview

This roadmap delivers a magical bedtime story generator PWA in 6 phases following the critical dependency path: foundation first, then the AI pipeline that powers everything, then the UI that consumes it (picker, reader), then personalization features that differentiate the product, and finally video preview with PWA installability. Each phase delivers a complete, verifiable capability. The entire flow -- from tapping character cards to reading a personalized illustrated story -- is functional after Phase 4. Phases 5 and 6 add the highest-value differentiators (Evan's face in illustrations, video keepsake, iPad home screen install).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Design System** - Project scaffold, types, Zustand store, starry night aesthetic, and font system
- [ ] **Phase 2: AI Pipeline** - Story generation via Claude and image generation via fal.ai with style-prefixed prompts
- [ ] **Phase 3: Character Picker** - Hero/world/villain selection cards with art style picker and tactile interactions
- [ ] **Phase 4: Story Reader** - Swipeable full-bleed illustrated story pages with progressive image loading
- [ ] **Phase 5: Personalization** - Evan's photo upload for face-consistent heroes and fiction character selection
- [ ] **Phase 6: Video & PWA** - Remotion video preview with Ken Burns scenes and PWA installability on iPad

## Phase Details

### Phase 1: Foundation & Design System
**Goal**: The project compiles, the visual identity is established, and state infrastructure is ready for all downstream features
**Depends on**: Nothing (first phase)
**Requirements**: PWA-03, PWA-05, PWA-06
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` opens a page with an animated starry night background and gold/purple accent palette
  2. Headings render in Fredoka One and body text renders in Nunito
  3. A Zustand store persists data to localStorage and survives page reload without hydration errors
  4. TypeScript types for Story, Page, Character, and Style are defined and importable
  5. `npm run build` completes without errors
**Plans**: TBD

Plans:
- [ ] 01-01: Next.js scaffold with Tailwind v4, fonts, and type system
- [ ] 01-02: Zustand store with localStorage persistence and starry background component

### Phase 2: AI Pipeline
**Goal**: The app can generate a complete 5-page story with illustrations by calling Claude and fal.ai, producing valid structured output with style-appropriate images
**Depends on**: Phase 1
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, STOR-06, IMAG-01, IMAG-02, IMAG-04, STYL-02
**Success Criteria** (what must be TRUE):
  1. POST to /api/generate-story returns valid 5-page story JSON with age-appropriate text where the hero resolves conflict through kindness or cleverness
  2. POST to /api/generate-image returns an illustration URL that visually matches the requested art style
  3. Image prompts include consistent character descriptions across all 5 pages of a story
  4. Story text appears immediately to the caller while images can be generated progressively (one by one)
  5. If story generation fails, one automatic retry occurs before returning a friendly error
**Plans**: TBD

Plans:
- [ ] 02-01: Claude story generation API with structured outputs and Zod validation
- [ ] 02-02: fal.ai image generation API with style prefixes and progressive loading support
- [ ] 02-03: End-to-end pipeline testing across hero/world/villain combinations

### Phase 3: Character Picker
**Goal**: Users can select their hero, world, villain, and art style from beautifully illustrated tactile cards on the entry screen
**Depends on**: Phase 1
**Requirements**: CHAR-01, CHAR-02, CHAR-03, STYL-01, STYL-03, PWA-04
**Success Criteria** (what must be TRUE):
  1. User can tap one of 5 hero cards, one of 5 world cards, and one of 5 villain cards on a single picker screen
  2. User can choose from 6 art styles in a horizontal scrollable strip with visual previews
  3. Cards give scale-on-press tactile feedback and have frosted glass glow effects
  4. Selected style preference persists across browser sessions
  5. A "Create My Story" button appears enabled only when all three selections are made
**Plans**: TBD

Plans:
- [ ] 03-01: Character picker cards with hero, world, and villain rows
- [ ] 03-02: Style picker strip with persistence and "Create My Story" flow

### Phase 4: Story Reader
**Goal**: Users can read their generated story as a swipeable full-bleed picture book with a seamless generation-to-reading transition
**Depends on**: Phase 2, Phase 3
**Requirements**: READ-01, READ-02, READ-03, READ-04, READ-05, PWA-07
**Success Criteria** (what must be TRUE):
  1. Each story page displays a full-bleed illustration with story text in a frosted glass overlay at the bottom
  2. User can swipe left/right or tap arrows to navigate between pages, with dot indicators showing position
  3. After page 5, a "Make Movie" button navigates to the video preview screen
  4. During generation, a loading screen shows animated progress ("Painting page 2 of 5...") and pages render text with gradient fallbacks before images arrive
  5. "New Story" button resets the current story and returns to the character picker
**Plans**: TBD

Plans:
- [ ] 04-01: Loading screen with generation progress and story page component
- [ ] 04-02: Swipeable story reader with navigation, page dots, and end-of-story flow
- [ ] 04-03: Full pipeline integration from picker through generation to reader

### Phase 5: Personalization
**Goal**: Users can make Evan the hero with face-consistent illustrations or pick any fiction character, making every story uniquely personal
**Depends on**: Phase 2, Phase 4
**Requirements**: CHAR-04, CHAR-05, CHAR-06, CHAR-07, IMAG-03
**Success Criteria** (what must be TRUE):
  1. User can upload a reference photo of Evan from the hero picker, and it persists across sessions without re-uploading
  2. When Evan's photo is set, all 5 generated illustrations use PuLID to maintain face consistency with the reference
  3. User can pick a fiction character from a searchable curated list (Bluey, Elsa, Pikachu, etc.) or type any character name
  4. A "Fan art for personal/private use only" disclaimer is visible when using fiction characters
**Plans**: TBD

Plans:
- [ ] 05-01: Photo upload component with persistent storage and PuLID integration
- [ ] 05-02: Fiction character modal with curated list and free-form input

### Phase 6: Video & PWA
**Goal**: Users can preview their story as a cinematic video and install the app on their iPad home screen for a native-like bedtime experience
**Depends on**: Phase 4
**Requirements**: VIDE-01, VIDE-02, VIDE-03, PWA-01, PWA-02
**Success Criteria** (what must be TRUE):
  1. User sees a Remotion Player on the movie page that plays a 90-second video with title card, 5 Ken Burns scenes, and end card
  2. User can scrub through the video preview with standard player controls
  3. Background lullaby audio plays during video preview (when user provides the MP3)
  4. App can be installed to iPad home screen via "Add to Home Screen" and launches in standalone landscape mode
**Plans**: TBD

Plans:
- [ ] 06-01: Remotion compositions (TitleCard, StoryScene, EndCard, StoryVideo)
- [ ] 06-02: Movie page with dynamic Player import and PWA manifest/service worker

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
Note: Phase 3 depends only on Phase 1 and can overlap with Phase 2 if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Design System | 0/2 | Not started | - |
| 2. AI Pipeline | 0/3 | Not started | - |
| 3. Character Picker | 0/2 | Not started | - |
| 4. Story Reader | 0/3 | Not started | - |
| 5. Personalization | 0/2 | Not started | - |
| 6. Video & PWA | 0/2 | Not started | - |

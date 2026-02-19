# Requirements: Evan's Story Studio

**Defined:** 2026-02-19
**Core Value:** A child taps three cards and gets a beautiful, personalized bedtime story with illustrations — the full magic loop from pick to read must feel seamless and delightful.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Character Selection

- [ ] **CHAR-01**: User can pick a hero from 5 preset characters (Fox, Knight, Dragon, Robot, Mermaid)
- [ ] **CHAR-02**: User can pick a world from 5 environments (Forest, Space, Ocean, Candy, Cloud)
- [ ] **CHAR-03**: User can pick a villain from 5 antagonists (Shadow, Ice Giant, Goblin, Thunder, Wizard)
- [ ] **CHAR-04**: User can upload a reference photo of Evan for face-consistent hero illustrations
- [ ] **CHAR-05**: User can pick a fiction character from curated list (Bluey, Elsa, Pikachu, etc.)
- [ ] **CHAR-06**: User can type any character name as free-form hero entry
- [ ] **CHAR-07**: Reference photo persists in storage so Evan doesn't re-upload each time

### Art Styles

- [ ] **STYL-01**: User can choose from 6 art styles (watercolor, 3D cartoon, anime, comic, paper cut, chalk)
- [ ] **STYL-02**: Selected style prefix is applied to all image prompts for the story
- [ ] **STYL-03**: Style preference persists across sessions

### Story Generation

- [ ] **STOR-01**: User receives a 5-page illustrated story after selecting characters and style
- [ ] **STOR-02**: Story text uses adaptive reading level appropriate to the child's age
- [ ] **STOR-03**: Story output uses validated structured JSON to prevent truncation
- [ ] **STOR-04**: Each page includes a mood-matched CSS gradient fallback for failed images
- [ ] **STOR-05**: Hero resolves conflict through kindness or cleverness, never violence
- [ ] **STOR-06**: Story generation retries once on failure, then shows friendly error with retry button

### Image Generation

- [ ] **IMAG-01**: Each story page gets an AI-generated illustration via fal.ai
- [ ] **IMAG-02**: Images load progressively — text appears immediately, images populate one by one
- [ ] **IMAG-03**: When reference photo exists (Evan mode), PuLID model generates face-consistent illustrations
- [ ] **IMAG-04**: Image prompts include consistent character description across all 5 pages

### Story Reader

- [ ] **READ-01**: User views full-bleed illustration with frosted glass text overlay per page
- [ ] **READ-02**: User can swipe left/right to navigate between pages
- [ ] **READ-03**: Page dot indicators show current position in the story
- [ ] **READ-04**: Navigation arrows allow tap-based page turning
- [ ] **READ-05**: After page 5, user sees "Make Movie" button to go to video preview

### Video

- [ ] **VIDE-01**: Remotion composition includes title card (3s), 5 Ken Burns scenes (15s each), end card (3s)
- [ ] **VIDE-02**: User can preview video via embedded Remotion Player with scrubbing
- [ ] **VIDE-03**: Video supports background lullaby audio slot

### PWA & Polish

- [ ] **PWA-01**: App is installable on iPad home screen as standalone PWA
- [ ] **PWA-02**: App displays in landscape orientation
- [ ] **PWA-03**: Animated starry night background with particle canvas
- [ ] **PWA-04**: Cards have scale-on-press feedback and frosted glass glow effects
- [ ] **PWA-05**: Typography uses Fredoka One for headings and Nunito for body
- [ ] **PWA-06**: Story, style preference, and reference photo persist in localStorage
- [ ] **PWA-07**: "New Story" button resets current story and returns to character picker

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Export

- **EXPV-01**: User can export video as downloadable MP4 via Remotion Lambda
- **EXPV-02**: User can share story as a link or image gallery

### Personalization

- **PERS-01**: User can save multiple stories in a story library
- **PERS-02**: User can set child's name and age for personalization defaults
- **PERS-03**: User can create multiple child profiles

### Content

- **CONT-01**: User can choose story length (3, 5, or 7 pages)
- **CONT-02**: User can add custom heroes, worlds, and villains beyond presets
- **CONT-03**: Text-to-speech narration option for independent use

### Platform

- **PLAT-01**: Phone-responsive layout (portrait mode support)
- **PLAT-02**: Multi-language story generation
- **PLAT-03**: Offline mode with cached stories

## Out of Scope

| Feature | Reason |
|---------|--------|
| Text-to-speech narration | Parent reading aloud IS the bedtime ritual — TTS undermines the product purpose |
| Branching/interactive stories | Choice points create stimulation; bedtime stories should be calming and linear |
| User accounts/authentication | Single-device personal use — localStorage is sufficient |
| Phone/mobile layouts | iPad-only for v1 — reduces layout complexity |
| Server-side video export | @remotion/bundler incompatible with Next.js — defer to Lambda in v2 |
| Real-time collaboration | Single-user bedtime use case |
| Backend database | No persistence beyond the device needed |
| COPPA compliance infrastructure | Personal/family use only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHAR-01 | — | Pending |
| CHAR-02 | — | Pending |
| CHAR-03 | — | Pending |
| CHAR-04 | — | Pending |
| CHAR-05 | — | Pending |
| CHAR-06 | — | Pending |
| CHAR-07 | — | Pending |
| STYL-01 | — | Pending |
| STYL-02 | — | Pending |
| STYL-03 | — | Pending |
| STOR-01 | — | Pending |
| STOR-02 | — | Pending |
| STOR-03 | — | Pending |
| STOR-04 | — | Pending |
| STOR-05 | — | Pending |
| STOR-06 | — | Pending |
| IMAG-01 | — | Pending |
| IMAG-02 | — | Pending |
| IMAG-03 | — | Pending |
| IMAG-04 | — | Pending |
| READ-01 | — | Pending |
| READ-02 | — | Pending |
| READ-03 | — | Pending |
| READ-04 | — | Pending |
| READ-05 | — | Pending |
| VIDE-01 | — | Pending |
| VIDE-02 | — | Pending |
| VIDE-03 | — | Pending |
| PWA-01 | — | Pending |
| PWA-02 | — | Pending |
| PWA-03 | — | Pending |
| PWA-04 | — | Pending |
| PWA-05 | — | Pending |
| PWA-06 | — | Pending |
| PWA-07 | — | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 0
- Unmapped: 35 (pending roadmap creation)

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after initial definition*

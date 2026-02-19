# Phase 1: Foundation & Design System - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold, TypeScript types, Zustand store with localStorage persistence, starry night visual identity with gold/purple palette, font system (Fredoka One + Nunito), and i18n foundation for 3 languages. This phase establishes every foundation that downstream features build on.

</domain>

<decisions>
## Implementation Decisions

### Starry night background
- Twinkling stars + occasional shooting stars for animation
- Three configurable density levels: sparse, medium, dense (selectable in settings)
- Depth mode configurable: flat star field vs layered parallax (selectable in settings)
- Sky gradient color selectable from presets in settings

### Color palette & mood
- Default mood: Mystical & deep (jewel tones, muted golds, dark backgrounds)
- Multiple theme presets selectable in settings: Mystical & deep (default), Dreamy & warm, Magical & vibrant
- Each theme preset defines sky gradient, accent colors, and overall mood together
- Dark mode default, with dark/light mode toggle in settings

### Visual language
- Mix of ethereal and tactile: frosted glass cards + solid, glowy buttons
- Subtle sparkle particle effects on key interactions (button tap, story creation, page turn)
- Corner rounding and transition style at Claude's discretion

### Landing experience
- Full-screen language picker on every app launch (3 large buttons: French, English, Ukrainian)
- After language selection: animated title screen with starry background
- Time-aware personalized greeting ("Good evening, Evan") using child's name from settings
- CTA button: "Begin the Adventure" (translated per language)
- Subtle gear icon in corner for parent access to settings
- Child's name configurable in settings

### Internationalization (i18n)
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

</decisions>

<specifics>
## Specific Ideas

- The three mood presets (Mystical, Dreamy, Magical) are the core theme system — each one is a complete visual package
- Settings page is important: density, depth, sky color, theme, dark/light mode, gold intensity, child name, language
- The settings UI itself may extend beyond Phase 1 scope, but the underlying configurable values must be in the foundation
- "Begin the Adventure" as CTA text — thematic and immersive

</specifics>

<deferred>
## Deferred Ideas

- Settings page UI design and implementation — may need its own plan or phase depending on complexity
- The generated story language (Claude prompt in French/Ukrainian) is an AI Pipeline concern (Phase 2) but the language selection infrastructure is Phase 1

</deferred>

---

*Phase: 01-foundation-design-system*
*Context gathered: 2026-02-19*

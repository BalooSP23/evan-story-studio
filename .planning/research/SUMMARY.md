# Project Research Summary

**Project:** Evan's Story Studio
**Domain:** AI-powered children's bedtime story generator PWA (iPad-optimized)
**Researched:** 2026-02-19
**Confidence:** HIGH

## Executive Summary

Evan's Story Studio is a personal-use PWA that generates illustrated bedtime stories for a 4-year-old. The product sits at the intersection of three well-documented domains: AI text generation (Claude), AI image generation (fal.ai FLUX models), and React-based video composition (Remotion). The recommended approach is a Next.js 16 App Router application with a strict server/client boundary -- Server Components for page shells, Client Components for all interactive UI, server-side API routes for all AI service calls. The stack is mature and well-verified: every core dependency has been confirmed on npm with React 19 compatibility. The two-model image generation strategy (FLUX.1 Schnell for standard illustrations at $0.003/image, PuLID FLUX for face-consistent "Evan mode") is both the cheapest and most purpose-built approach available. Total cost per story is $0.035-0.12, making this extremely cost-effective for a personal project.

The competitive landscape includes 15-20 AI story generators, but none combine face-in-illustrations, multiple art styles, video export, and a bedtime-optimized PWA. The product's unique niche is clear. The critical path is linear: Character Picker --> Story Generation --> Image Generation --> Story Reader --> Video Preview. Everything else (PWA install, fiction characters, photo upload) enhances this pipeline without changing its structure. The build order should follow this dependency chain, with Remotion compositions developed in isolation using Remotion Studio to avoid bundler conflicts.

The three highest risks are: (1) Remotion's bundler cannot run inside Next.js -- use Player for preview only and defer Lambda export to v2, (2) fal.ai content safety filters may block innocent children's prompts -- avoid words like "child" and "kid" in image prompts, use character descriptions instead, and (3) character face inconsistency across 5 pages is an inherent limitation of current AI image generation that can be mitigated but not eliminated. All three risks have documented prevention strategies. The Serwist PWA integration with Turbopack is the lowest-confidence area and may require fallback to manual service worker configuration.

## Key Findings

### Recommended Stack

The stack is anchored on Next.js 16.1.x with Turbopack, React 19, and TypeScript strict mode. All dependencies have been verified on npm and confirmed compatible with React 19. The project memory from a prior build validates that this exact combination works.

**Core technologies:**
- **Next.js 16.1.x:** Full-stack framework with App Router, Server Actions, Turbopack (5-10x faster HMR), React Compiler auto-memoization, and built-in font optimization via `next/font`
- **Claude API (claude-sonnet-4-5):** Story generation via `@anthropic-ai/sdk`. Use Structured Outputs for guaranteed valid JSON. ~$0.02 per story
- **fal.ai FLUX models:** FLUX.1 Schnell ($0.003/image) for standard illustrations, PuLID FLUX for face-consistent "Evan mode". Two-model strategy is cheaper and more purpose-built than alternatives
- **Remotion v4.0.424:** Player for in-browser video preview (dynamic import, client-only). Lambda for future export. Bundler/renderer explicitly excluded from Next.js
- **Zustand v5:** Single-store state management with `persist` middleware for localStorage. ~1KB bundle. Simpler than Jotai for this app's single-object state shape
- **Motion v12 (motion/react):** Animation, drag-based swipe gestures, and micro-interactions. Replaces need for separate gesture library
- **Tailwind CSS v4:** CSS-first config via `@theme` directive. No JS config file. Built-in Turbopack support
- **@serwist/turbopack v9.5.x:** PWA service worker generation. Turbopack-specific variant (not `@serwist/next` which is webpack-only)

**Critical version notes:**
- Import Motion from `motion/react`, not `framer-motion`
- Remotion Composition component needs `as any` cast for component prop (v4 type issue, documented)
- Tailwind v4 has no `tailwind.config.js` -- all config in CSS via `@theme`

### Expected Features

**Must have (table stakes):**
- AI-generated story text (Claude) -- core value proposition
- AI-generated illustrations (fal.ai) -- text-only stories feel like prototypes
- Character/theme selection cards -- eliminates blank page problem
- Age-appropriate content -- enforced via system prompt ("kindness/cleverness, never violence")
- Progressive loading with gradient fallbacks -- 5-15s per image; users abandon without feedback
- Persistent story state via localStorage -- parents re-read stories
- Touch-optimized UI (64px+ touch targets) -- 4-year-old users have imprecise motor skills
- Full-bleed illustrations -- the illustration IS the page, not a thumbnail

**Should have (differentiators):**
- Child's face in illustrations via PuLID -- the #1 emotional differentiator. Parents will show friends
- 6 art style options -- low implementation cost (prompt prefixes), high replay value
- Video export via Remotion -- only one competitor (ReadKidz) has this. Keepsake for grandparents
- Fiction character heroes -- no competitor offers cross-franchise custom stories
- Dark starry night aesthetic -- every competitor uses bright daycare colors. "Bedtime" not "classroom"
- Swipeable picture book UX -- web apps rarely have true swipe-to-turn interaction
- Villain selection -- gives the LLM narrative conflict to work with, improves story quality

**Defer to v2+:**
- Video export download (Remotion Lambda) -- requires AWS infrastructure
- Story library (multiple saved stories) -- one story at a time is fine for MVP
- Multiple reading levels / age adaptation

**Explicitly never build:**
- User accounts / auth (COPPA liability, friction for a 4-year-old)
- Social sharing / community (moderation burden, dilutes bedtime intimacy)
- Interactive branching stories (stimulation at bedtime is counterproductive)
- TTS / AI narration (the parent IS the narrator -- that is the ritual)
- In-app purchases (personal project, not SaaS)
- Phone layouts (iPad only -- explicit decision, not laziness)
- Print-to-book (video is the keepsake)
- Story editing (tap "New Story" instead -- preserves the magic)

### Architecture Approach

The architecture is a clean three-layer system: (1) Next.js page shells as Server Components rendering client-side interactive islands, (2) a Zustand client-side store persisted to localStorage (text data) and IndexedDB (reference photo blob), and (3) server-side API routes that wrap Claude and fal.ai SDKs to protect API keys. Remotion compositions live in a separate `/remotion/` directory, developed and tested independently via Remotion Studio, and consumed by the Next.js app only through the `@remotion/player` dynamic import on the `/movie` page.

**Major components:**
1. **Character Picker (Client)** -- Hero/World/Villain selection + Style Picker + Photo Upload + Fiction Modal. Writes selections to Zustand store
2. **Story Generation Pipeline (Server)** -- POST /api/generate-story calls Claude, returns StoryJSON. POST /api/generate-image calls fal.ai per page. Sequential image generation with progressive display
3. **Story Reader (Client)** -- Swipeable full-bleed pages with text overlay in frosted glass. Works with text + gradient fallbacks before images load
4. **Remotion Compositions (Standalone)** -- TitleCard + 5x StoryScene (Ken Burns) + EndCard. 90 seconds at 30fps. Loaded via Player dynamic import
5. **Zustand Store (Client)** -- Central state: selections, story JSON, generation progress, reference image URL. Persisted via `persist` middleware with `skipHydration` to avoid SSR mismatch

**Key architectural patterns:**
- Server-first with client islands (standard App Router)
- Sequential image generation with per-page progress updates (avoids rate limits, enables progressive UX)
- Remotion Player via `next/dynamic` with `ssr: false` and `lazyComponent` + `useCallback`
- Error boundaries with graceful degradation (gradient fallbacks, retry buttons)

### Critical Pitfalls

1. **Remotion bundler in Next.js** -- `@remotion/bundler` and `@remotion/renderer` cannot run inside Next.js (Webpack-in-Webpack conflict). Install ONLY `remotion`, `@remotion/cli`, and `@remotion/player`. Address in Phase 1 scaffold
2. **Claude JSON truncation** -- Set `max_tokens: 4096+`, check `stop_reason`, use Structured Outputs for guaranteed schema compliance. Validate with Zod before consuming. Address in Phase 2 API routes
3. **fal.ai content filter blocks innocent prompts** -- Avoid "child," "kid," "boy," "girl" in image prompts. Use "small adventurer," "tiny hero" instead. Style prefix ("watercolor children's book illustration") signals art context. Build retry with rephrased prompt. Address in Phase 2
4. **Zustand persist hydration mismatch** -- Use `skipHydration: true` and manual `rehydrate()` in `useEffect`. Render loading skeleton during SSR. Address in Phase 1 scaffold
5. **Image generation latency (15-45s for 5 images)** -- Show story text immediately with gradient fallbacks. Progressive per-page image loading. Compelling animated loading screen. Address in Phase 3 components

## Implications for Roadmap

Based on combined research, the build should follow the critical dependency path with Remotion developed in parallel isolation.

### Phase 1: Foundation and Scaffold
**Rationale:** Every other phase depends on the project skeleton, type system, state management, and build pipeline being correct. Two critical pitfalls (Remotion bundler conflict, Zustand hydration mismatch) must be resolved here before any feature code is written. Turbopack vs Webpack compatibility must be verified immediately.
**Delivers:** Working Next.js 16 project with Tailwind v4, Zustand store (hydration-safe), type definitions, style constants, fonts, starry background, and both `npm run dev` and `npm run build` passing
**Addresses:** Touch-optimized UI foundation, dark starry night aesthetic, persistent state infrastructure
**Avoids:** Remotion bundler conflict (only install Player/CLI), Zustand hydration errors (skipHydration pattern), Turbopack config confusion (test both bundlers)
**Features from FEATURES.md:** None directly -- this is infrastructure. But the aesthetic (dark sky, frosted glass, gold accents) should be established here as it is a differentiator

### Phase 2: AI Pipeline (Story + Images)
**Rationale:** The AI generation pipeline is the core value. It must work reliably before any UI consumes it. Three pitfalls concentrate here: Claude JSON truncation, fal.ai content filter blocking, and prompt engineering for character consistency. Build and test API routes in isolation (curl/Postman) before building UI.
**Delivers:** POST /api/generate-story (Claude with Structured Outputs, Zod validation), POST /api/generate-image (fal.ai Schnell for standard, PuLID for face reference), prompt templates for all 6 styles, tested across representative hero/world/villain combinations
**Addresses:** AI story generation (table stakes), AI illustration (table stakes), age-appropriate content (table stakes), 6 art styles (differentiator)
**Avoids:** Claude JSON truncation (max_tokens + stop_reason check + Structured Outputs), content filter blocks (prompt engineering without child-related terms), API key exposure (server-side only routes)
**Features from FEATURES.md:** Story generation, image generation, style-prefixed prompts

### Phase 3: Core UI (Picker + Reader + Loading)
**Rationale:** With the AI pipeline verified, build the UI that consumes it. The critical UX path is Picker --> Loading --> Reader. Progressive image loading and gradient fallbacks must be designed into the reader from day one -- the reader must look beautiful with text-only. This phase has the image generation latency pitfall.
**Delivers:** Character Picker (preset heroes/worlds/villains), Style Picker (6 styles), Loading Screen (animated progress), Story Reader (swipeable pages with frosted glass text overlay), generation pipeline wiring (store --> API --> progressive display)
**Addresses:** Character/theme selection (table stakes), progressive loading (table stakes), full-bleed illustrations (table stakes), swipeable book UX (differentiator), gradient fallbacks (table stakes)
**Avoids:** Image latency UX death (progressive loading, immediate text display, animated loading screen), double-submission (disable button on click), memory pressure (URL storage, not base64)

### Phase 4: Personalization (Evan Mode + Fiction Characters)
**Rationale:** Photo upload and fiction characters are the highest-value differentiators but depend on the core pipeline working. PuLID face consistency is the highest technical risk in the project. Build it after the standard flow is solid so failures here don't block the core experience.
**Delivers:** Photo Upload component with IndexedDB storage, PuLID integration for face-consistent images, Fiction Character Modal with curated list + free-form input, "Fan art" disclaimer
**Addresses:** Child's face in illustrations (differentiator #1), fiction character heroes (differentiator)
**Avoids:** Character face inconsistency (detailed canonical descriptions in every prompt, front-facing photo validation), content filter escalation with face reference (avoid child-related terms entirely in PuLID prompts), localStorage overflow (IndexedDB for photo blobs)

### Phase 5: Video Preview
**Rationale:** Remotion compositions should be developed in Remotion Studio (isolated from Next.js), then integrated via dynamic Player import. This is the most technically unique feature but depends on complete stories with images existing. Build it last in the feature pipeline.
**Delivers:** TitleCard, StoryScene (Ken Burns effect), EndCard Remotion compositions, MoviePreview component with dynamic Player import, lullaby audio overlay, /movie page
**Addresses:** Video export via Remotion (differentiator -- preview only for v1)
**Avoids:** Remotion Player SSR crash (dynamic import with ssr: false), eager bundle loading (lazyComponent + useCallback), Remotion bundler in Next.js (Player only, no renderer)

### Phase 6: PWA and Polish
**Rationale:** PWA installation and polish are the finishing layer. Serwist integration is the lowest-confidence area in the stack and may need debugging. iPad Safari testing reveals device-specific bugs that are easier to fix when all features are complete. Animation polish and touch feedback refinement happen here.
**Delivers:** PWA manifest, service worker (Serwist or manual fallback), offline cached story reading, iPad Safari-specific fixes, animation polish, "Add to Home Screen" flow tested on physical device
**Addresses:** PWA installable on iPad (differentiator), offline re-reading of cached stories
**Avoids:** Serwist + Turbopack edge cases (have manual SW fallback ready), caching API routes in service worker (NetworkOnly for /api/*), Safari CSS backdrop-filter bugs (test early), excessive starry particle animation (cap at 50-80 particles)

### Phase Ordering Rationale

- **Phase 1 before everything:** Zustand hydration and Remotion bundler pitfalls must be resolved in the scaffold. Getting these wrong poisons all downstream work
- **Phase 2 before Phase 3:** API routes must be tested independently before UI consumes them. Prompt engineering iterations (content filter avoidance, style adherence) are faster without UI overhead
- **Phase 3 before Phase 4:** The standard generation flow must work end-to-end before adding PuLID complexity. If PuLID fails, the app still works with preset characters
- **Phase 4 before Phase 5:** Video preview needs complete stories with images. Personalization is higher-value than video and should be prioritized
- **Phase 5 before Phase 6:** Remotion compositions should be developed and integrated before final polish pass
- **Phase 6 last:** PWA and polish are cross-cutting concerns that touch everything. Doing them last means testing the final product, not a partial one

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (AI Pipeline):** Prompt engineering for content filter avoidance needs extensive testing across all 125 hero/world/villain combinations. Claude Structured Outputs API may have model-specific limitations that need verification
- **Phase 4 (Personalization):** PuLID face consistency is the highest-risk feature. May need to evaluate Kontext chaining (page 1 output feeds page 2 input) as a fallback strategy. Reference photo validation requirements are not well-documented
- **Phase 6 (PWA):** Serwist + Turbopack integration is relatively new. iPad Safari PWA behavior has device-specific quirks that are hard to predict without testing

**Phases with standard patterns (skip deep research):**
- **Phase 1 (Foundation):** Next.js 16 scaffold, Zustand store, Tailwind v4 -- all well-documented with official guides
- **Phase 3 (Core UI):** React components, Motion gestures, state-driven UI -- standard patterns with extensive examples
- **Phase 5 (Video):** Remotion Player integration is well-documented. Compositions are just React components

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified on npm. Version compatibility confirmed. Prior project memory validates the combination. Cost estimates verified against official pricing |
| Features | MEDIUM-HIGH | Competitive analysis covers 15+ products but some at LOW confidence (search results only). Table stakes and differentiators are well-identified. Anti-features list is strong and well-reasoned |
| Architecture | HIGH | Patterns come from official docs (Next.js, Remotion, Zustand, fal.ai). Component boundaries are clean. Data flow is straightforward. Build order derived from dependency analysis |
| Pitfalls | HIGH | Verified across official docs, GitHub issues, and community reports. Remotion limitation confirmed in project memory. Claude JSON handling well-documented. fal.ai content filter is a known platform issue |

**Overall confidence:** HIGH

### Gaps to Address

- **Serwist + Turbopack compatibility:** Relatively new integration (v9.5.5). May need to fall back to `@serwist/next` with webpack builds or a manual service worker. Test during Phase 1 scaffold and have fallback plan ready
- **PuLID face consistency quality:** Confirmed working but quality across 5 diverse scenes is unpredictable. No way to guarantee consistency without testing with actual reference photos. May need Kontext chaining as fallback
- **FLUX.2 evaluation:** FLUX.2 models are available at higher cost. If FLUX.1 Schnell illustration quality is insufficient for children's book aesthetics, FLUX.2 dev ($0.012/MP) is the upgrade path. Flag for Phase 2 evaluation
- **iPad Safari Remotion Player:** Touch interaction (scrubbing, play/pause) on mobile Safari is not well-documented for Remotion Player. May need custom controls
- **Portrait orientation:** Research flagged that parents may hold iPad in portrait during bedtime reading. The spec says landscape-only but this should be validated with actual usage. Consider supporting both orientations
- **Parallel vs sequential image generation:** PITFALLS.md gives contradictory advice (recommends parallel in performance traps, recommends sequential in architecture patterns). Recommendation: start sequential for reliability, move to parallel (max 2 concurrent) if latency is unacceptable during Phase 3 testing

## Sources

### Primary (HIGH confidence)
- [Next.js 16 / 16.1 Release](https://nextjs.org/blog/next-16) -- Framework capabilities, Turbopack default, React Compiler
- [Remotion Brownfield + Player Docs](https://www.remotion.dev/docs/brownfield) -- Integration pattern, bundler limitation
- [Remotion SSR/Next.js Limitation](https://www.remotion.dev/docs/miscellaneous/nextjs) -- Cannot use renderer in Next.js
- [fal.ai FLUX.1 Schnell](https://fal.ai/models/fal-ai/flux/schnell) -- Pricing, API, speed
- [fal.ai PuLID](https://fal.ai/models/fal-ai/flux-pulid/api) -- Face reference API, confirmed working
- [fal.ai Pricing](https://fal.ai/pricing) -- Cost estimates verified
- [Claude Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) -- JSON schema guarantee
- [Zustand Persist + Next.js](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) -- Hydration patterns
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, @theme directive
- [COPPA 2025 Update](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/new-coppa-obligations-for-ai-technologies-collecting-data-from-children) -- Legal obligations for child data

### Secondary (MEDIUM confidence)
- [Oscar Stories](https://oscarstories.com/), [Scarlett Panda](https://www.scarlettpanda.com/), [ReadKidz](https://www.readkidz.com/) -- Competitor feature analysis
- [Serwist Next.js Docs](https://serwist.pages.dev/docs/next/getting-started) -- PWA service worker setup
- [PWA on iOS 2025](https://brainhub.eu/library/pwa-on-ios) -- Safari PWA limitations
- [Tom's Guide AI Storytelling Apps](https://www.tomsguide.com/ai/as-a-busy-mom-these-are-the-5-best-ai-storytelling-apps-for-kids-ive-tried) -- Market analysis

### Tertiary (LOW confidence)
- Bedtimestory.ai, Sleepytale, Lunesia, StoryArtAI -- Known to exist, limited feature details from search results only
- fal.ai FLUX.2 models -- Available but not tested for this use case. Pricing verified, quality unverified

---
*Research completed: 2026-02-19*
*Ready for roadmap: yes*

# Pitfalls Research

**Domain:** AI-powered children's bedtime story generator PWA (Next.js + Claude API + fal.ai + Remotion + PWA)
**Researched:** 2026-02-19
**Confidence:** HIGH (verified across official docs, GitHub issues, and community reports)

---

## Critical Pitfalls

### Pitfall 1: Remotion Bundler Cannot Run Inside Next.js

**What goes wrong:**
Attempting to use `@remotion/bundler` or `@remotion/renderer` in a Next.js API route fails because these packages depend on Webpack and FFmpeg binaries. You cannot bundle Webpack with Webpack (or Turbopack). The build either crashes at compile time or the API route throws at runtime because it cannot find the FFmpeg binary or the headless browser.

**Why it happens:**
Developers see Remotion's SSR rendering docs and assume they can call `renderMedia()` from a Next.js API route. The Remotion docs explicitly state this is "not officially supported" for self-hosted Next.js. The `@remotion/bundler` includes its own Webpack instance which conflicts with Next.js's bundler.

**How to avoid:**
- Use `@remotion/player` for client-side preview ONLY -- this works fine in Next.js
- For actual video rendering, use `@remotion/lambda` (AWS Lambda distributed rendering) or a separate Node.js rendering service
- For this project (personal/family use), the Player preview may be sufficient. Defer server-side rendering to a later phase or skip it entirely
- If rendering is needed, create a standalone Remotion render script (`npx remotion render`) invoked as a child process, NOT as an imported module in an API route

**Warning signs:**
- Build errors mentioning "Cannot find module 'webpack'" in API routes
- Runtime errors about missing FFmpeg binary
- `@remotion/bundler` appearing in your Next.js bundle analysis
- Turbopack build failures when Remotion webpack config is present

**Phase to address:**
Phase 1 (Scaffold). Decide the rendering strategy upfront. Install only `remotion`, `@remotion/cli`, and `@remotion/player` in the Next.js project. Do NOT install `@remotion/bundler` or `@remotion/renderer` as Next.js dependencies.

---

### Pitfall 2: Turbopack Ignores Webpack Configuration

**What goes wrong:**
Next.js 16 defaults to Turbopack for both dev and build. Turbopack does NOT support webpack plugins and ignores custom `webpack()` config in `next.config.js`. Any library that injects webpack config (including Remotion's recommended overrides, Serwist's webpack plugin, etc.) either fails silently or throws a build error.

**Why it happens:**
Next.js 16 made Turbopack the default bundler. Developers following older tutorials or library docs that assume Webpack will find their configurations have no effect. The build may succeed but behave unexpectedly because loaders/plugins never ran.

**How to avoid:**
- For dev: Turbopack works fine since Remotion Player doesn't need webpack overrides for client-side usage
- For production build: Use `next build --webpack` flag if any dependency requires webpack plugins
- Alternatively, add an empty `turbopack: {}` in next.config.js to prevent third-party webpack injection from crashing Turbopack
- For `@serwist/next`: Verify it works with Turbopack, or use the `--webpack` flag for builds
- Test both `npm run dev` (Turbopack) and `npm run build` (may need Webpack) early

**Warning signs:**
- PWA service worker not generating during build
- Remotion-related webpack overrides having no effect
- Build succeeding but missing expected transformations
- Error: "Custom webpack configuration detected with Turbopack"

**Phase to address:**
Phase 1 (Scaffold). Configure the build pipeline before writing any feature code. Document whether dev uses Turbopack and build uses Webpack, and test this combination immediately.

---

### Pitfall 3: Claude API JSON Output Truncation and Malformation

**What goes wrong:**
Claude generates a 5-page story as JSON. The response hits the `max_tokens` limit and truncates mid-JSON, producing invalid JSON that crashes `JSON.parse()`. Alternatively, Claude wraps the JSON in markdown code fences, adds explanatory text before/after the JSON, or produces subtly invalid JSON (trailing commas, unescaped characters in story text).

**Why it happens:**
A 5-page story with detailed `imagePrompt` fields for each page can easily exceed 2000-3000 tokens. If `max_tokens` is set too low, the response truncates. Claude also has a natural tendency to "explain" its output rather than returning raw JSON, especially without strict prompting.

**How to avoid:**
- Use Claude's **Structured Outputs** feature (beta since November 2025) with `output_format` parameter and a JSON schema. This guarantees valid JSON matching your schema. Requires the `structured-outputs-2025-11-13` beta header
- Set `max_tokens` to at least 4096 (story JSON typically runs 1500-2500 tokens)
- Check the response `stop_reason` -- if it equals `"max_tokens"`, the response was truncated. Retry with higher limit or implement continuation
- Include explicit instructions in the system prompt: "Return ONLY valid JSON. No markdown formatting. No explanatory text."
- Validate the parsed JSON against your TypeScript schema before using it
- Have a retry mechanism: if JSON.parse fails, retry once with a more explicit prompt

**Warning signs:**
- `SyntaxError: Unexpected end of JSON input` in your API route
- `stop_reason: "max_tokens"` in Claude responses
- Story JSON missing the last 1-2 pages
- Image prompts being generic or missing style prefixes (Claude ran out of tokens before completing them)

**Phase to address:**
Phase 2 (API Routes). Build and test the story generation endpoint with all hero/world/villain combinations before building any UI that depends on it.

---

### Pitfall 4: Zustand Persist + localStorage Causes Hydration Mismatch

**What goes wrong:**
Using Zustand's `persist` middleware with `localStorage` causes React hydration errors in Next.js. The server renders with Zustand's initial state (empty/default), but the client hydrates with the persisted localStorage state. React detects the mismatch and throws: "Text content does not match server-rendered HTML."

**Why it happens:**
localStorage is a browser-only API. During SSR, Zustand returns default values. During client hydration, Zustand reads from localStorage and returns different values. This is a fundamental SSR + client-state mismatch that affects ANY localStorage-backed state in Next.js.

**How to avoid:**
- Use Zustand's `skipHydration` option and manually call `rehydrate()` in a `useEffect`
- Create a custom `useHydrated()` hook that returns `false` during SSR and `true` after client mount. Render loading/skeleton states until hydrated
- Mark all components that read from persisted Zustand stores with `"use client"` (they should be client components anyway)
- Consider using `useSyncExternalStore` with separate server/client snapshots
- The simplest pattern: render a skeleton on first render, then swap in the real content after the store rehydrates in useEffect

**Warning signs:**
- Hydration error warnings in the browser console
- Flash of default state content before persisted state loads
- Story data disappearing on page refresh then reappearing
- Different content visible during SSR vs client render

**Phase to address:**
Phase 1 (Scaffold). Set up the Zustand store with the hydration-safe pattern from day one. Every component that reads persisted state needs the guard.

---

### Pitfall 5: fal.ai Content Safety Filter Blocks Innocent Children's Prompts

**What goes wrong:**
fal.ai's content safety filter triggers `content_policy_violation` (HTTP 422) on prompts that mention children, kids, or child-like characters -- even when the prompt is entirely innocent (e.g., "a little fox hero hugging a child in a watercolor style"). This is a known issue across AI image generation platforms where child-related terms trigger overly aggressive safety filters.

**Why it happens:**
AI image generation platforms use automated content classifiers that flag any combination of "child" + "character" + "illustration" as potentially problematic. The classifiers are intentionally over-sensitive to protect against misuse. This hits children's story generators especially hard because every prompt is inherently about children's content.

**How to avoid:**
- Avoid words like "child," "kid," "boy," "girl," "toddler" in image prompts entirely
- Use character descriptions instead: "a small, young adventurer," "a tiny hero with round cheeks"
- Frame prompts as "children's book illustration" (describing the art style) rather than "illustration of a child" (describing content)
- Use the art style prefix heavily: "Watercolor children's book illustration style" signals the safety filter that this is art, not photorealistic content
- For the "Evan as hero" mode with face reference (PuLID), be extra careful -- avoid combining face reference images with any child-related terms. Describe the character by appearance only
- Build a retry mechanism that rephrases the prompt on `content_policy_violation` errors
- Log all blocked prompts to identify problematic patterns and refine your prompt templates

**Warning signs:**
- Intermittent 422 errors from fal.ai that don't reproduce consistently
- Some story combinations always failing while others succeed
- The "Evan" custom character mode failing more than preset characters
- Error spikes when using words like "little," "tiny," "young" in combination

**Phase to address:**
Phase 2 (API Routes) and Phase 4 (Polish). Build the prompt engineering templates early, test extensively with all character/world/style combinations, and refine based on which prompts get blocked.

---

### Pitfall 6: Character Face Inconsistency Across 5 Story Pages

**What goes wrong:**
Even with PuLID or Kontext for face reference, the hero character looks noticeably different across the 5 generated illustrations. Different poses, lighting, and scene contexts cause the model to drift from the reference. Clothing, hair style, and even facial features shift between pages. For the "Evan" custom character mode, the resemblance to the uploaded photo may be strong on page 1 but weak by page 5.

**Why it happens:**
Current face-consistency models (PuLID, IP-Adapter, Kontext) maintain identity to varying degrees, but none guarantee pixel-perfect consistency across multiple generations. Each image is generated independently, and the model balances the face reference against the scene description. Complex scenes (underwater, outer space, dark environments) can overwhelm the face reference signal.

**How to avoid:**
- Use a consistent, detailed character description in every image prompt (not just the face reference). Include: clothing, hair color/style, body proportions, distinguishing features
- For preset characters (Fox, Robot, Dragon), define a canonical description once and include it verbatim in every page's image prompt
- For "Evan" mode, use PuLID with a front-facing, well-lit reference photo. Reject low-quality uploads
- Consider generating all 5 images with the same seed (if the model supports it) or with minimal prompt variation for non-scene elements
- Use FLUX Kontext [pro] for iterative editing: generate page 1, then use page 1 as input context for page 2, etc. This creates a chain of visual consistency
- Set realistic expectations in the UI: slight variations are normal and can be framed as an artistic feature ("every page is a unique painting")
- For preset cartoon characters (Fox, Dragon), consistency is actually easier because the style is less photorealistic

**Warning signs:**
- Users complaining the hero "looks different on every page"
- The villain or world looking more consistent than the hero (because they lack face reference constraints)
- Face reference images producing "uncanny valley" results when combined with cartoon styles

**Phase to address:**
Phase 2 (API Routes) for initial prompt engineering, Phase 4 (Polish) for refinement after real user testing. This is an inherent limitation of current AI image generation -- perfect consistency is not achievable, only "good enough."

---

### Pitfall 7: Image Generation Latency Destroys the UX

**What goes wrong:**
Generating 5 AI illustrations takes 15-45 seconds total (3-9 seconds each for flux/schnell, longer for PuLID). Users see a blank loading screen for 30+ seconds, assume the app is broken, and close it. Children (the audience) have zero patience for loading screens.

**Why it happens:**
Each fal.ai image generation is a separate API call. Sequential generation means 5x the latency. Even parallel generation takes as long as the slowest image. Cold starts on fal.ai's infrastructure add additional delay. PuLID (face reference) is significantly slower than basic flux/schnell.

**How to avoid:**
- Generate images in PARALLEL, not sequentially. Fire all 5 fal.ai requests simultaneously
- Show story TEXT immediately while images load in the background. The story reader should be usable with just text + fallback gradients
- Use progressive loading: as each image completes, update that page. Users can start reading page 1's text while pages 2-5 images are still generating
- Show a compelling animated loading screen with real progress: "Painting page 1 of 5..." updates as each image completes
- Use the `imageFallbackGradient` field -- beautiful CSS gradients that match the scene mood. These display instantly and make the app feel complete even before images arrive
- Consider pre-generating a small set of "starter stories" that are cached locally for instant first experience
- Use fal.ai's queue API with webhooks rather than blocking HTTP requests. Submit all 5 jobs, then poll or receive webhooks as they complete

**Warning signs:**
- Average story generation time exceeding 30 seconds
- Users refreshing/closing during the loading phase
- The loading screen showing no progress for 10+ seconds
- Memory pressure from 5 simultaneous large image downloads

**Phase to address:**
Phase 3 (Components/Pages). The loading screen and progressive image loading are UX-critical. Design the story reader to be functional without images from day one.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing base64 images in localStorage | Simple persistence, no server needed | localStorage has a 5-10MB limit; 5 high-res images can exceed this. Causes silent data loss or quota errors | Only for the reference photo (single image). Story images should be URLs, not base64 |
| Hardcoding prompt templates as string literals | Fast to iterate on prompts | Prompts become unmaintainable spaghetti across multiple files. Hard to A/B test or version | MVP only. Extract to a dedicated prompt template system in Phase 4 |
| Using `any` type casts for Remotion | Bypasses TypeScript errors from Remotion's strict generic types | Hides real type errors, makes refactoring unsafe | Acceptable for Remotion `Composition` component prop type (known v4 issue). Document each cast with a comment explaining why |
| Skipping error boundaries around AI-generated content | Faster development, fewer components | One malformed API response crashes the entire app. No graceful degradation | Never acceptable. Add error boundaries from Phase 2 |
| Inline fal.ai model selection | Quick to change models during development | Model names scattered across codebase. Switching from schnell to dev or kontext requires hunting through files | MVP only. Centralize in `/lib/fal.ts` config object by Phase 2 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude API | Sending the story schema as a natural language description in the prompt | Use Structured Outputs with a formal JSON schema in `output_format`. This guarantees schema compliance. Fall back to prompt-only with explicit "return ONLY JSON" if structured outputs are unavailable for your model |
| fal.ai flux/schnell | Using the default image size (square) for all outputs | Request landscape aspect ratio (16:9 or similar) to match iPad display and Remotion composition (1920x1080). Square images waste space and look wrong in the story reader |
| fal.ai PuLID | Uploading a low-quality, poorly-lit, or side-angle reference photo | Validate the reference photo: minimum resolution, face detection check, front-facing guidance. Show the user tips: "Use a clear, front-facing photo with good lighting" |
| Remotion Player | Importing Remotion compositions at the top level of a page component | Use `next/dynamic` with `{ ssr: false }` to lazy-load the Remotion Player. It depends on browser APIs and will crash during SSR |
| Serwist PWA | Caching API routes (`/api/generate-story`, `/api/generate-image`) with the service worker | NEVER cache AI generation API routes. These must always hit the network. Only cache static assets, fonts, and the app shell. Use `NetworkOnly` strategy for API routes |
| Zustand + localStorage | Reading persisted state during server-side rendering | Use `skipHydration: true` in the persist config. Manually rehydrate in `useEffect`. Always render a loading state on first server render |
| motion/react (Framer Motion) | Importing from `"framer-motion"` (the old package name) | Import from `"motion/react"`. The package was rebranded. Using the old import path may work but pulls in a compatibility shim or fails entirely |
| Tailwind CSS v4 | Using `tailwind.config.js` or `tailwind.config.ts` for configuration | Tailwind v4 uses CSS-first configuration with `@theme` directive in your CSS file. There is no JS config file. Theme customization happens in `globals.css` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Storing all 5 story images as base64 in localStorage | Slow page loads, "QuotaExceededError" in console, story data silently truncated | Store image URLs only, not image data. Let the browser cache handle image caching. Use fallback gradients when images are unavailable offline | At 2-3 saved stories (5 base64 images per story = 15-25MB easily exceeds 5-10MB localStorage limit) |
| Loading Remotion Player eagerly on the story reader page | 500KB+ added to initial page bundle. Story reader takes 3-5 seconds to become interactive | Dynamic import `@remotion/player` only on the `/movie` page. Do not import it on `/story` or `/` | Immediately -- the bundle size impact is felt on every page load |
| Generating images sequentially instead of in parallel | 25-45 second total wait time for 5 images. Users abandon before story loads | Use `Promise.allSettled()` to fire all 5 fal.ai requests simultaneously. Handle individual failures gracefully | Always -- sequential generation is never acceptable for 5 images |
| Not debouncing/preventing double-submission of story generation | Multiple duplicate Claude API calls, doubled fal.ai image generation costs, race conditions in state | Disable the "Create My Story" button immediately on click. Use a generating state flag. Ignore duplicate requests in the API route | First time a user double-taps the button (common on touch devices) |
| Animating too many particles in the starry background | Janky scrolling on iPad, high CPU usage, battery drain, fan noise | Cap particles at 50-80 max. Use CSS animations or `will-change: transform` instead of JavaScript-driven animation. Use `requestAnimationFrame` and skip frames on low-performance devices | On older iPads (iPad 7th gen, iPad Air 3) or when the story reader has 5 high-res images loaded simultaneously |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing API keys in client-side code | Anyone can inspect network requests and steal your Anthropic/fal.ai API keys. Bills rack up from unauthorized usage | ALL API calls to Claude and fal.ai must go through Next.js API routes (server-side). Never import `@anthropic-ai/sdk` or `@fal-ai/client` with keys in client components. Use environment variables only in API routes |
| No rate limiting on API routes | A single user (or bot) can trigger hundreds of story/image generations, costing significant money on Claude and fal.ai APIs | Add rate limiting to `/api/generate-story` and `/api/generate-image`. Even a simple in-memory counter (5 stories per hour per IP) prevents abuse. For family use, this is less critical but still good practice |
| Storing uploaded child photos without consent flow | COPPA (updated June 2025) requires verifiable parental consent for collecting personal information from children under 13. A child's photo is biometric data under the new rules | For personal/family use: store photos only in localStorage/IndexedDB (never sent to a server for storage). Add a clear notice: "This photo stays on your device only." For any public deployment: implement a full COPPA consent flow or remove the photo upload feature |
| Sending child photos to third-party AI APIs | The reference photo is sent to fal.ai for PuLID processing. fal.ai's data retention and training policies may not be COPPA-compliant | Review fal.ai's data processing terms. For personal use, this is a pragmatic tradeoff. For any commercial deployment, this requires legal review. Consider adding a disclaimer: "Reference photos are sent to fal.ai for image generation and are not stored" |
| Not sanitizing Claude's story text output | Claude could potentially generate text containing HTML/script injection if the response is rendered with `dangerouslySetInnerHTML` | Always render story text as plain text in React (default behavior). Never use `dangerouslySetInnerHTML` for AI-generated content. Validate that story text contains no HTML tags |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing a static loading spinner during 30-second story generation | Children and parents perceive the app as frozen or broken. High abandonment rate | Show an animated "book opening" sequence with progressive status updates: "Writing your story..." then "Painting page 1 of 5..." as each image completes. Make the wait feel like magic, not a loading bar |
| Making the Story Reader depend entirely on images being loaded | If ANY image fails to generate, the entire story page is broken. Users see a blank rectangle | Design the story reader to look beautiful with text + fallback gradients only. Images are an enhancement, not a requirement. Each page should have a `imageFallbackGradient` that matches the scene mood |
| Small touch targets on iPad | Children (ages 2-5) have imprecise motor skills. Small buttons cause frustration and accidental taps | Minimum 64px touch targets. Hero/World/Villain selection cards should be at least 120px tall. Add generous padding between interactive elements. Use scale-on-press feedback (0.95 scale) so children know their tap registered |
| Landscape-only assumption | Many parents hold the iPad in portrait, especially when reading bedtime stories with a child on their lap | Support both orientations. Optimize for landscape (primary) but ensure portrait is usable. The story reader should stack image-above-text in portrait mode |
| No way to go back or restart mid-flow | User picks wrong hero or wants to change the world after seeing the story. Must refresh the entire app | Add a "New Story" button on the story reader. On the character picker, show current selections so users can tap to change. Preserve selections in Zustand so they survive page navigation |
| Fiction character mode generating copyrighted likenesses | The generated images may look nothing like the intended character, or may produce recognizable copyrighted designs | Set expectations: the disclaimer "Fan art for personal/private use only" is necessary. More importantly, be transparent that AI cannot reliably reproduce specific copyrighted characters. The result will be "inspired by" not "identical to" |

## "Looks Done But Isn't" Checklist

- [ ] **Story generation:** Test with ALL hero/world/villain combinations (5x5x5 = 125 combos). Some combinations produce poor stories or trigger content filters
- [ ] **Image generation:** Test with ALL 6 art styles. Some style prefixes work better than others with flux/schnell. Chalk and papercut styles may produce inconsistent results
- [ ] **PuLID face reference:** Test with various photo qualities -- low light, side angle, multiple faces, sunglasses. Bad reference photos produce nightmare results
- [ ] **PWA installation:** Test "Add to Home Screen" on an actual iPad (not just Chrome DevTools). Verify the splash screen, orientation lock, and status bar color work
- [ ] **Service worker:** Test offline behavior. Can the user read a previously generated story offline? Does the app crash or show a graceful offline page?
- [ ] **localStorage persistence:** Generate a story, close the browser completely, reopen. Is the story still there? Now generate 3 stories -- does localStorage exceed its quota?
- [ ] **Safari-specific bugs:** Test all animations and transitions in Safari (iPad). CSS `backdrop-filter` (frosted glass) has Safari-specific rendering bugs. `gap` in flexbox had Safari issues in older versions
- [ ] **Remotion Player:** Test the video preview on iPad Safari. Remotion Player may have touch interaction issues (scrubbing, play/pause) on mobile Safari
- [ ] **Error states:** Disconnect from the internet mid-generation. Does the app show a friendly error, or crash silently? Test Claude API timeout, fal.ai timeout, and fal.ai content block independently
- [ ] **Memory pressure:** Generate a story with 5 high-res images, navigate to the movie page (Remotion Player), then back. Check for memory leaks. iPad Safari is aggressive about killing background tabs

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Remotion bundler in Next.js | MEDIUM | Remove `@remotion/bundler` and `@remotion/renderer` from Next.js deps. Create separate render script or migrate to `@remotion/lambda`. Requires architecture change but no data loss |
| JSON truncation from Claude | LOW | Add `max_tokens: 4096`, check `stop_reason`, implement retry. Pure code change, no architecture impact |
| Zustand hydration errors | LOW | Add `skipHydration: true` to persist config, add useEffect rehydration. 30-minute fix per store |
| Content filter blocking prompts | MEDIUM | Audit and rewrite all prompt templates. Requires testing each combination. May take a full day of prompt engineering |
| Character inconsistency | HIGH | Fundamental limitation. Can mitigate with better prompts and Kontext chaining, but cannot fully solve. May need to switch image generation approach (LoRA fine-tuning, different model) |
| localStorage quota exceeded | MEDIUM | Migrate from base64 storage to URL-only storage. May need IndexedDB for reference photos. Requires touching storage layer and all consumers |
| iPad Safari PWA bugs | MEDIUM | Requires device-specific testing and CSS/JS workarounds. Each Safari bug is a unique snowflake. Budget 2-4 hours per issue |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Remotion bundler in Next.js | Phase 1 (Scaffold) | `npm run build` succeeds. No `@remotion/bundler` in `package.json`. Remotion Player renders on `/movie` page |
| Turbopack vs Webpack config | Phase 1 (Scaffold) | Both `npm run dev` and `npm run build` succeed. Service worker generates correctly. Document which bundler is used for each command |
| Claude JSON truncation | Phase 2 (API Routes) | Generate 20+ stories across all combinations. All return valid JSON. None have `stop_reason: "max_tokens"` |
| Zustand hydration mismatch | Phase 1 (Scaffold) | No hydration warnings in browser console. Persisted state loads correctly after page refresh. SSR renders a loading state, not stale data |
| fal.ai content filter | Phase 2 (API Routes) | Generate images for all 125 hero/world/villain combinations with all 6 styles. Document which combinations fail and refine prompts |
| Character face inconsistency | Phase 2 (API Routes) + Phase 4 (Polish) | Generate 10 stories with the same hero. Visually inspect character consistency across pages. Acceptable = "same character in different poses," not "different character" |
| Image generation latency | Phase 3 (Components) | Total story + image generation time under 20 seconds with parallel requests. Loading screen shows meaningful progress |
| Security (API keys exposed) | Phase 2 (API Routes) | Browser network tab shows NO API keys in request headers or URLs. All AI API calls go through `/api/*` routes |
| COPPA / photo storage | Phase 3 (Components) | Reference photos stored only in localStorage/IndexedDB. No photo data sent to any server except fal.ai during generation. Disclaimer visible in UI |
| iPad Safari PWA | Phase 4 (Polish) | App installed and tested on physical iPad. Splash screen works. Orientation transitions are smooth. No white flash on navigation |
| localStorage limits | Phase 3 (Components) | Generate 5 stories. No quota errors. Storage audit shows only URLs stored for images, not base64 data |

## Sources

- [Remotion: Using @remotion/renderer in Next.js](https://www.remotion.dev/docs/miscellaneous/nextjs) -- Official docs stating bundler limitation
- [Remotion: Code sharing / Player integration](https://www.remotion.dev/docs/player/integration) -- Dual webpack config requirement
- [Remotion Lambda FAQ](https://www.remotion.dev/docs/lambda/faq) -- Cost and cold start information
- [fal.ai Error Reference](https://docs.fal.ai/model-apis/errors) -- All error codes including content_policy_violation
- [fal.ai Queue API](https://docs.fal.ai/model-apis/model-endpoints/queue) -- Timeout and queue management
- [fal.ai Performance Optimization](https://fal.ai/learn/devs/gen-ai-performance-optimization) -- Production performance recommendations
- [FLUX.1 Kontext](https://fal.ai/models/fal-ai/flux-pro/kontext) -- Character consistency via iterative editing
- [PuLID Flux](https://fal.ai/models/fal-ai/flux-pulid) -- Face reference generation
- [Claude Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) -- JSON schema guarantee
- [Claude Handling Stop Reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) -- Detecting truncation
- [Zustand GitHub Discussion #1382](https://github.com/pmndrs/zustand/discussions/1382) -- localStorage persist hydration errors
- [Zustand: Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) -- Official persist middleware docs
- [PWA on iOS Limitations 2025](https://brainhub.eu/library/pwa-on-ios) -- Comprehensive iOS PWA limitations
- [WebKit Storage Policy Updates](https://webkit.org/blog/14403/updates-to-storage-policy/) -- Safari 7-day eviction, PWA exemption
- [MDN Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- Browser storage limits
- [Next.js Turbopack Config](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) -- Turbopack limitations vs webpack
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Turbopack as default bundler
- [Motion Changelog](https://motion.dev/changelog) -- React 19 compatibility fixes
- [COPPA Rule 2025 Update](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/new-coppa-obligations-for-ai-technologies-collecting-data-from-children) -- New AI-specific COPPA obligations
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) -- Official PWA guidance
- [Serwist Getting Started](https://serwist.pages.dev/docs/next/getting-started) -- Service worker setup for Next.js

---
*Pitfalls research for: AI-powered children's bedtime story generator PWA*
*Researched: 2026-02-19*

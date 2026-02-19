# Stack Research

**Domain:** Children's AI Story Generator PWA with AI Illustration and Video Composition
**Researched:** 2026-02-19
**Confidence:** HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.x | Full-stack React framework | Turbopack is now default and stable (5-10x faster HMR). App Router with React Server Components reduces client bundle. Server Actions simplify API-like mutations. `next/font` handles Google Fonts with zero network requests. Official PWA guide means less third-party dependency. The project memory confirms 16.1.6 worked previously. |
| React | 19.x | UI rendering | Ships with Next.js 16. View Transitions API for page animations. React Compiler (stable in Next.js 16) auto-memoizes components -- eliminates manual `useMemo`/`useCallback` for most cases. `useSyncExternalStore` (used by Zustand) is native. |
| TypeScript | 5.x (strict) | Type safety | Next.js 16 includes built-in TS support. Strict mode catches null/undefined bugs that would be painful in a creative app with many optional fields (imageUrl, referenceImageUrl). |
| Tailwind CSS | 4.x | Utility-first styling | CSS-first config via `@theme` directive -- no `tailwind.config.js` needed. Automatic content detection. 5x faster full builds, 100x faster incremental. Uses `@import "tailwindcss"` in globals.css. Works out of the box with Turbopack (built-in CSS support). |

**Confidence: HIGH** -- All verified via official docs and prior project memory.

### AI Services

| Technology | Version/Model | Purpose | Why Recommended |
|------------|---------------|---------|-----------------|
| `@anthropic-ai/sdk` | ^0.76.0 | Story generation | Direct SDK for Claude API. `claude-sonnet-4-5` balances quality/speed/cost for structured JSON story output. Streaming support for progressive UX. Used server-side only in API routes. |
| `@fal-ai/client` | ^1.9.1 | Image generation | Official TypeScript SDK with typed endpoints. Pay-per-use, no subscription. Supports multiple model endpoints through same client. Handles auth via `FAL_KEY` env var. |
| fal.ai `fal-ai/flux/schnell` | FLUX.1 Schnell | Standard illustration (5 art styles) | $0.003/megapixel -- cheapest option, ~$0.003 per 1MP image. Sub-second generation (1-4 inference steps). Excellent for stylized children's book illustrations where photorealism is not needed. 5 images per story = ~$0.015 per story. |
| fal.ai `fal-ai/flux-pulid` | PuLID FLUX | Face-consistent "Evan mode" | Takes `prompt` + `reference_image_url`, preserves facial features across generated images. `id_weight` parameter (0-1) controls face preservation strength. Confirmed working in prior project. ~20 inference steps, slower than Schnell but necessary for face consistency. |

**Confidence: HIGH** -- Anthropic SDK verified on npm. fal.ai models verified via official API docs. PuLID confirmed working in project memory.

#### Image Generation Strategy (IMPORTANT)

Use a **two-model approach**:

1. **Standard mode** (preset heroes, fiction characters): `fal-ai/flux/schnell` -- fast, cheap, good style adherence
2. **Evan mode** (photo reference): `fal-ai/flux-pulid` -- face-consistent, requires reference image URL

**Why NOT Kontext for v1:**
- Kontext [pro] ($0.04/image) is 13x more expensive than Schnell ($0.003/image) for text-to-image
- Kontext's character consistency is designed for iterative editing of an existing image, not generating 5 independent illustrations from text prompts
- Kontext [dev] image-to-image endpoint requires an input image -- not suitable for first illustration
- PuLID is purpose-built for face preservation from a reference photo, which is exactly the "Evan mode" use case
- **Future consideration:** Kontext could improve consistency in a v2 pipeline where page 1's output feeds into page 2-5 generation, but adds latency (sequential vs parallel)

#### Discovered Alternative: FLUX.2

FLUX.2 models are now available on fal.ai (FLUX.2 [dev] at $0.012/MP, FLUX.2 [pro] at $0.03/MP). These offer improved quality over FLUX.1 but at higher cost. For children's book illustrations with style prefixes, FLUX.1 Schnell's speed and cost advantages outweigh FLUX.2's quality improvements. **Flag for re-evaluation if illustration quality is insufficient.**

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | ^5.0.11 | Client state + persistence | Minimal API (single `create()` call). Built-in `persist` middleware writes to localStorage automatically. React 19 compatible (uses native `useSyncExternalStore`). ~1KB bundle. Perfect for: current story data, selected style, picker state, reference image URL. No Redux boilerplate, no context provider wrapping. |

**Why NOT Jotai:** Jotai's atomic model is better for large apps with many independent pieces of state. This app has one main state object (story + preferences). Zustand's single-store + persist middleware is simpler and maps directly to the localStorage requirement.

**Confidence: HIGH** -- Zustand v5 verified on npm, React 19 compatibility confirmed.

### Animation & Gestures

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Motion (motion/react) | ^12.34.x | Page transitions, micro-interactions, swipe gestures | Rebranded from Framer Motion. Same API, active development (12.34.2 released Feb 2026). `AnimatePresence` for page transitions. `drag` prop with `onDragEnd` handles swipe detection -- no separate gesture library needed. `whileTap={{ scale: 0.95 }}` for tactile press feedback. Hardware-accelerated scroll animations. |

**Why NOT a separate swipe library:** Motion's drag API with axis constraints (`drag="x"`) and velocity detection handles iPad swipe navigation natively. Adding `react-swipeable` or `use-gesture` would be redundant.

**Confidence: HIGH** -- Verified via motion.dev changelog. Import path is `motion/react` (not `framer-motion`).

### Video Composition

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| remotion | ^4.0.424 | Video composition framework | Defines video scenes as React components. Ken Burns effects via `interpolate()` + `useCurrentFrame()`. `<Audio>` component for lullaby overlay. |
| @remotion/player | ^4.0.424 | In-browser video preview | Embeds interactive video player in React. Supports `lazyComponent` for dynamic import (critical for bundle size). Scrub, play/pause controls. No server-side rendering needed. |
| @remotion/cli | ^4.0.424 | Remotion Studio (dev only) | `npx remotion studio remotion/index.ts` for composition preview during development. Dev dependency only. |

**v1 Scope: Player preview only.** No server-side rendering, no Lambda, no video export download.

**v2 Scope (future):** `@remotion/lambda` for cloud rendering + video export. `@remotion/renderer` does NOT work inside Next.js (confirmed in project memory -- headless browser + FFmpeg dependencies conflict with serverless).

**Confidence: HIGH** -- Remotion v4.0.424 verified on npm. Player-only approach confirmed as correct for Next.js.

### PWA

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @serwist/turbopack | ^9.5.5 | Service worker generation with Turbopack | Serwist 9 added Turbopack support (backported from v10). Wraps Next.js config with `withSerwist`. Generates service worker with precaching + runtime caching. Successor to abandoned `next-pwa`. |
| serwist | ^9.x | Service worker runtime (dev dep) | Core service worker library. Peer dependency of @serwist/turbopack. |

**Why NOT native Next.js PWA (no library):** Next.js 16 has official PWA guidance for manifest + basic service worker, but it requires manual service worker authoring. Serwist automates precache manifest generation and runtime caching strategies. Worth the dependency for offline support.

**Why NOT @serwist/next:** Use `@serwist/turbopack` instead -- it's the Turbopack-specific module. `@serwist/next` is the webpack variant. Since Next.js 16 defaults to Turbopack, use the Turbopack package.

**Confidence: MEDIUM** -- Serwist Turbopack support is relatively new (backported to v9). May need some configuration debugging. The v9.5.5 npm package exists and is recent.

### Fonts & Typography

| Technology | Approach | Purpose | Notes |
|------------|----------|---------|-------|
| next/font/google | Built-in | Fredoka One (headings), Nunito (body) | Zero external network requests. Self-hosted at build time. Export as CSS variables, apply via Tailwind's `font-family` utilities. `variable` prop generates `--font-fredoka` and `--font-nunito` custom properties. |

**Configuration pattern:**
```typescript
// app/layout.tsx
import { Fredoka, Nunito } from 'next/font/google'

const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', weight: ['400', '700'] })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

// Apply to <html> className: `${fredoka.variable} ${nunito.variable}`
```

Then in globals.css with Tailwind v4:
```css
@theme {
  --font-heading: var(--font-fredoka);
  --font-body: var(--font-nunito);
}
```

**Confidence: HIGH** -- next/font is built into Next.js, well-documented.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | ^2.x | Conditional className composition | When combining Tailwind classes conditionally (active states, variants). Tiny (~200B). |
| tailwind-merge | ^3.x | Merge conflicting Tailwind classes | When component props override base styles. Prevents `p-2 p-4` conflicts. |
| zod | ^3.x | Runtime schema validation | Validate API route inputs (story generation request, image generation request). Validate Claude API JSON output against story schema. |

**Optional (evaluate during build):**

| Library | Purpose | When to Add |
|---------|---------|-------------|
| @tailwindcss/postcss | PostCSS plugin for Tailwind | Required if Turbopack's built-in CSS support has issues with Tailwind v4. Check during scaffold. |
| sharp | Image optimization | Only if we need to resize/compress reference photos before sending to fal.ai. Next.js uses it internally for `next/image`. |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev server bundler | Default in Next.js 16. `next dev` uses it automatically. FS cache persists between restarts. |
| Remotion Studio | Video composition preview | `npx remotion studio remotion/index.ts` -- separate from Next.js dev server. |
| ESLint | Linting | Next.js 16 includes config. Add `@remotion/eslint-plugin` for Remotion-specific rules. |

---

## Installation

```bash
# Create project
npx create-next-app@latest evan-story-studio --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"

# Core dependencies
npm install @anthropic-ai/sdk @fal-ai/client zustand motion remotion @remotion/player @remotion/cli zod clsx tailwind-merge

# PWA (Serwist with Turbopack support)
npm install -D @serwist/turbopack serwist

# Remotion ESLint plugin (dev)
npm install -D @remotion/eslint-plugin
```

**Note:** `next/font/google` is built-in -- no install needed for fonts.
**Note:** `motion` package replaces `framer-motion` -- do NOT install `framer-motion`.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Zustand | Jotai | If state becomes highly granular with many independent atoms (unlikely for this app) |
| Zustand | React Context + useReducer | Never for this project -- no persistence middleware, more boilerplate |
| Motion (motion/react) | react-spring | If you need physics-based spring animations. Motion covers all our needs (drag, layout, presence). |
| Motion drag | @use-gesture/react | If you need multi-touch pinch/zoom. Overkill for single-axis swipe. |
| @serwist/turbopack | Manual service worker | If Serwist causes issues with Turbopack. Fallback: write `/public/sw.js` manually per Next.js official guide. |
| @serwist/turbopack | @ducanh2912/next-pwa | Never -- abandoned, webpack-only, no Turbopack support |
| FLUX.1 Schnell | FLUX.2 [dev] | If illustration quality is noticeably poor with Schnell. 4x more expensive but better detail. |
| FLUX.1 Schnell | FLUX.1 [dev] | If you need better prompt adherence. 10x more expensive, 10x slower. Not worth it for styled illustrations. |
| PuLID | Kontext [pro] i2i | If you already have a reference image AND want to edit it. PuLID is better for "generate new image preserving this face." |
| Remotion Player | HTML5 Canvas animation | Never for this project -- Remotion gives us React component composition, timeline control, and future Lambda export path. |
| Remotion Lambda | @remotion/renderer | Never inside Next.js. Renderer requires headless browser + FFmpeg on the server. Lambda is the correct cloud rendering path. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` (package) | Deprecated package name. Library rebranded to `motion`. Imports from `framer-motion` still work but the `motion` package is canonical. | `motion` package, import from `motion/react` |
| `next-pwa` (@shadowwalker) | Abandoned since 2023. Does not support App Router, Turbopack, or Next.js 15+. | `@serwist/turbopack` |
| `@serwist/next` | Webpack-specific. Next.js 16 defaults to Turbopack. | `@serwist/turbopack` |
| `@remotion/bundler` | Does NOT work inside Next.js API routes. Requires headless Chromium + FFmpeg. | `@remotion/player` for preview, `@remotion/lambda` for future export |
| `@remotion/renderer` | Same FFmpeg/Chromium problem in serverless. | `@remotion/lambda` (v2 scope) |
| IndexedDB (for state) | Overkill for this app's data. Story JSON + preferences fit in localStorage. IndexedDB adds async complexity. | `localStorage` via Zustand persist middleware |
| Redux / Redux Toolkit | Massive overkill. This app has one store with ~5 fields. Redux adds 10x boilerplate for zero benefit. | Zustand |
| styled-components / CSS Modules | Extra runtime (styled-components) or file overhead (modules). Tailwind v4 handles everything including dark mode, animations, responsive. | Tailwind CSS v4 |
| react-swipeable | Redundant. Motion's `drag` prop handles swipe gestures with velocity detection. | `motion/react` drag API |
| DALL-E / Midjourney | DALL-E is slower and more expensive per image. Midjourney has no direct API. fal.ai/Flux is fastest and cheapest for this use case. | fal.ai FLUX models |
| Replicate | Higher latency (cold starts), more complex API. fal.ai has purpose-built fast inference. | `@fal-ai/client` |
| AI SDK (@ai-sdk/anthropic) | Adds abstraction layer over Anthropic SDK. For a single-provider app calling one model, direct SDK is simpler and has better TypeScript types for structured output. | `@anthropic-ai/sdk` directly |

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.1.x | React 19.2.x | Bundled together. React Compiler is stable. |
| Next.js 16.1.x | Tailwind CSS 4.x | Built-in support via Turbopack or PostCSS plugin. |
| Zustand 5.0.x | React 18-19 | Uses native `useSyncExternalStore`. Min React 18. |
| Motion 12.x | React 18-19 | Full React 19 support. Import from `motion/react`. |
| Remotion 4.0.x | React 18-19 | Check Remotion's React version requirement -- may need `as any` cast for Composition component type (2 type args in v4). Confirmed in project memory. |
| @serwist/turbopack 9.5.x | Next.js 15-16 | Turbopack integration. Wraps next.config. |
| @anthropic-ai/sdk 0.76.x | Node.js 18+ | Server-side only. Used in API routes. |
| @fal-ai/client 1.9.x | Node.js + Browser | Can be used client-side or server-side. Server-side recommended (hides API key). |

---

## Cost Estimation (Per Story)

| Service | Usage | Cost |
|---------|-------|------|
| Claude API (claude-sonnet-4-5) | 1 story generation (~2K input + ~2K output tokens) | ~$0.02 |
| fal.ai Schnell (standard mode) | 5 images at 1MP | ~$0.015 |
| fal.ai PuLID (Evan mode) | 5 images at 1MP | ~$0.05-0.10 (higher per-MP cost) |
| **Total per story (standard)** | | **~$0.035** |
| **Total per story (Evan mode)** | | **~$0.07-0.12** |

At ~$0.04-0.12 per story, this is extremely cost-effective for a personal project.

---

## Environment Variables

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...        # Claude API key (server-side only)
FAL_KEY=...                          # fal.ai API key (server-side only)
```

No other env vars needed for v1 (no Lambda, no cloud rendering).

---

## Sources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) -- HIGH confidence
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1) -- HIGH confidence
- [Next.js Installation Guide](https://nextjs.org/docs/app/getting-started/installation) -- HIGH confidence
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) -- HIGH confidence
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) -- HIGH confidence
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) -- HIGH confidence
- [Tailwind + Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) -- HIGH confidence
- [fal.ai FLUX API](https://fal.ai/flux) -- HIGH confidence
- [fal.ai FLUX.1 Schnell Docs](https://fal.ai/models/fal-ai/flux/schnell) -- HIGH confidence
- [fal.ai PuLID Docs](https://fal.ai/models/fal-ai/flux-pulid/api) -- HIGH confidence
- [fal.ai Kontext [pro] Docs](https://fal.ai/models/fal-ai/flux-pro/kontext) -- HIGH confidence
- [fal.ai Pricing](https://fal.ai/pricing) -- HIGH confidence
- [Remotion Brownfield Installation](https://www.remotion.dev/docs/brownfield) -- HIGH confidence
- [Remotion Player Docs](https://www.remotion.dev/docs/player/player) -- HIGH confidence
- [Remotion SSR Comparison](https://www.remotion.dev/docs/compare-ssr) -- HIGH confidence
- [Remotion npm](https://www.npmjs.com/package/remotion) -- v4.0.424 verified
- [Serwist Next.js Docs](https://serwist.pages.dev/docs/next/getting-started) -- MEDIUM confidence
- [@serwist/turbopack npm](https://www.npmjs.com/package/@serwist/turbopack) -- v9.5.5 verified
- [Zustand v5 npm](https://www.npmjs.com/package/zustand) -- v5.0.11 verified
- [Motion Changelog](https://motion.dev/changelog) -- v12.34.2 verified
- [@anthropic-ai/sdk npm](https://www.npmjs.com/package/@anthropic-ai/sdk) -- v0.76.0 verified
- [@fal-ai/client npm](https://www.npmjs.com/package/@fal-ai/client) -- v1.9.1 verified

---

*Stack research for: Evan's Story Studio -- Children's AI Story Generator PWA*
*Researched: 2026-02-19*

# Architecture Patterns

**Domain:** AI-powered children's bedtime story generator PWA (Next.js + Claude + fal.ai + Remotion)
**Researched:** 2026-02-19

## Recommended Architecture

### High-Level System Diagram

```
+-------------------------------------------------------------------+
|                        Next.js App Shell (PWA)                     |
|                                                                    |
|  +------------------+    +------------------+   +----------------+ |
|  |  Character Picker|    |  Story Reader    |   |  Movie Preview | |
|  |  (Client)        |--->|  (Client)        |-->|  (Client)      | |
|  |  - Hero cards    |    |  - Swipe pages   |   |  - Remotion    | |
|  |  - World cards   |    |  - Image display |   |    Player      | |
|  |  - Villain cards |    |  - Text overlay  |   |  - Export CTA  | |
|  |  - Style picker  |    |  - Progress bar  |   |                | |
|  |  - Photo upload  |    |                  |   |                | |
|  +--------+---------+    +--------+---------+   +-------+--------+ |
|           |                       |                      |         |
|  +--------v-----------------------v----------------------v-------+ |
|  |                    Zustand Store (Client-side)                 | |
|  |  - story: StoryJSON | status | style | hero | world | villain | |
|  |  - Persisted to localStorage (text) + IndexedDB (images)      | |
|  +--------+------------------------------------------------------+ |
|           |                                                        |
|  +--------v------------------------------------------------------+ |
|  |                  Next.js API Routes (Server)                   | |
|  |                                                                | |
|  |  POST /api/generate-story    POST /api/generate-image          | |
|  |  - Claude SDK                - fal.ai SDK                      | |
|  |  - Returns StoryJSON         - Returns image URL               | |
|  |  - Single request            - Called per page (x5)            | |
|  |                                                                | |
|  |  POST /api/render-video      GET /api/fal/proxy/*              | |
|  |  - Remotion Lambda trigger   - fal.ai proxy (key protection)   | |
|  |  - Returns job status/URL    - Forwards client requests        | |
|  +----------------------------------------------------------------+ |
+-------------------------------------------------------------------+
          |                    |                    |
          v                    v                    v
   +------------+      +--------------+    +----------------+
   | Claude API |      | fal.ai API   |    | AWS Lambda     |
   | (Anthropic)|      | - flux/schnell|    | (Remotion)     |
   |            |      | - flux-pulid  |    | - S3 storage   |
   +------------+      +--------------+    | - Video render |
                                           +----------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Server/Client |
|-----------|---------------|-------------------|---------------|
| **CharacterPicker** | Hero/World/Villain selection via tactile cards | Zustand store (writes selections) | Client |
| **FictionCharacterModal** | Searchable fiction character picker overlay | CharacterPicker (returns selection) | Client |
| **StylePicker** | Horizontal scrollable art style selector | Zustand store (writes style) | Client |
| **PhotoUploader** | Reference photo capture/upload for "Evan" mode | IndexedDB (writes image), Zustand store (writes reference URL) | Client |
| **StoryReader** | Swipeable full-bleed page container | Zustand store (reads story), navigates to /movie | Client |
| **StoryPage** | Single page: image + text overlay with fallback gradient | StoryReader (receives page data) | Client |
| **LoadingScreen** | Animated book-opening progress display | Zustand store (reads generation status) | Client |
| **ProgressBar** | Generation step indicator (story writing, image 1/5...) | LoadingScreen (receives progress data) | Client |
| **MoviePreview** | Remotion Player embed with export controls | Zustand store (reads story), /api/render-video | Client |
| **StarryBackground** | Animated canvas particle effect | None (purely decorative) | Client |
| **API: generate-story** | Claude API call, returns 5-page StoryJSON | Claude SDK, receives hero/world/villain/style | Server |
| **API: generate-image** | fal.ai call, returns single image URL | fal.ai SDK, receives prompt + optional reference image | Server |
| **API: fal/proxy** | Proxies fal.ai requests to protect API key | fal.ai (forwards requests with auth header) | Server |
| **API: render-video** | Triggers Remotion Lambda render | AWS Lambda, S3 | Server |
| **Zustand Store** | Central client state: story, selections, progress | All client components, localStorage, IndexedDB | Client |

### Data Flow

**Phase 1: Character Selection Flow**

```
User taps Hero card
  --> CharacterPicker dispatches setHero(hero) to Zustand store
  --> If "Evan" selected: PhotoUploader opens
      --> User uploads photo --> stored in IndexedDB
      --> Base64 data URL or blob URL written to store
  --> If "Fiction Character" selected: FictionCharacterModal opens
      --> User picks character --> dispatches setHero(fictionHero)

User taps World card --> dispatches setWorld(world)
User taps Villain card --> dispatches setVillain(villain)
User scrolls Style strip --> dispatches setStyle(style)

"Create My Story!" button enabled when hero + world + villain selected
```

**Phase 2: Story Generation Flow (Critical Path)**

```
User taps "Create My Story!"
  --> LoadingScreen appears with "Writing your story..."
  --> Client calls POST /api/generate-story
      {hero, world, villain, childName, style}
  --> API route calls Claude API with structured system prompt
  --> Claude returns StoryJSON (5 pages with imagePrompts, no imageUrls yet)
  --> StoryJSON saved to Zustand store + localStorage

  --> Progress updates to "Painting page 1 of 5..."
  --> Client begins SEQUENTIAL image generation loop:
      for each page (1-5):
        POST /api/generate-image {prompt: page.imagePrompt, style, referenceImageUrl?}
        --> API route calls fal.ai (flux/schnell or flux-pulid)
        --> Returns {imageUrl}
        --> Zustand store updated: story.pages[i].imageUrl = imageUrl
        --> StoryPage re-renders with image (replaces gradient fallback)
        --> Progress updates to "Painting page N of 5..."

  --> All images complete --> Navigate to /story (StoryReader)
```

**Phase 3: Story Reading Flow**

```
StoryReader mounts
  --> Reads story from Zustand store
  --> Renders 5 StoryPage components in swipeable container
  --> Each StoryPage shows:
      - Full-bleed image (or CSS gradient fallback if generation failed)
      - Text overlay in frosted glass card at bottom
  --> User swipes left/right or taps arrows to navigate
  --> Page dots indicate position
  --> After page 5: "Make Movie" button appears
```

**Phase 4: Video Export Flow**

```
User taps "Make Movie"
  --> Navigate to /movie
  --> MoviePreview mounts
  --> Remotion Player loads via dynamic import (lazyComponent + useCallback)
  --> Player renders StoryVideo composition using story data as inputProps
  --> User can scrub/preview the video

  --> User taps "Export Video"
  --> Client calls POST /api/render-video {story}
  --> API route triggers Remotion Lambda render
  --> Returns {status: "rendering", jobId} or {videoUrl}
  --> Client polls for completion OR receives SSE updates
  --> Download link appears when render completes
```

### State Shape (Zustand Store)

```typescript
interface StoryStudioStore {
  // Selections
  hero: Character | null;
  world: string | null;
  villain: string | null;
  style: StyleKey;           // default: 'watercolor'
  childName: string;         // default: 'Evan'

  // Reference image (Evan mode)
  referenceImageUrl: string | null;

  // Story data
  story: StoryJSON | null;

  // Generation progress
  status: 'idle' | 'generating-story' | 'generating-images' | 'complete' | 'error';
  currentImageIndex: number; // 0-4 during image generation
  error: string | null;

  // Actions
  setHero: (hero: Character) => void;
  setWorld: (world: string) => void;
  setVillain: (villain: string) => void;
  setStyle: (style: StyleKey) => void;
  setStory: (story: StoryJSON) => void;
  setPageImage: (pageIndex: number, imageUrl: string) => void;
  setStatus: (status: Status) => void;
  reset: () => void;
}
```

**Persistence strategy:**
- **localStorage:** Story JSON (text), selections, style preference, child name -- small data, synchronous access is fine
- **IndexedDB:** Reference photo blob (can be several MB, exceeds localStorage 5MB limit) -- use a thin wrapper (idb-keyval or manual) for async blob storage
- **No server database:** All state is client-side only. Stories are ephemeral to the session (persisted locally only).

**Confidence: HIGH** -- Zustand's official Next.js guide explicitly recommends this pattern. localStorage for small text data and IndexedDB for binary blobs is the standard PWA storage architecture.

## Patterns to Follow

### Pattern 1: Server-First, Client-Islands

**What:** Every page and layout in `app/` is a React Server Component by default. Only components that need interactivity (state, effects, event handlers, browser APIs) get `'use client'`.

**When:** Always. This is the foundational Next.js App Router architecture.

**Application to this project:**
- `app/layout.tsx` -- Server Component (renders fonts, metadata, static shell)
- `app/page.tsx` -- Server Component that renders `<CharacterPicker />` (client)
- `app/story/page.tsx` -- Server Component that renders `<StoryReader />` (client)
- `app/movie/page.tsx` -- Server Component that renders `<MoviePreview />` (client)
- All interactive components in `/components/` -- Client Components (`'use client'`)

```typescript
// app/page.tsx -- Server Component (no 'use client')
import { CharacterPicker } from '@/components/CharacterPicker';

export default function HomePage() {
  return (
    <main>
      <CharacterPicker />
    </main>
  );
}

// components/CharacterPicker.tsx -- Client Component
'use client';
import { useStoryStore } from '@/lib/store';
// ... interactive UI with state, gestures, etc.
```

**Confidence: HIGH** -- Official Next.js documentation and architecture guides all recommend this pattern.

### Pattern 2: Sequential Image Generation with Progressive Display

**What:** After story text is generated, images are generated one at a time (not in parallel), with each image appearing in the UI as it completes. This provides visible progress and avoids overwhelming the fal.ai API.

**When:** During the story generation pipeline.

**Why sequential, not parallel:**
1. fal.ai has rate limits -- 5 concurrent requests may hit them
2. Progressive feedback is better UX than "all or nothing" loading
3. If one image fails, you can retry it without blocking others
4. Zustand store updates per-image trigger targeted re-renders

```typescript
// lib/generateStoryImages.ts
export async function generateStoryImages(
  story: StoryJSON,
  setPageImage: (index: number, url: string) => void,
  setStatus: (status: string) => void,
) {
  for (let i = 0; i < story.pages.length; i++) {
    setStatus(`generating-image-${i}`);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: story.pages[i].imagePrompt,
          style: story.style,
          referenceImageUrl: story.hero.referenceImageUrl,
        }),
      });
      const { imageUrl } = await response.json();
      setPageImage(i, imageUrl);
    } catch (error) {
      // Page keeps its CSS gradient fallback -- generation continues
      console.error(`Image ${i} failed:`, error);
    }
  }
  setStatus('complete');
}
```

**Confidence: HIGH** -- This is the standard pattern for multi-step AI generation pipelines. fal.ai's queue/subscribe API explicitly supports this workflow.

### Pattern 3: Remotion Player via Dynamic Import with useCallback

**What:** The Remotion Player is heavy (~200KB+). Load it only on the /movie page using `next/dynamic` with `ssr: false`, and use `lazyComponent` with `useCallback` to avoid re-renders.

**When:** Movie preview page only.

```typescript
// components/MoviePreview.tsx
'use client';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { useStoryStore } from '@/lib/store';

const Player = dynamic(
  () => import('@remotion/player').then(mod => mod.Player),
  { ssr: false }
);

export function MoviePreview() {
  const story = useStoryStore(s => s.story);

  const lazyComponent = useCallback(
    () => import('@/remotion/compositions/StoryVideo'),
    []
  );

  if (!story) return null;

  return (
    <Player
      lazyComponent={lazyComponent}
      inputProps={{ story }}
      durationInFrames={2700}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      controls
      style={{ width: '100%' }}
    />
  );
}
```

**Confidence: HIGH** -- Remotion's official docs explicitly recommend `lazyComponent` + `useCallback` for Player in brownfield apps. Dynamic import with `ssr: false` is the standard Next.js pattern for client-only heavy libraries.

### Pattern 4: fal.ai Proxy Route for API Key Protection

**What:** Never expose `FAL_KEY` to the client. Use `@fal-ai/server-proxy` to create a Next.js API route that forwards requests with the auth header.

**When:** All fal.ai calls from the client (if using client-side fal.subscribe). For this project, since we call fal.ai from server-side API routes, the proxy is optional -- but it's the official recommended pattern and adds flexibility.

```typescript
// app/api/fal/proxy/route.ts
import { route } from '@fal-ai/server-proxy/nextjs';
export const { GET, POST, PUT } = route;
```

**For this project's architecture:** Since all image generation goes through our own `/api/generate-image` server route, the API key stays server-side naturally. The proxy pattern becomes useful if you later want to use fal.ai's client-side `subscribe` with real-time queue updates.

**Confidence: HIGH** -- fal.ai's official Next.js integration docs specify this exact pattern.

### Pattern 5: Error Boundaries with Graceful Degradation

**What:** Each major feature has its own error boundary. Image failures show CSS gradient fallbacks. Story generation failures offer retry. Video render failures don't block story reading.

**When:** Wrap each major section (story generation, image display, video player).

```typescript
// Each StoryPage has built-in fallback
function StoryPage({ page }: { page: Page }) {
  return (
    <div className="relative w-full h-full">
      {page.imageUrl ? (
        <img src={page.imageUrl} alt="" className="object-cover w-full h-full" />
      ) : (
        <div
          className="w-full h-full"
          style={{ background: page.imageFallbackGradient }}
        />
      )}
      <div className="absolute bottom-0 w-full backdrop-blur-md bg-black/40 p-6">
        <p className="text-white text-xl font-nunito">{page.text}</p>
      </div>
    </div>
  );
}
```

**Confidence: HIGH** -- Standard React error handling pattern. The gradient fallback is explicitly designed into the StoryJSON schema.

### Pattern 6: PWA with Serwist (Service Worker Caching)

**What:** Use `@serwist/next` to generate a service worker that precaches the app shell and uses runtime caching for API responses and images.

**When:** Production build only. Service worker registers on app load.

**Key consideration:** Serwist requires Webpack, but Next.js 16 defaults to Turbopack. The dev script must use `--turbopack` for dev but the build will use Webpack by default, which is compatible with Serwist.

**Caching strategy:**
- **App shell (HTML, CSS, JS):** Precache on install
- **Google Fonts:** Cache-first (fonts rarely change)
- **fal.ai image URLs:** Cache-first (generated images are immutable)
- **API routes:** Network-first (always want fresh generation)

**Confidence: MEDIUM** -- Serwist is the documented successor to next-pwa, but Turbopack compatibility edge cases may arise. Build-time Webpack is confirmed compatible.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Shared Global Zustand Store Across Server/Client

**What:** Creating a Zustand store as a module-level singleton and attempting to read it in Server Components.

**Why bad:** Server Components cannot use hooks or context. A module-level store shared between server and client creates hydration mismatches and request-scope leaks in serverless environments.

**Instead:** Create the store in a client-only context. Only Client Components read/write the store. Server Components pass data down as props if needed (not applicable here since all data is client-generated).

**Confidence: HIGH** -- Zustand's official Next.js guide explicitly warns against this.

### Anti-Pattern 2: Using @remotion/bundler in Next.js API Routes

**What:** Attempting to use `@remotion/bundler` (which includes Webpack) inside a Next.js API route.

**Why bad:** Next.js bundles API routes with its own bundler (Webpack or Turbopack). You cannot bundle Webpack-with-Webpack. This will fail at build time or produce cryptic runtime errors.

**Instead:** For server-side video rendering, use `@remotion/lambda` (renders on AWS Lambda from a pre-deployed S3 bundle) or pre-bundle the Remotion project outside the Next.js build pipeline and reference the resulting static bundle from the API route.

**Confidence: HIGH** -- Remotion's official docs explicitly state this limitation: "it includes Webpack, and it's not possible to bundle Webpack with Webpack."

### Anti-Pattern 3: Parallel Image Generation Without Rate Limiting

**What:** Firing all 5 `fal.ai` image generation requests simultaneously via `Promise.all`.

**Why bad:** fal.ai has per-key rate limits. 5 concurrent requests for the same key may trigger throttling or failures. Also provides worse UX -- user sees nothing for 10-15 seconds then everything at once, versus progressive page-by-page reveals.

**Instead:** Sequential generation with per-page progress updates (see Pattern 2 above). If you need speed, use `Promise.all` with a concurrency limiter (max 2 parallel) -- but sequential is simpler and more reliable for 5 images.

### Anti-Pattern 4: Storing Large Images in localStorage

**What:** Converting generated images to base64 and storing them in localStorage for persistence.

**Why bad:** localStorage is limited to 5-10MB total per origin. A single high-resolution image as base64 can be 2-5MB. Five images would exceed the limit. localStorage is also synchronous and blocks the main thread.

**Instead:** Store image URLs (strings) in localStorage. For the reference photo (Evan mode), store the blob in IndexedDB using `idb-keyval` or a thin wrapper. IndexedDB supports gigabytes of storage, handles blobs natively, and is asynchronous.

**Confidence: HIGH** -- Well-documented browser storage limits. MDN and multiple sources confirm 5MB localStorage limit.

### Anti-Pattern 5: Framer Motion AnimatePresence for Route Transitions in App Router

**What:** Wrapping route content in `<AnimatePresence>` and expecting exit animations on route changes.

**Why bad:** Next.js App Router aggressively unmounts route components on navigation. AnimatePresence cannot detect when a route component is removed because the router controls the lifecycle, not React. This leads to components being removed before exit animations can run.

**Instead:** Use Framer Motion for **within-page** animations only (card scale on press, fade-in of elements, swipe gestures on the StoryReader). For route-level transitions, either use the `template.tsx` file convention with a FrozenRouter wrapper, or accept instant route changes (which is fine for this app's UX flow since LoadingScreen provides the transition feeling).

**Confidence: MEDIUM** -- Multiple GitHub issues and community discussions confirm the limitation. The template.tsx workaround exists but adds complexity.

## Scalability Considerations

| Concern | Current (Single User) | At Scale (if ever needed) |
|---------|----------------------|--------------------------|
| **State storage** | localStorage + IndexedDB, no server DB | Add Supabase/Postgres for multi-device sync |
| **Image generation** | Sequential, ~30-60s for 5 images | Parallel with concurrency limiter, or upgrade fal.ai plan |
| **Video rendering** | Remotion Lambda (single render) | Remotion Lambda supports parallel chunk rendering natively |
| **Story generation** | Single Claude API call (~3-5s) | Already fast, no scaling concern |
| **API key management** | .env.local, single user | Add auth (NextAuth) + per-user API key quotas |
| **PWA caching** | Cache generated images locally | Add CDN (Cloudflare R2) for shared image hosting |

This project is designed as a **single-user, single-device tool** (iPad for Evan). The architecture is intentionally simple -- no database, no auth, no multi-user concerns. If those needs arise later, the component boundaries are clean enough to add a persistence layer without rewriting the UI.

## Component Dependency Graph (Build Order)

```
Layer 0 (No dependencies):
  types/story.ts
  lib/styles.ts

Layer 1 (Depends on types):
  lib/claude.ts        --> types/story.ts
  lib/fal.ts           --> types/story.ts
  lib/storage.ts       --> types/story.ts (localStorage/IndexedDB helpers)
  lib/store.ts         --> types/story.ts, lib/storage.ts (Zustand store)

Layer 2 (API routes, depend on lib):
  api/generate-story   --> lib/claude.ts, types/story.ts
  api/generate-image   --> lib/fal.ts
  api/fal/proxy        --> @fal-ai/server-proxy (standalone)
  api/render-video     --> @remotion/lambda (standalone)

Layer 3 (Leaf components, depend on types + store):
  StarryBackground     --> none (pure visual)
  StoryPage            --> types/story.ts (receives props)
  ProgressBar          --> types (receives progress props)
  PhotoUploader        --> lib/storage.ts, lib/store.ts

Layer 4 (Composite components, depend on Layer 3):
  CharacterPicker      --> lib/store.ts, FictionCharacterModal, PhotoUploader, StylePicker
  FictionCharacterModal --> lib/store.ts
  StylePicker          --> lib/store.ts, lib/styles.ts
  StoryReader          --> StoryPage, lib/store.ts
  LoadingScreen        --> ProgressBar, lib/store.ts
  MoviePreview         --> @remotion/player, remotion/compositions/*, lib/store.ts

Layer 5 (Remotion compositions, standalone from Next.js):
  remotion/Root.tsx               --> registers all compositions
  remotion/TitleCard.tsx          --> types/story.ts
  remotion/StoryScene.tsx         --> types/story.ts
  remotion/EndCard.tsx            --> types/story.ts
  remotion/StoryVideo.tsx         --> TitleCard, StoryScene, EndCard

Layer 6 (Pages, compose everything):
  app/page.tsx          --> CharacterPicker, StarryBackground
  app/story/page.tsx    --> StoryReader, LoadingScreen
  app/movie/page.tsx    --> MoviePreview
  app/layout.tsx        --> fonts, metadata, global styles
```

### Suggested Build Order (Based on Dependencies)

This ordering ensures each phase can be tested independently:

1. **Foundation** -- Project scaffold, types, styles definitions, Zustand store
   - Can verify: store creates, types compile, styles export correctly

2. **API Layer** -- Claude story generation route, fal.ai image generation route
   - Can verify: hit API routes directly with curl/Postman, see story JSON and image URLs

3. **Remotion Compositions** -- Build video components in isolation using Remotion Studio
   - Can verify: `npx remotion studio` renders preview with mock data
   - Isolated from Next.js -- avoids bundler conflicts during development

4. **UI Components (Bottom-up)** -- StarryBackground, StoryPage, ProgressBar, then CharacterPicker, StoryReader, LoadingScreen
   - Can verify: render components with mock data, test interactivity

5. **Integration** -- Wire components to store and API routes, generation pipeline
   - Can verify: full flow from selection to story to images

6. **Video Integration** -- MoviePreview with dynamic Remotion Player import
   - Can verify: Player renders with generated story data

7. **PWA + Polish** -- Service worker, manifest, animations, iPad testing
   - Can verify: installable, works offline (cached shell), smooth gestures

## Key Architectural Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Zustand (client-only) | Lightweight, works perfectly with Next.js App Router, no server-state complexity needed |
| Image persistence | URLs in localStorage, blobs in IndexedDB | Respects 5MB localStorage limit, IndexedDB handles binary data asynchronously |
| Image generation order | Sequential (not parallel) | Rate limit safety, progressive UX, simpler error handling |
| Remotion integration | Player via dynamic import (preview), Lambda for render (export) | Bundler can't be used in Next.js routes; Player is client-only; Lambda is the official server render solution |
| fal.ai API key protection | Server-side API routes (not client proxy) | Simpler architecture -- all AI calls go through our API routes where env vars are available |
| Page transitions | Within-page Framer Motion only (no route transitions) | App Router unmount behavior makes route exit animations unreliable; loading screens provide natural transitions |
| PWA tooling | @serwist/next | Active successor to next-pwa, supports App Router, well-documented |
| Component architecture | Server Components for pages, Client Components for interactive UI | Standard Next.js App Router pattern; minimizes client JS bundle |

## Sources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Remotion: Using renderer in Next.js](https://www.remotion.dev/docs/miscellaneous/nextjs)
- [Remotion: Installing in existing project](https://www.remotion.dev/docs/brownfield)
- [Remotion: Player component](https://www.remotion.dev/docs/player/player)
- [Remotion Lambda](https://www.remotion.dev/docs/lambda)
- [fal.ai: Next.js Integration](https://docs.fal.ai/model-apis/integrations/nextjs)
- [fal.ai: PuLID Flux API](https://fal.ai/models/fal-ai/flux-pulid/api)
- [fal.ai: Server-side proxy](https://docs.fal.ai/model-apis/model-endpoints/server-side)
- [Zustand: Next.js Setup Guide](https://zustand.docs.pmnd.rs/guides/nextjs)
- [Serwist: Next.js Getting Started](https://serwist.pages.dev/docs/next/getting-started)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Remotion + Next.js App Dir Template](https://github.com/remotion-dev/template-next-app-dir-tailwind)

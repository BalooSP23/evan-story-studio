# CLAUDE.md — Evan's Story Studio

## Project Identity
**Evan's Story Studio** — A magical bedtime story generator PWA optimized for iPad, with AI illustration and Remotion video export.

---

## Pre-Build Discovery Phase (DO THIS FIRST)

### MCP Server Discovery
Before writing any code, search for and evaluate available MCP servers that could enhance this project:
- **Search for image generation MCP servers** (fal.ai, Replicate, DALL-E, Midjourney proxies)
- **Search for Anthropic/Claude MCP servers** for optimized API interaction
- **Search for file/asset management MCP servers** (S3, Cloudflare R2, local storage)
- **Search for video/media processing MCP servers** (FFmpeg, Remotion, cloud render)
- **Search for PWA-related MCP servers or tooling**
- **Search for any Remotion-specific MCP servers or community packages**

Document all discovered MCP servers in this CLAUDE.md under a `## Available MCP Servers` section with:
- Server name & source
- What it does
- Whether we're using it (and why/why not)

### Skills Discovery
Check `/mnt/skills/` for any skills relevant to this project:
- Frontend design skills
- UI/UX skills
- Any media/image/video generation skills
- Any Next.js or React-specific skills

Read and follow the SKILL.md for each relevant skill found.

### Package & Ecosystem Research
Before scaffolding, search the web for:
- Latest Next.js 14+ best practices (App Router, Server Actions, RSC)
- Latest Remotion version and API changes (v4+)
- Latest `@fal-ai/client` SDK usage and available models
- Best PWA setup for Next.js in 2025/2026 (next-pwa or @serwist/next)
- Best swipe/gesture libraries for React (iPad-optimized)
- Best approach for character face consistency in AI image generation (IP-Adapter, face reference, etc.)

---

## Tech Stack
- **Next.js 14+** (App Router, Server Actions where appropriate)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (check latest config approach)
- **Claude API** (`claude-sonnet-4-5`) — story generation + image prompt engineering
- **fal.ai** (`@fal-ai/client`) — illustration generation (primary: `fal-ai/flux/schnell`, explore better options)
- **Remotion v4+** — video composition and export
- **PWA** — via `@serwist/next` or `next-pwa` (pick whichever is best maintained in 2026)
- **Framer Motion** — page transitions, micro-interactions
- **Zustand or Jotai** — lightweight state management (evaluate which fits better)

---

## Core Features

### 1. Character Picker (Entry Screen)
Three selection categories presented as large, tactile illustrated cards:

**Heroes (pick one):**
- Little Fox 🦊
- Space Knight ⚔️
- Tiny Dragon 🐉
- Brave Robot 🤖
- Ocean Mermaid 🧜‍♀️
- **✨ Real Character Mode** — see section below

**Worlds (pick one):**
- Enchanted Forest 🌳
- Outer Space 🚀
- Underwater Kingdom 🐠
- Candy Mountain 🍭
- Cloud City ☁️

**Villains (pick one):**
- Grumpy Shadow 👤
- Ice Giant 🧊
- Sneaky Goblin 👺
- Thunder Cloud ⛈️
- Dark Wizard 🧙‍♂️

### 2. Real Character Mode (IMPORTANT FEATURE)
Allow the user to pick a hero from TWO additional sources:

#### a) "Evan" as the Hero
- The app should allow uploading a **reference photo of Evan** (stored locally or in IndexedDB)
- When generating image prompts, include a character description derived from the photo
- Use fal.ai models that support **image-to-image** or **IP-Adapter / face reference** to maintain character likeness across all 5 pages
- Research and implement the best available fal.ai model for face-consistent character generation (e.g., `fal-ai/flux/ip-adapter`, `fal-ai/pulid`, or similar)
- Store the reference image persistently so Evan doesn't need to re-upload each time
- UI: A special card in the Hero row with a camera/upload icon — "⭐ Evan!" — that opens a file picker or camera

#### b) Fiction Character Heroes
- Add a "📚 Pick a Character" card that opens a searchable modal
- Hardcode a curated list of **child-friendly fiction characters** (with their franchise noted):
  - Bluey (Bluey)
  - Buzz Lightyear (Toy Story)
  - Elsa (Frozen)
  - Spider-Man (Marvel — Miles Morales kid version)
  - Pikachu (Pokémon)
  - Totoro (My Neighbor Totoro)
  - Stitch (Lilo & Stitch)
  - Moana (Moana)
  - Mario (Super Mario)
  - Ladybug (Miraculous)
- When a fiction character is selected, embed their description into the image prompt for style/character consistency
- Add a **text input** at the bottom of the modal: "Or type any character name..." for free-form entry
- NOTE: Add a visible disclaimer in the UI — "Fan art for personal/private use only"

### 3. Graphic Style Selector (NEW)
After character selection, present a **style picker** as a horizontal scrollable strip of style preview thumbnails:

| Style Key   | Label          | Image Prompt Prefix                                                                                                     |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `watercolor`| 🎨 Watercolor  | "Soft watercolor children's book illustration, warm and magical, whimsical style, no text:"                             |
| `pixar`     | 🎬 3D Cartoon  | "Pixar-style 3D render, soft lighting, vibrant colors, child-friendly, cinematic, no text:"                             |
| `anime`     | 🌸 Anime       | "Studio Ghibli style anime illustration, soft pastel colors, magical atmosphere, child-friendly, no text:"              |
| `comic`     | 💥 Comic Book  | "Children's comic book illustration, bold outlines, bright flat colors, dynamic poses, no text, no speech bubbles:"     |
| `papercut`  | ✂️ Paper Cut   | "Paper cut-out art style illustration, layered paper textures, warm shadows, craft aesthetic, child-friendly, no text:" |
| `chalk`     | 🖍️ Chalk Drawing| "Chalk drawing on dark paper, soft pastel chalks, whimsical children's illustration, warm glow, no text:"              |

- Default selection: `watercolor`
- The selected style prefix is prepended to ALL image prompts for that story
- Store the style preference so it persists across sessions

---

## Aesthetic Direction

### Visual Design
- **Background:** Dark starry night sky (`#0d0d1a`) with subtle animated particles/stars
- **Primary accent:** Warm gold (`#f5c542`)
- **Secondary accent:** Soft purple (`#a78bfa`)
- **Cards/surfaces:** Frosted glass effect (`backdrop-blur`, subtle border glow)
- **Typography:**
  - Headings: **"Fredoka One"** (playful, rounded) — via Google Fonts
  - Body: **"Nunito"** (soft, readable) — via Google Fonts
- **Touch targets:** Minimum 64px, generous padding everywhere
- **Transitions:** Smooth page-turn animations, scale-on-press feedback (0.95 scale on touch)
- **Overall feel:** Like opening a magical storybook at night

---

## Story JSON Schema

```json
{
  "title": "string",
  "hero": {
    "name": "string",
    "description": "string",
    "type": "preset | fiction | custom_evan",
    "referenceImageUrl": "string | null"
  },
  "world": "string",
  "villain": "string",
  "style": "watercolor | pixar | anime | comic | papercut | chalk",
  "pages": [
    {
      "pageNumber": 1,
      "text": "string (2-3 sentences, simple language for age 2-5)",
      "imagePrompt": "string (detailed, style-prefixed, character-consistent)",
      "imageUrl": "string | null (filled after fal.ai generation)",
      "imageFallbackGradient": "string (CSS gradient matching scene mood)"
    }
  ]
}
```

---

## API Routes

### POST /api/generate-story
- Input: `{ hero, world, villain, childName, style }`
- Uses Claude API (`claude-sonnet-4-5`)
- System prompt: "You are a magical bedtime story writer for children aged 2-5. Write gentle, warm, 5-page stories with a kind resolution. Always use simple words. The hero always wins through kindness or cleverness, never violence. Each page should have vivid visual descriptions for illustration. Return ONLY valid JSON matching the exact schema provided."
- User prompt: "Write a bedtime story for a child named {childName}. Hero: {hero.name} ({hero.description}). World: {world}. Villain: {villain}. Art style: {style}. Return JSON with 5 pages. Each imagePrompt must describe the scene in detail, include the hero's appearance consistently, and be prefixed with the art style direction."
- Returns: Story JSON (without imageUrls yet)

### POST /api/generate-image
- Input: `{ prompt, style, referenceImageUrl? }`
- Uses `@fal-ai/client`
- If `referenceImageUrl` is provided (Evan mode), use an IP-Adapter or face-reference capable model
- Otherwise use `fal-ai/flux/schnell` with the style-prefixed prompt
- Returns: `{ imageUrl: string }`

### POST /api/render-video
- Input: `{ story: StoryJSON }`
- Triggers Remotion server-side render (or returns instructions for local render)
- Returns: `{ videoUrl: string }` or `{ status: "rendering", jobId: string }`

---

## Remotion Composition Spec

### StoryVideo (Main Composition)
- **Total duration:** ~90 seconds at 30fps (2700 frames)
- **Resolution:** 1920×1080 (landscape, iPad-optimized)

### Scenes:
1. **TitleCard** (frames 0–90, 3s)
   - "Evan's Story: {title}"
   - Star particle animation background
   - Fade in from black

2. **StoryScene × 5** (each ~15s = 450 frames)
   - Image enters with **Ken Burns effect** (scale 1.0 → 1.08, subtle pan)
   - Text fades up from bottom at frame 60 (2s in)
   - Semi-transparent dark overlay behind text for readability
   - Gentle crossfade transition to next scene (last 60 frames)

3. **EndCard** (last 90 frames, 3s)
   - "The End 🌙"
   - Soft golden glow animation
   - Fade to black

### Audio
- Background: `<Audio src="/lullaby.mp3" />` — user provides their own royalty-free lullaby
- Add a code comment: `// Place your lullaby MP3 at /public/lullaby.mp3`

---

## File Structure

```
/app
  /page.tsx                        → Character picker entry screen
  /story/page.tsx                  → Story reader with swipeable pages
  /movie/page.tsx                  → Remotion preview + export
  /api/generate-story/route.ts     → Claude API story generation
  /api/generate-image/route.ts     → fal.ai image generation
  /api/render-video/route.ts       → Remotion render trigger
  /layout.tsx                      → Root layout (fonts, metadata, starry bg)
  /globals.css                     → Tailwind + custom animations
/components
  /CharacterPicker.tsx             → Hero/World/Villain selection cards
  /FictionCharacterModal.tsx       → Searchable fiction character picker
  /StylePicker.tsx                 → Horizontal scrollable style selector
  /PhotoUploader.tsx               → Evan's photo upload + preview
  /StoryPage.tsx                   → Single page: image + text overlay
  /StoryReader.tsx                 → Swipeable page container
  /MoviePreview.tsx                → Remotion Player embed
  /LoadingScreen.tsx               → Animated book-opening loader
  /StarryBackground.tsx            → Animated particle/star canvas
  /ProgressBar.tsx                 → Story generation progress indicator
/remotion
  /compositions/StoryVideo.tsx     → Main Remotion composition
  /compositions/StoryScene.tsx     → Per-page scene (Ken Burns + text)
  /compositions/TitleCard.tsx      → Opening title card
  /compositions/EndCard.tsx        → Closing card
  /Root.tsx                        → Remotion entry
/types
  /story.ts                        → Story, Page, Character, Style types
/lib
  /claude.ts                       → Claude API helper
  /fal.ts                          → fal.ai helper (with face-ref support)
  /storage.ts                      → localStorage/IndexedDB helpers
  /styles.ts                       → Style definitions and prompt prefixes
/public
  /icons/icon-192.png              → PWA icon placeholder
  /icons/icon-512.png              → PWA icon placeholder
  /lullaby.mp3                     → (user-provided) background music
CLAUDE.md                          → This file
.env.local.example                 → Environment variable template
```

---

## PWA Configuration
- **name:** "Evan's Story Studio"
- **short_name:** "StoryStudio"
- **display:** standalone
- **orientation:** landscape
- **theme_color:** "#0d0d1a"
- **background_color:** "#0d0d1a"
- **icons:** Generate simple placeholder SVG-to-PNG at 192×192 and 512×512 (a moon + book icon)

---

## Environment Variables (.env.local.example)

```
ANTHROPIC_API_KEY=
FAL_KEY=
REMOTION_SERVE_URL=       # Optional — for cloud rendering
```

---

## UX Flow
1. **Picker Screen** → Three rows of big tap cards (Hero / World / Villain) + Style strip at bottom. "✨ Create My Story!" CTA.
2. **Loading Screen** → Animated book opening. Progress: "Writing your story..." → "Painting page 1 of 5..." → etc.
3. **Story Reader** → Full-bleed illustration per page, text overlaid at bottom in frosted glass card. Swipe or tap arrows. Page dots. After page 5: "🎬 Make Movie" button.
4. **Movie Page** → Remotion `<Player>` preview (interactive scrub). "📥 Export Video" button → server render → download link.
5. **Persistent state** → Story saved to localStorage. "📖 New Story" button resets everything.

---

## Error Handling
- **Image generation failure:** Display a beautiful CSS gradient placeholder matching the scene mood (warm sunset for forest, deep blue for ocean, etc.) — the `imageFallbackGradient` field in the story JSON
- **Story generation failure:** Retry once, then show friendly error with "Try Again" button
- **Video render failure:** Show error with option to retry or just enjoy the story
- **Progressive loading:** Show text immediately while images generate one by one

---

## Build Order
Follow this exact sequence. After each section, confirm the project compiles with `npm run dev`:

1. **Project scaffold** — `create-next-app`, install all deps, configure Tailwind, fonts, PWA
2. **CLAUDE.md** — Create this file at project root
3. **Types** — `/types/story.ts`
4. **Lib helpers** — `/lib/styles.ts` → `/lib/claude.ts` → `/lib/fal.ts` → `/lib/storage.ts`
5. **API routes** — generate-story → generate-image → render-video
6. **Remotion compositions** — Root → TitleCard → StoryScene → EndCard → StoryVideo
7. **Components** — StarryBackground → CharacterPicker → FictionCharacterModal → StylePicker → PhotoUploader → StoryPage → StoryReader → LoadingScreen → MoviePreview
8. **Pages** — Entry (/) → Story (/story) → Movie (/movie)
9. **PWA config** — manifest, service worker, icons
10. **Polish** — Animations, transitions, touch feedback, iPad testing

---

## Code Quality Standards
- All components must be typed with TypeScript (no `any`)
- Use Server Components where possible, Client Components only when needed (interactivity)
- All API routes must have proper error handling and input validation
- Tailwind classes only — no inline styles except for dynamic values
- Accessible: proper ARIA labels on interactive elements
- Mobile-first responsive, but optimized for iPad landscape (1024×768 viewport)

---

## Notes for Claude Code
- This CLAUDE.md is your source of truth. Read it fully before starting.
- When uncertain about a package API, search the web for the latest docs.
- Prefer official examples and documentation over assumptions.
- If a fal.ai model doesn't support face reference, document the limitation and implement the best available alternative.
- Test each API route independently before building UI that depends on it.
- Keep bundle size in mind — Remotion is heavy, consider dynamic imports.

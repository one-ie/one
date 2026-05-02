# Motion Animation Plan — Astro + React 19

Crisp tech aesthetic, scroll-aware, accessible. Built for Astro's island model so we ship as little JS as possible.

## Strategy at a glance

Motion handles 90% of the work — reveals, parallax, staggers — via its `whileInView` API and `useScroll` hook. For the heavier scrubbed sequences (pin + scroll-bound progress) we'll use Motion's `useScroll` + `useTransform`, which gives us GSAP-ScrollTrigger-style scrubbing without pulling in a second library. One animation system, one mental model.

Astro stays static by default; animation islands hydrate with `client:visible` so nothing animates before it's needed and nothing blocks first paint.

## Install

```bash
bun install motion
```

That's it. Motion ships ESM and tree-shakes cleanly — unused features don't ship.

## Architecture

Three layers, in order of how often you'll use them:

**Layer 1 — Primitives** (`src/components/motion/`): small React components you drop into `.astro` files. `<Reveal>`, `<Stagger>`, `<Parallax>`, `<ScrollScene>`. Each is its own island.

**Layer 2 — Tokens** (`src/lib/motion.ts`): shared easing, durations, distances. One source of truth so everything feels like the same product.

**Layer 3 — Reduced motion** (`src/lib/motion.ts`): a single `usePrefersReducedMotion` hook every primitive consults. Fades stay, translation/scale/rotation collapse to zero.

## The motion tokens

Crisp tech means short durations, sharp easing, modest distances. Nothing lingers.

```ts
// src/lib/motion.ts
export const ease = {
  out:    [0.22, 1, 0.36, 1],     // default — confident exit
  inOut:  [0.65, 0, 0.35, 1],     // for scrubbed scroll
  spring: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
} as const;

export const duration = {
  fast:  0.32,
  base:  0.48,
  slow:  0.72,
} as const;

export const distance = {
  sm: 12,   // small reveals
  md: 24,   // section reveals
  lg: 48,   // hero
} as const;
```

These four numbers are what make it feel coherent. Resist adding more.

## The four primitives

**`<Reveal>`** — fade + translate up on enter, once. **`<Stagger>`** — parent that staggers children's reveals (lists, grids, feature rows). **`<Parallax>`** — `useScroll` + `useTransform` on `y`, range tied to element viewport progress. Layered depth without library overhead. **`<ScrollScene>`** — pins via sticky positioning, exposes scroll progress (0→1) to children for scrubbed sequences. Useful for hero animations, product reveals, before/after demos.

Each is ~30–60 lines. I'll write them when you say go.

## Reduced-motion handling

A `useMotionConfig()` hook reads `prefers-reduced-motion`. When true, every primitive swaps its variant set:

- `Reveal` → opacity only, no `y`
- `Stagger` → opacity only, stagger preserved (rhythm is fine, motion isn't)
- `Parallax` → returns null transform (element sits still)
- `ScrollScene` → progress still flows, but children should branch on the flag and render static states

This is the "soften" behavior you asked for — the choreography survives, the movement doesn't.

## Astro integration pattern

```astro
---
// src/pages/index.astro
import Reveal from "@/components/motion/Reveal";
import Stagger from "@/components/motion/Stagger";
---

<section>
  <Reveal client:visible>
    <h1>Headline</h1>
  </Reveal>

  <Stagger client:visible>
    <FeatureCard />
    <FeatureCard />
    <FeatureCard />
  </Stagger>
</section>
```

`client:visible` is the key — these islands don't hydrate until they enter the viewport, so initial JS is near zero.

## Performance guardrails

Animate `transform` and `opacity` only, never `top`/`left`/`width`/`height`. Apply `will-change: transform` on parallax layers, never globally. For pinned `ScrollScene` sections, `contain: layout paint` on the wrapper prevents the section from triggering layout work elsewhere on the page. Lazy-load Motion for any below-fold island via dynamic import if you want to squeeze further.

## Build order

1. `motion.ts` — tokens + reduced-motion hook
2. `<Reveal>` — covers most of the site immediately
3. `<Stagger>` — feature lists, pricing tables, footers
4. `<Parallax>` — hero backgrounds, section dividers
5. `<ScrollScene>` — the one or two signature moments

Steps 1–3 give you 80% of the polish. 4–5 are where it earns "elegant."

---

Want me to start writing? I'd build `motion.ts` + `<Reveal>` + `<Stagger>` first as a single working set you can drop in and test.
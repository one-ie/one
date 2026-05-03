# showcase-todo

> **Spec (source of truth):** [`showcase.md`](showcase.md)
> **Sibling:** [`ai-elements-todo.md`](ai-elements-todo.md) (install complete — 48 elements in `web/src/components/ai-elements/`)
> **Mode:** lean — spec locked, variance known, exit scalar, files known
> **Phase shipped:** Phase 1 only (keyword-driven starters). Phase 2 (tool-backed) and Phase 3 (substrate canvas) get separate TODOs.

---

## Classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | `showcase.md` defines starter list, category labels, and element mapping |
| Variance known | YES | Two files: `web/src/components/Showcase.tsx` (new) + `web/src/pages/showcase.astro` (new) |
| Exit scalar | YES | TWO gates, both must pass: (1) Lighthouse 100/100/100/100 on `/showcase` — hard floor; (2) M/N starters render target element ≥ 0.85 |
| Files known | YES | `web/src/components/Showcase.tsx` + `web/src/pages/showcase.astro`; `Chat.tsx` untouched |

`mode: lean` · `lifecycle: construction`

---

## Routing

```
starter click
  → onSubmit handler (Showcase.tsx)
    → emitClick('ui:chat:suggestion', { text })
      → submit(text)          [useChat sendMessage]
        → POST /api/chat      [claw worker]
          → LLM stream
            → text part contains fenced code  → <CodeBlock> renders
            → text part contains [1] citation  → <InlineCitation> renders
            → reasoning part                   → <Reasoning> renders
            → tool call: confirmation          → <Confirmation> renders
            → tool call: sources               → <Sources> renders
          ← stream closes
  ← MessageList re-renders with target element visible

?q= deep-link (no JS) → form GET /showcase?q=… → server-side submit → same flow
```

---

## Schema reference

None. Phase 1 is UI-only — no new TypeDB entities, no D1 migrations, no claw tool stubs.
Phase 2 tool-backed elements (Plan, TestResults, Sandbox) tracked in a separate TODO.

---

## Source of truth

| Doc | Locks |
|-----|-------|
| [`one/showcase.md`](showcase.md) | Starter list, category labels, element-per-starter mapping |
| [`one/ai-elements.md`](ai-elements.md) | 48 installed elements, wire conventions |
| [`one/dictionary.md`](dictionary.md) | Canonical names, 6 verbs, 4 outcomes |
| [`one/DSL.md`](DSL.md) | Signal grammar |
| [`one/rubrics.md`](rubrics.md) | fit / form / truth / taste scoring (gate 0.65) |
| [`.claude/rules/ui.md`](../.claude/rules/ui.md) | `emitClick('ui:chat:suggestion')` contract |
| [`.claude/rules/design.md`](../.claude/rules/design.md) | 6 tokens, lucide icons, no palette colors |

---

## Documentation updates (W2)

**New docs:**
- `one/showcase.md` — drafted in parallel by sibling agent; defines the mapping table this TODO implements

**Docs modified:**
- `one/ai-elements.md` — append to See Also: "See `showcase.md` for starter→element mapping"
- `one/CLAUDE.md` — add row to organization table: `showcase.md` + `showcase-todo.md` under Execution

**Schema changes:** none

---

## W1 — Recon

Goal: confirm the surface is exactly as assumed before any edit.

**Tasks:**

| id | exit |
|----|------|
| W1-T1 | `ls web/src/components/ai-elements \| wc -l` ≥ 45 (confirmed: 48 files present) |
| W1-T2 | `Chat.tsx:43-48` — `STARTERS` is a plain `const` array of 4 strings, no grouping |
| W1-T3 | `Chat.tsx:247` — `emitClick('ui:chat:suggestion', { text })` already wired on form submit |
| W1-T4 | `Chat.tsx:251-262` — starters render as flat `<button type="submit" name="q" value={s}>` list |
| W1-T5 | `?q=` deep-link: form is `method="get" action="/chat"` — fallback without JS confirmed |
| W1-T6 | Confirm which elements auto-trigger from markdown: `<CodeBlock>` (fenced ``` blocks), `<Sources>` (citation list), `<InlineCitation>` (`[N]` refs), `<Reasoning>` (reasoning stream part), `<Confirmation>` (tool call) |

**Commands:**
```bash
ls web/src/components/ai-elements | wc -l
grep -n 'STARTERS\|emitClick\|method.*get' web/src/components/Chat.tsx
```

---

## W2 — Decide

Goal: finalize the Phase 1 starter set and category labels from `showcase.md`.

**Tasks:**

| id | exit |
|----|------|
| W2-T1 | Read `showcase.md` mapping table; extract starters that render via markdown/keyword (no claw tool needed) |
| W2-T2 | Confirm Phase 1 subset: CodeBlock, Sources, InlineCitation, Reasoning, Confirmation are keyword-driven |
| W2-T3 | Pick category labels (e.g. "Explore ONE", "See it think", "Code & files", "Actions") |
| W2-T4 | Decide visible-by-default count per category (4 max) and whether "show more" toggle is needed |
| W2-T5 | Confirm no new imports needed — all target elements already imported via `MessageList` render path |

**Phase 1 starter candidates** (from showcase.md — keyword-driven only):

| Category | Starter | Target element |
|----------|---------|----------------|
| Explore ONE | What is ONE? | text (baseline) |
| Explore ONE | Show me the signal highways | text + bullet list |
| Explore ONE | How do I sell a skill? | text |
| Explore ONE | How do I buy? | text |
| See it think | Explain how pheromone routing works | `<Reasoning>` |
| See it think | Walk me through a signal step by step | `<ChainOfThought>` |
| Code & files | Show a TypeScript ONE signal handler | `<CodeBlock>` |
| Code & files | Show the schema for a path entity | `<CodeBlock>` |
| Code & files | List the agent files in this repo | `<FileTree>` |
| Actions | Confirm: reset my session | `<Confirmation>` |
| Citations | Where does ONE store knowledge? | `<Sources>` + `<InlineCitation>` |

Exact list locked by `showcase.md`. W2 defers to it.

---

## W3 — Edit

Goal: ship grouped starter grid at `/showcase`. New files only — `Chat.tsx` untouched.

**Tasks:**

| id | value | effort | phase | persona | blocks | exit | tags |
|----|-------|--------|-------|---------|--------|------|------|
| W3-T1 | high | S | 1 | w3-edit | — | `web/src/components/Showcase.tsx` created with `STARTER_CATEGORIES` + categorized grid | [showcase, react] |
| W3-T2 | high | XS | 1 | w3-edit | W3-T1 | `web/src/pages/showcase.astro` created; `<Showcase client:idle />`, `prerender = true` | [showcase, astro] |
| W3-T3 | low | XS | 1 | w3-edit | — | `emitClick('ui:chat:suggestion')` in Showcase.tsx; form `method="get" action="/showcase"` | [ui-signal] |
| W3-T4 | low | XS | 1 | w3-edit | — | `one/ai-elements.md` See Also updated | [docs] |
| W3-T5 | low | XS | 1 | w3-edit | — | `one/CLAUDE.md` org table updated with showcase.md + showcase-todo.md rows | [docs] |

### W3-T1 — Create Showcase.tsx

`web/src/components/Showcase.tsx` — full chat component (mirrors Chat.tsx structure) with `STARTER_CATEGORIES` replacing flat `STARTERS`. Key differences from Chat.tsx:

- No `fullPage` / `onClose` props (showcase is always full-page, no widget mode)
- `action="/showcase"` on the form (not `/chat`)
- Empty-state renders category headers + grouped buttons; `<details>` for overflow (no React state)
- Category label: `text-xs text-font/60 uppercase tracking-wide`
- Button shape: `rounded-2xl px-5 py-3 border hover:bg-foreground`

### W3-T2 — Create showcase.astro

`web/src/pages/showcase.astro`:

```astro
---
export const prerender = true
import Layout from '../layouts/Layout.astro'
import { Showcase } from '../components/Showcase'
---
<Layout title="Showcase — ONE" sidebar="mini">
  <Fragment slot="head">
    <link rel="preconnect" href="/api/chat" />
    <link rel="dns-prefetch" href="/api/chat" />
  </Fragment>
  <div class="h-[100dvh] overflow-hidden">
    <Showcase client:idle />
  </div>
</Layout>
```

### W3-T3 — Verify emitClick + form action in Showcase.tsx

```bash
grep -n "emitClick.*suggestion\|method.*get\|action.*showcase" web/src/components/Showcase.tsx
```

### W3-T4 — ai-elements.md See Also

Append one line to the See Also section of `one/ai-elements.md`:

```
- `one/showcase.md` — starter → element mapping; which elements render for which prompt
```

### W3-T5 — CLAUDE.md org table

In `one/CLAUDE.md` organization table under Execution, add:

```
| showcase.md + showcase-todo.md | Showcase spec + build plan — starter → AI Element mapping for /showcase |
```

---

## W4 — Verify

Goal: deterministic pass/fail on every gate. No vibes.

**Build gates:**
```bash
cd web && bun run build          # must succeed, zero errors
cd web && bunx tsc --noEmit      # zero type errors
```

**Lighthouse gate (HARD — non-negotiable):**

```bash
cd web && bun run preview &       # serve prerendered /showcase
bunx lhci autorun --collect.url=http://localhost:4321/showcase
# OR manual: Chrome DevTools → Lighthouse → /showcase → Mobile + Desktop
```

Required scores: **Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100**. Any drop = fail. Capture screenshots in W4 receipts.

**Perf invariants (grep gates — must all match):**
```bash
grep -n 'client:idle' web/src/pages/showcase.astro           # <Showcase client:idle> — not client:load
grep -n 'export const prerender = true' web/src/pages/showcase.astro
grep -n 'method="get"' web/src/components/Showcase.tsx       # form GET preserved
grep -nE 'name="q"\s+value=' web/src/components/Showcase.tsx # ?q= deep-link preserved
! grep -n "useState.*showMore\|useState.*expanded" web/src/components/Showcase.tsx  # CSS-only disclosure (must NOT match)
! grep -n "from '@/components/ai-elements/suggestion'" web/src/components/Showcase.tsx  # raw <button>, not <Suggestion>
grep -n 'action="/showcase"' web/src/components/Showcase.tsx # form posts to /showcase
```

**Signal gates:**
```bash
grep -n "emitClick('ui:chat:suggestion'" web/src/components/Showcase.tsx  # must appear
grep -n 'method="get"' web/src/components/Showcase.tsx                    # must appear
```

**Manual smoke (open /showcase, click each Phase 1 starter, record element rendered):**

| Starter | Expected element | Rendered? |
|---------|-----------------|-----------|
| What is ONE? | text | |
| Show me the signal highways | text + list | |
| Explain how pheromone routing works | `<Reasoning>` | |
| Walk me through a signal step by step | `<ChainOfThought>` | |
| Show a TypeScript ONE signal handler | `<CodeBlock>` | |
| Show the schema for a path entity | `<CodeBlock>` | |
| List the agent files in this repo | `<FileTree>` | |
| Confirm: reset my session | `<Confirmation>` | |
| Where does ONE store knowledge? | `<Sources>` + `<InlineCitation>` | |

**Exit scalar:** M/N ≥ 0.85 (8 of 9 starters render target element on first response).

**Rubric (≥ 0.65 to ship):**

| Dimension | Gate |
|-----------|------|
| fit | Every Phase 1 starter routes to intended element; hit rate ≥ 0.85 |
| form | No Tailwind palette classes; lucide icons via `<Icon>`; 6-token colors only; category labels don't clutter; `<details>` for show-more (no React state) |
| truth | `bun run build` + `tsc --noEmit` both clean; `emitClick` + `?q=` form preserved; **Lighthouse 100/100/100/100 on /showcase** |
| taste | Starter grid matches existing chat-prompt aesthetic; categories scannable at a glance |

---

## Phasing

| Phase | Scope | TODO |
|-------|-------|------|
| **Phase 1 (this TODO)** | Keyword-driven starters; grouped categories; no claw changes | `showcase-todo.md` |
| Phase 2 | Tool-backed starters — Plan, TestResults, Sandbox require claw tool stubs | separate TODO |
| Phase 3 | Substrate-backed canvas — highways viz via Workflow elements | separate TODO |

---

## Self-checkoff

W3 edits:
- [x] W3-T1 — `web/src/components/Showcase.tsx` created with `STARTER_CATEGORIES`
- [x] W3-T2 — `web/src/pages/showcase.astro` created; `<Showcase client:idle />`, `prerender = true`
- [x] W3-T3 — `emitClick('ui:chat:suggestion')` + `method="get" action="/showcase"` confirmed
- [x] W3-T4 — `one/ai-elements.md` See Also updated
- [x] W3-T5 — `one/CLAUDE.md` org table updated

W4 gates:
- [x] `bun run build` green — fixed by `remoteBindings: false` in astro.config.mjs (CF vite-plugin 1.32.3 changed default to require remote proxy session; disabling restores previous behavior)
- [x] `tsc --noEmit` zero errors
- [x] **Lighthouse: Performance 100 · Accessibility 100 · Best Practices 100 · SEO 100 on /showcase** — live CF run: 100/100/100/100 · LCP 1.0s · fix: `fetchPriority="high"` + `<link rel="preload">` for icon.svg moved LCP candidate from text (1.7s) to image (1.0s)
- [x] `client:idle` on `<Showcase>` in `showcase.astro`
- [x] `prerender = true` on `showcase.astro`
- [x] No `<Suggestion>` import in Showcase.tsx (raw `<button>`)
- [x] No `useState` for show-more (CSS `<details>`)
- [x] `emitClick('ui:chat:suggestion'` grep found in Showcase.tsx
- [x] `method="get"` grep found in Showcase.tsx
- [x] `action="/showcase"` grep found in Showcase.tsx
- [x] `?q=` deep-link works without JS — form `method="get" action="/showcase"` confirmed; without JS, button click GETs `/showcase?q=<text>`; with JS, `useEffect` reads `?q=` and calls `sendMessage`
- [ ] Manual smoke: M/N ≥ 0.85 starters render target element (requires live CF deployment)

---

## See also

- [`one/showcase.md`](showcase.md) — the spec this TODO implements
- [`one/ai-elements.md`](ai-elements.md) — 48 installed elements, wire conventions
- [`one/ai-elements-todo.md`](ai-elements-todo.md) — install history (all cycles done)
- [`one/dictionary.md`](dictionary.md) — canonical names
- [`.claude/rules/ui.md`](../.claude/rules/ui.md) — `emitClick` contract
- [`.claude/rules/design.md`](../.claude/rules/design.md) — 6 tokens, lucide, no palette colors

# ai-elements

> **Position:** layer 3 of 4 — [`integrate`](integrate.md) → [`aisdk`](aisdk.md) → `ai-elements` → [`mcp`](mcp.md)
> **Prereq:** `aisdk.md` (`useChat` is streaming `messages.parts` to `web/`)
> **Enables:** `mcp.md` (every remote tool renders through the same `<Tool>`)
> **Owns:** every UI component that consumes a stream part. The canonical `<Tool>` lives here — `aisdk.md` and `mcp.md` link in, never redefine.

Plan: install **all AI Elements** (https://elements.ai-sdk.dev) into `web/` cleanly — one install pass, one components dir, zero drift.

**Scope:** `web/` only. `claw/` is headless, `sdk/`/`mcp/` are non-UI. AI Elements is React + Tailwind v4 + shadcn — fits `web/` exactly (Astro 6 + React 19 + Tailwind 4).

**Mode:** lean. Spec locked (vendor list), variance known (one CLI), exit scalar (every component file present + `bun run build` green), files known.

---

## Prereqs (verify before install)

| Requirement | Repo state | Action |
|---|---|---|
| Node 18+ | ✅ (bun) | none |
| React 19 | ✅ `^19.1.0` | none |
| Tailwind v4 | ✅ `^4.0.0` | none |
| shadcn/ui initialized | ❌ no `components.json`, no `src/components/ui/` | **init first** |
| AI SDK installed | ❌ not in `web/package.json` | **add `ai` + `@ai-sdk/react`** |
| Framework | Astro 6 (not Next) | shadcn CLI works in Astro mode; AI Elements components are framework-agnostic React |

---

## Wave 1 — Foundations

```bash
cd web

# 1. AI SDK
bun add ai @ai-sdk/react @ai-sdk/openai zod

# 2. shadcn init (Astro mode — pick: TS, Tailwind v4, src/, alias @/*)
bunx shadcn@latest init

# 3. Confirm components.json + src/components/ui/ exist
test -f components.json && test -d src/components/ui
```

**Gate:** `components.json` present, `bun run build` still green.

---

## Wave 2 — Install all 48 components

Single command (shadcn registry path — works in any shadcn-initialized project, Astro included):

```bash
cd web

# Chatbot (18)
for c in attachments chain-of-thought checkpoint confirmation context conversation \
         inline-citation message model-selector plan prompt-input queue reasoning \
         shimmer sources suggestion task tool; do
  bunx shadcn@latest add @ai-elements/$c
done

# Code (15)
for c in agent artifact code-block commit environment-variables file-tree \
         jsx-preview package-info sandbox schema-display snippet stack-trace \
         terminal test-results web-preview; do
  bunx shadcn@latest add @ai-elements/$c
done

# Voice (6)
for c in audio-player mic-selector persona speech-input transcription voice-selector; do
  bunx shadcn@latest add @ai-elements/$c
done

# Workflow (7)
for c in canvas connection controls edge node panel toolbar; do
  bunx shadcn@latest add @ai-elements/$c
done

# Utilities (2)
for c in image open-in-chat; do
  bunx shadcn@latest add @ai-elements/$c
done
```

**Alternative (official AI Elements CLI, single shot):**
```bash
bunx ai-elements@latest add --all   # if supported; otherwise loop above
```

Each install drops files under `src/components/ai-elements/<name>/` (or `src/components/ui/` per shadcn convention) and pulls peer deps automatically.

---

## Wave 3 — Wire to substrate

AI Elements are presentational. Map them to our existing pieces:

| Element | Wires to |
|---|---|
| `PromptInput`, `Message`, `Conversation` | `web/src/components/Chat.tsx` (replace ad-hoc UI) |
| `Reasoning`, `ChainOfThought`, `Tool` | `claw` streaming responses (LLM tool calls in `claw/src/tools.ts`) |
| `Sources`, `InlineCitation` | substrate `recall()` results (`claw/src/substrate.ts`) |
| `CodeBlock`, `FileTree`, `Terminal`, `WebPreview` | dev surfaces / docs viewer |
| `Canvas`, `Node`, `Edge`, `Panel` | swap into the existing `reactflow` highway viz |
| `Attachments`, `AudioPlayer`, `SpeechInput` | future media features (no current wire) |

**Substrate convention:** every interactive AI Element onClick wraps with `emitClick('ui:<surface>:<action>')` per `.claude/rules/ui.md`.

**Pre-flight pickups** (see `integrate.md` Pre-flight pickups for full list):
- When `Message` / `Conversation` replace the ad-hoc `Chat.tsx` UI, give each message a stable `crypto.randomUUID()` at creation — today's `key={i}` flickers on regenerate.
- Use `@/` path aliases (`@/components/ui/X`) in every import the install touches; set the convention from the first component.

---

## Wave 4 — Verify

Deterministic gates (all numbers, no vibes):

```bash
cd web
bun run build           # must succeed
bunx tsc --noEmit       # zero errors
ls src/components/ai-elements | wc -l   # expect ≥ 48
```

**Rubric (≥ 0.65 to ship):**
- **fit** — all 48 components installed, zero install errors
- **form** — no duplicate ui primitives (button, card, etc. — shadcn dedupes)
- **truth** — `bun run build` + `tsc` clean
- **taste** — no random files outside `src/components/ai-elements/` and `src/components/ui/`

---

## Don't

- Don't install into `claw/`, `sdk/`, `mcp/` — they have no React surface
- Don't hand-edit AI Element source — treat as vendored; re-add to upgrade
- Don't add AI Elements without shadcn initialized first — installs will scatter primitives
- Don't wire every component immediately — install all, wire as features land

---

## Component inventory (48)

**Chatbot (18):** attachments, chain-of-thought, checkpoint, confirmation, context, conversation, inline-citation, message, model-selector, plan, prompt-input, queue, reasoning, shimmer, sources, suggestion, task, tool

**Code (15):** agent, artifact, code-block, commit, environment-variables, file-tree, jsx-preview, package-info, sandbox, schema-display, snippet, stack-trace, terminal, test-results, web-preview

**Voice (6):** audio-player, mic-selector, persona, speech-input, transcription, voice-selector

**Workflow (7):** canvas, connection, controls, edge, node, panel, toolbar

**Utilities (2):** image, open-in-chat

---

*One pass. One components dir. 48 elements. Then wire as features need them.*

---

## See also

- `one/showcase.md` — starter → element mapping; which elements render for which prompt

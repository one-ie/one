# ai-elements-todo

> **Spec (source of truth):** [`ai-elements.md`](ai-elements.md)
> **Position:** layer 3 of 4 — `integrate` → `aisdk` → **`ai-elements`** → `mcp`
> **Mode:** lean — single install pass, 48 components, exit scalar (file count + build green)
> **Sequenced:** depends on `aisdk-todo.md` (`useChat` is streaming `messages.parts`); ships before `layout-todo.md`

The spec is canonical. Don't duplicate — read `ai-elements.md`.

---

## Routing

```
W1 recon  →  W2 decide  →  W3 install  →  W4 verify
prereq    component       loop installs  build + tsc + count
state     overlap check   + wire Chat
```

---

## Source of truth

- `one/ai-elements.md` — the spec (Wave 1 prereqs, Wave 2 install, Wave 3 wire, Wave 4 verify)
- `one/aisdk.md` — what `useChat` produces; what `<Tool>` renders
- `.claude/rules/ui.md` — `emitClick('ui:<surface>:<action>')` on every onClick
- `.claude/rules/design.md` — 6 tokens; AI Elements components must use them, not Tailwind palette

---

## Cycles

### Cycle 1 — Foundations

Goal: shadcn initialized, AI SDK already there from `aisdk-todo.md`, `components.json` + `src/components/ui/` exist (without scattering primitives).

**Tasks:**

| id | tags | exit | blocks |
|----|------|------|--------|
| C1-T1 | [shadcn, web] | `bunx shadcn@latest init` runs; `components.json` present; alias `@/*` set | C1-T2 |
| C1-T2 | [verify] | existing `src/components/ui/{Icon,IconBadge}.tsx` not clobbered; design tokens preserved | C2 |

#### Status

- [x] **W1 recon** — read `web/components.json` (if exists), `web/src/components/ui/`, `web/tsconfig.json`, `web/astro.config.*`
- [x] **W2 decide** — confirm Astro mode + TS + Tailwind v4 + `src/` + `@/*` answers; verify shadcn init won't overwrite `Icon.tsx` / `IconBadge.tsx`
- [x] **W3 edit** — run `bunx shadcn@latest init` in `web/`; commit `components.json`
- [x] **W4 verify** — `bun run build` green; existing components untouched; rubric ≥ 0.65

### Cycle 2 — Install all 48 components

Goal: every component file present under `src/components/ai-elements/`,
no duplicate ui primitives, build still green.

**Categories** (from spec §Component inventory):

| group | count | bucket |
|-------|------:|--------|
| Chatbot | 18 | attachments, chain-of-thought, checkpoint, confirmation, context, conversation, inline-citation, message, model-selector, plan, prompt-input, queue, reasoning, shimmer, sources, suggestion, task, tool |
| Code | 15 | agent, artifact, code-block, commit, environment-variables, file-tree, jsx-preview, package-info, sandbox, schema-display, snippet, stack-trace, terminal, test-results, web-preview |
| Voice | 6 | audio-player, mic-selector, persona, speech-input, transcription, voice-selector |
| Workflow | 7 | canvas, connection, controls, edge, node, panel, toolbar |
| Utilities | 2 | image, open-in-chat |
| **Total** | **48** | |

**Tasks:**

| id | tags | exit | blocks |
|----|------|------|--------|
| C2-T1 | [install, chatbot] | 18 chatbot components installed | C2-T6 |
| C2-T2 | [install, code] | 15 code components installed | C2-T6 |
| C2-T3 | [install, voice] | 6 voice components installed | C2-T6 |
| C2-T4 | [install, workflow] | 7 workflow components installed | C2-T6 |
| C2-T5 | [install, utilities] | 2 utility components installed | C2-T6 |
| C2-T6 | [verify] | `ls src/components/ai-elements \| wc -l` ≥ 48; `bun run build` green | C3 |

Try `bunx ai-elements@latest add --all` first; fall back to per-bucket loop from spec Wave 2.

#### Status

- [x] **W1 recon** — verify shadcn init from C1 stuck; check no AI Elements already present
- [x] **W2 decide** — choose `--all` vs loop based on availability; confirm install path won't dump into `ui/`
- [x] **W3 edit** — run install (single agent — this is one CLI, not parallel-friendly)
- [x] **W4 verify** — count files, run build + tsc; rubric ≥ 0.65

### Cycle 3 — Wire core components to substrate

Goal: replace ad-hoc UI in `Chat.tsx` with `Conversation` + `Message` + `PromptInput`; render tool calls with `<Tool>`; wire `Reasoning` for streaming reasoning tokens; substrate convention (`emitClick`) on every interactive control.

**Tasks** (from spec §Wave 3 — wire as features land, not all at once):

| id | tags | exit | blocks |
|----|------|------|--------|
| C3-T1 | [wire, chat] | `Chat.tsx` uses `<Conversation>` + `<Message>` + `<PromptInput>`; stable `crypto.randomUUID()` keys (the pre-flight pickup from spec) | C3-T2 |
| C3-T2 | [wire, tool] | `tool-{name}` parts render via ai-elements `<Tool>` — replaces raw JSON | C3-T3 |
| C3-T3 | [wire, reasoning] | `<Reasoning>` + `<ChainOfThought>` consume `reasoning` parts from agent stream | C3-T4 |
| C3-T4 | [wire, sources] | `<Sources>` + `<InlineCitation>` consume `recall` tool output | done |

Defer (per spec §Don't — "wire as features need them"): `Attachments`, `AudioPlayer`, `SpeechInput`, `Canvas`/`Node`/`Edge` (until ReactFlow viz lands).

#### Status

- [x] **W1 recon** — read `Chat.tsx` (post-aisdk migration), inventory which parts arrive in stream
- [x] **W2 decide** — diff specs per task; preserve `emitClick` on every onClick
- [x] **W3 edit** — parallel edits
- [x] **W4 verify** — `bun run build`; visual smoke (open `/chat`, send a message, see `<Message>` render); rubric ≥ 0.65

---

## Verify checklist (final ship gate)

Per `ai-elements.md` Wave 4:

```bash
cd web
bun run build           # must succeed
bunx tsc --noEmit       # zero errors
ls src/components/ai-elements | wc -l   # expect ≥ 48
```

**Rubric:** fit (48 installed, zero errors) · form (no duplicate primitives) · truth (build/tsc clean) · taste (no random files outside `ai-elements/` and `ui/`).

---

## See also

- `one/ai-elements.md` — spec
- `one/aisdk-todo.md` — predecessor (must ship first)
- `one/layout-todo.md` — successor (mounts `<Chat />` in 4 modes)
- `.claude/rules/design.md` — token enforcement (AI Element components must comply)
- `.claude/rules/ui.md` — `emitClick` convention

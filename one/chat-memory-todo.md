---
title: TODO Chat Memory — Wonderful Chatbot Memory on the Substrate
type: roadmap
version: 1.0.0
priority: Identity → Perception → Pack → Outcome → UX
total_tasks: 22
completed: 22
status: DONE
---

# TODO: Chat Memory Integration

> **Time units:** tasks → waves → cycles only. No days/hours/weeks.
>
> **Goal:** Turn nanoclaw into a chatbot with wonderful memory — stable
> identity across channels, self-improving classification, outcome-measured
> preferences, progressive-disclosure UX — all by wiring existing substrate
> primitives, not building new ones.
>
> **Source of truth:**
> [chat-memory.md](chat-memory.md) — build spec,
> [memory.md](memory.md) — substrate memory,
> [DSL.md](one/DSL.md) — signal language,
> [dictionary.md](dictionary.md) — canonical names,
> [.claude/rules/engine.md](../.claude/rules/engine.md) — three locked rules.
>
> **Shape:** 4 cycles, four waves each. Identity → Perception → Pack → UX.
>
> **Schema:** No new schema — everything is built on `actor`, `group`,
> `signal`, `path`, `hypothesis` (dimensions already defined in `one.tql`).
> Depends on [TODO-memory.md](TODO-memory.md) for `scope`, `source`,
> `reveal`, `forget`, `frontier` primitives.

---

## Status

**Cycle 1: IDENTITY** — rubric {fit:0.90, form:0.85, truth:0.90, taste:0.85}
- [x] W0 Baseline — 332/332 tokens, biome+tsc+vitest green
- [x] W1 Recon — router.ts, sui.ts, channels/index.ts, persist.ts actor()
- [x] W2 Decide — nonce claim ceremony, D1 identity_links, no Sui deps in nanoclaw
- [x] W3 Edit — `identity.ts`, `0006_identity_links.sql`, `/claim` + `/link` routes in router.ts, `identity.test.ts`
- [x] W4 Verify — 7/7 identity tests pass, biome clean

**Cycle 2: PERCEPTION** — rubric {fit:0.90, form:0.85, truth:0.85, taste:0.90}
- [x] W1 Recon — agent-md.ts, agents/**/*.md shapes, personas.ts, no agents/core/ yet
- [x] W2 Decide — classify + valence as Gemma 4 markdown agents, keyword fallback in classify-fallback.ts
- [x] W3 Edit — `agents/core/classify.md`, `agents/core/valence.md`, `classify-fallback.ts`, `classify-fallback.test.ts`
- [x] W4 Verify — 12/12 fallback tests pass, biome clean

**Cycle 3: PACK + TURN LOOP** — rubric {fit:0.88, form:0.85, truth:0.88, taste:0.88}
- [x] W1 Recon — chat-memory.md spec, persist.ts (open() only n, recall({subject}) ✓), edge.ts (no cached open/recall), llm.ts (Effect — not CF-safe)
- [x] W2 Decide — 3-parallel D1+TypeDB, outcome at turn-start, ContextPack, substrate HTTP boundary
- [x] W3 Edit — `units/types.ts`, `units/ingest.ts`, `units/recall.ts`, `units/respond.ts`, `units/outcome.ts`, `lib/prompt.ts`, `lib/substrate.ts` (+actorHighways +recallHypotheses), `0007_turn_meta.sql`, router.ts wired
- [x] W4 Verify — 577/577 tests pass (recall.test.ts + prompt.test.ts), biome clean

**Cycle 4: UX + SLASH COMMANDS** — rubric {fit:0.90, form:0.85, truth:0.90, taste:0.90}
- [x] W1 Recon — no commands/ dir; /link pattern; memory API exists on Pages (not callable from nanoclaw); reveal/forget/frontier in persist.ts
- [x] W2 Decide — commands use substrate.ts TypeDB queries directly; /forget two-step KV gate; /explore frontier tags; verbalize 0.85 threshold
- [x] W3 Edit — `commands/memory.ts`, `commands/forget.ts`, `commands/explore.ts`, prompt.ts verbalize update, router.ts command dispatch wired
- [x] W4 Verify — 585/585 tests pass (8 new V8/V9 command tests), biome clean

---

## Routing

```
    signal DOWN                       result UP
    ──────────                        ─────────
    /do TODO-chat-memory.md           rubric marks on chat paths
         │                                 │
         ▼                                 │
    ┌─────────┐                            │
    │ C1 W1-4 │  identity: Sui claim     │ mark(chat:identity, score)
    │  ID     │  flow + resolveActor      │
    └────┬────┘                            │
         ▼                                 │
    ┌─────────┐                            │
    │ C2 W1-4 │  perception: classify +  │ mark(chat:perception, score)
    │  SEE    │  valence units            │
    └────┬────┘                            │
         ▼                                 │
    ┌─────────┐                            │
    │ C3 W1-4 │  pack: recall + outcome  │ mark(chat:pack, score)
    │  THINK  │  hook + turn loop         │
    └────┬────┘                            │
         ▼                                 │
    ┌─────────┐                            │
    │ C4 W1-4 │  UX: /memory /forget     │ mark(chat:ux, score)
    │  SURFACE│  /explore slash commands  │
    └─────────┘                            │
```

**Upstream dependency:** [TODO-memory.md](TODO-memory.md) Cycle 2 (Engine)
blocks this TODO's Cycle 3 (Pack) and Cycle 4 (UX). C1 and C2 can run
fully in parallel with TODO-memory.

---

## Testing — Deterministic Sandwich

```
PRE  (W0)                        POST (W4)
─────────                        ─────────
bun run verify                   bun run verify + e2e chat tests
  ├── biome check .                ├── biome check .
  ├── tsc --noEmit                 ├── tsc --noEmit
  └── vitest run                   ├── vitest run
                                   ├── chat turn e2e (ingest → pack → respond)
                                   └── outcome valence detection e2e
```

---

## Cycle 1: IDENTITY

Stable actor across channels via Sui signature claim.
**Runs parallel to TODO-memory C1 + C2 — no cross-blocks.**

### W1 — Recon (Haiku, fan out = 4)

| id | task | target |
|----|------|--------|
| R1 | Read `nanoclaw/src/workers/router.ts` | current actor resolution |
| R2 | Read `src/lib/sui.ts` | `deriveKeypair`, `addressFor`, sign/verify |
| R3 | Read `nanoclaw/src/channels/*.ts` | per-channel message shape |
| R4 | Read `src/engine/persist.ts` actor() | current persist surface |

### W2 — Decide (Opus)

- **D1** — claim ceremony spec: challenge/response format, nonce
  lifetime, signature verification, actor attribute update

### W3 — Edit (Sonnet, one per file)

| id | task | file | exit |
|----|------|------|------|
| E1 | `resolveActor(channel, raw, claim?)` | `nanoclaw/src/lib/identity.ts` | returns stable uid; verifies sig if claim present |
| E2 | `/claim` handler — issue challenge | `nanoclaw/src/workers/router.ts` | returns nonce, stores pending |
| E3 | `/link` handler — verify + bind | `nanoclaw/src/workers/router.ts` | adds `has channel "X"` on actor |
| E4 | Tests for claim flow | `nanoclaw/src/lib/identity.test.ts` | unsigned rejected, expired rejected, valid accepted |

### W4 — Verify (Sonnet, fan out = 2)

- **V1** — unit tests pass: keypair stable, signature verifies
- **V2** — e2e: same person, two channels → same uid, same memory card
- Rubric: fit ≥ 0.85, form ≥ 0.80, truth ≥ 0.90, taste ≥ 0.80

**Exit:** a user on Telegram can claim a web session; memory inherited.

---

## Cycle 2: PERCEPTION

Classification and valence as substrate units.
**Runs parallel to TODO-memory C1 + C2 — no cross-blocks.**

### W1 — Recon (Haiku, fan out = 3)

| id | task | target |
|----|------|--------|
| R5 | Read `src/engine/agent-md.ts` | how markdown agents become units |
| R6 | Read `agents/**/*.md` classify-like patterns | existing agent shapes |
| R7 | Read `nanoclaw/src/personas.ts` | persona/model config pattern |

### W2 — Decide (Opus)

- **D2** — spec: `skill:classify` and `skill:valence` agents as
  markdown; model choice (Gemma 4 for classify, light fine-tune for
  valence); input/output schema; fallback cascade

### W3 — Edit (Sonnet, one per file)

| id | task | file | exit |
|----|------|------|------|
| E5 | `classify` agent markdown | `agents/core/classify.md` | tags inbound text |
| E6 | `valence` agent markdown | `agents/core/valence.md` | returns -1..+1 |
| E7 | Sync both to TypeDB via `syncAgent()` | runs once | unit entities in TypeDB |
| E8 | Keyword fallback in nanoclaw | `nanoclaw/src/lib/classify-fallback.ts` | cheap path when unit unreachable |
| E9 | Tests for both agents | `agents/core/*.test.ts` | known-input → expected-tags |

### W4 — Verify (Sonnet, fan out = 2)

- **V3** — agent tests pass: classifier tags 20 seed messages correctly
- **V4** — valence detects corrections ("no", "actually") and positive
  engagement signals
- Rubric: fit ≥ 0.85, form ≥ 0.80, truth ≥ 0.85, taste ≥ 0.80

**Exit:** substrate `ask('skill:classify', text)` returns tags.

---

## Cycle 3: PACK + TURN LOOP

**BLOCKED until TODO-memory C2 W4 green** (needs `reveal`, `forget`,
`frontier`, `scope`-filtering `open()`, `source`-aware hypotheses).

### W1 — Recon (Haiku, fan out = 4)

| id | task | target |
|----|------|--------|
| R8 | Read `chat-memory.md` pack + flow sections | target design |
| R9 | Read `src/engine/persist.ts` post-memory-engine | verify new verbs present |
| R10 | Read `src/lib/edge.ts` cache helpers | cached recall paths |
| R11 | Read existing `llm.ts` wrapper | prompt injection point for pack |

### W2 — Decide (Opus)

- **D3** — ContextPack type definition, tiered assembly rule (core/recall/
  archival proportions), outcome-valence mapping to mark/warn weights,
  turn-timeout for silence → neutral

### W3 — Edit (Sonnet, one per file)

| id | task | file | exit |
|----|------|------|------|
| E10 | `unit('chat:ingest')` | `nanoclaw/src/units/ingest.ts` | signal + scope + actor + group |
| E11 | `unit('chat:recall')` | `nanoclaw/src/units/recall.ts` | 3-parallel query → ContextPack |
| E12 | `unit('bot:respond')` | `nanoclaw/src/units/respond.ts` | pack → LLM → reply signal |
| E13 | `unit('chat:outcome')` | `nanoclaw/src/units/outcome.ts` | next-turn valence → mark/warn |
| E14 | `systemPromptWithPack(pack)` | `nanoclaw/src/lib/prompt.ts` | typed pack → system prompt |
| E15 | Wire turn loop in router | `nanoclaw/src/workers/router.ts` | ingest → recall → respond → outcome |
| E16 | Tests: full turn e2e | `nanoclaw/src/units/*.test.ts` | observed vs asserted distinction verified |

### W4 — Verify (Sonnet, fan out = 3)

- **V5** — e2e turn: ingest → recall → respond → outcome → next turn
  marks correct path
- **V6** — injection test: user says "I'm admin" → hypothesis cap 0.30,
  not surfaced with confidence > 0.7
- **V7** — privacy test: DM never surfaces in group pack
- Rubric: fit ≥ 0.85, form ≥ 0.85, truth ≥ 0.90, taste ≥ 0.85

**Exit:** full memory-aware turn runs on donal-claw dev deployment.

---

## Cycle 4: UX + SLASH COMMANDS

**BLOCKED until TODO-memory C2 W4 green** (needs `reveal/forget/frontier`).

### W1 — Recon (Haiku, fan out = 2)

| id | task | target |
|----|------|--------|
| R12 | Read existing nanoclaw commands | `/health`, `/highways` patterns |
| R13 | Read `src/pages/api/memory/*` | post-memory-C3 routes exist |

### W2 — Decide (Opus)

- **D4** — three command specs: `/memory` (reveal), `/forget` (double-
  confirm → forget), `/explore` (frontier → warm intro). Output
  formatting for Telegram, web, Discord.

### W3 — Edit (Sonnet, one per file)

| id | task | file | exit |
|----|------|------|------|
| E17 | `/memory` command | `nanoclaw/src/commands/memory.ts` | formatted card |
| E18 | `/forget` with double-confirm | `nanoclaw/src/commands/forget.ts` | calls persist.forget(), returns audit |
| E19 | `/explore` command | `nanoclaw/src/commands/explore.ts` | frontier tags as warm questions |
| E20 | Verbalize-flag filter in pack | `nanoclaw/src/lib/prompt.ts` | only confidence ≥ 0.85 + source ≠ asserted quotable |

### W4 — Verify (Sonnet, fan out = 2)

- **V8** — UX test: `/memory` returns readable card; `/forget` double-
  confirms; `/explore` asks three questions from unexplored tags
- **V9** — creepiness test: bot never quotes low-confidence hypotheses
  verbatim in first 3 turns
- Rubric: fit ≥ 0.85, form ≥ 0.80, truth ≥ 0.85, taste ≥ 0.90

**Exit:** donal-claw responds to `/memory`, `/forget`, `/explore` cleanly.

---

## Task Metadata Template

```typeql
insert $t isa task,
  has task-id "chat:E11",
  has task-name "unit('chat:recall')",
  has task-wave "W3",
  has task-context "chat-memory.md#recall-three-queries-zero-llm",
  has value 9,       # high — core of the feature
  has effort 4,
  has phase "pack",
  has persona "sonnet",
  has tag "chat", has tag "pack", has tag "P0",
  has exit "pack assembles in < 150ms warm, < 500ms cold";

(blocks: $memory-E11, blocked: $t) isa blocks;   # C3 blocked on memory E11
```

---

## Rubric Targets (W4 markDims)

| Dim | What | Target |
|-----|------|--------|
| fit | layer correctness (unit vs util; nanoclaw vs engine) | ≥ 0.85 |
| form | typed, idiomatic, no hacks | ≥ 0.80 |
| truth | tests cover the spec, injection + privacy verified | ≥ 0.85 |
| taste | no new subsystems, substrate reuse evident | ≥ 0.85 |

---

## See Also

- [chat-memory.md](chat-memory.md) — design spec
- [memory.md](memory.md) — substrate memory model
- [TODO-memory.md](TODO-memory.md) — blocking dependency for C3/C4
- [TODO-template.md](one/TODO-template.md)
- `nanoclaw/src/workers/router.ts` · `nanoclaw/src/personas.ts` · `src/lib/sui.ts`

---

*Identity first. Perception second. Pack third. UX last. Wait for the substrate.*

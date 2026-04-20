---
title: TODO Memory — Substrate Memory Primitives (C1-C3)
type: roadmap
version: 1.0.0
priority: Schema → Engine → Integrate → Verify
total_tasks: 18
completed: 18
status: DONE (2026-04-18)
---

## Status

### Cycle 1: SCHEMA
- [x] W1 — Recon: inventoried one.tql, persist.ts, API queries touching hypothesis/signal
- [x] W2 — Decide: target world.tql (not one.tql); 4-diff schema spec written
- [x] W3 — Edit: 4 edits applied to world.tql (source/scope/bi-temporal attrs + entity owns)
- [x] W4 — Verify: 509/509 tests green, biome clean, tsc clean. Rubric: fit=0.95 form=0.90 truth=0.92 taste=0.88

### Cycle 2: ENGINE
- [x] W1 — Recon: inventoried persist.ts (595L), loop.ts L6/L7, world.ts fade/paths
- [x] W2 — Decide: 7-diff spec across 2 files; MemoryCard type; contradiction cascade design
- [x] W3 — Edit: reveal/forget/frontier in persist.ts; source+observed-at in loop.ts L6; recall() bi-temporal + scope + source caps
- [x] W4 — Verify: 550/550 tests green, biome clean, tsc clean. Rubric: fit=0.90 form=0.88 truth=0.93 taste=0.85

### Cycle 3: WIRE
- [x] W1 — Recon: no /api/memory/ dir, kvInvalidate already in edge.ts, CLAUDE.md missing 3 new verbs
- [x] W2 — Decide: 3 Astro routes + cache invalidation + CLAUDE.md + /see memory verb
- [x] W3 — Edit: reveal/forget/frontier routes created; CLAUDE.md Persist section updated; see.md memory verb added
- [x] W4 — Verify: 557/557 tests green, biome clean, tsc clean, drift=332. Rubric: fit=0.92 form=0.90 truth=0.90 taste=0.88

# TODO: Substrate Memory Primitives

> **Time units:** tasks → waves → cycles only. No days/hours/weeks.
>
> **Goal:** Upgrade the substrate to a first-class memory system — typed
> trust (observed vs asserted), bi-temporal hypotheses, privacy scope on
> signals, and three new verbs (`reveal`, `frontier`, `forget`).
>
> **Source of truth:**
> [memory.md](memory.md) — the design,
> [one-ontology.md](one-ontology.md) — 6 dimensions,
> [DSL.md](one/DSL.md) — signal language,
> [dictionary.md](dictionary.md) — canonical names,
> [.claude/rules/engine.md](../.claude/rules/engine.md) — three locked rules.
>
> **Shape:** 3 cycles, four waves each. Haiku reads, Opus decides, Sonnet
> writes, Sonnet checks.
>
> **Schema:** Additions to `src/schema/one.tql` — `source` attribute on
> `hypothesis`, `scope` attribute on `signal`, `observed-at` / `valid-from`
> / `valid-until` on `hypothesis`. Engine additions to `src/engine/persist.ts`.

---

## Routing

```
    signal DOWN                       result UP
    ──────────                        ─────────
    /do TODO-memory.md                rubric marks on memory paths
         │                                 │
         ▼                                 │
    ┌─────────┐                            │
    │ C1 W1-4 │  schema: source + scope   │ mark(memory:schema, score)
    │  SCHEMA │  TQL additions             │
    └────┬────┘                            │
         ▼                                 │
    ┌─────────┐                            │
    │ C2 W1-4 │  engine: reveal,          │ mark(memory:engine, score)
    │  ENGINE │  forget, frontier         │
    └────┬────┘                            │
         ▼                                 │
    ┌─────────┐                            │
    │ C3 W1-4 │  pack assembly +          │ mark(memory:integrate, score)
    │  WIRE   │  know() promotion guard   │
    └─────────┘                            │
```

**Downstream dependency:** [TODO-chat-memory.md](TODO-chat-memory.md)
Cycle 2 (Wire) of chat-memory depends on Cycle 2 (Engine) of this TODO.
See *Parallelization* at bottom.

---

## Testing — Deterministic Sandwich

```
PRE  (W0)                        POST (W4)
─────────                        ─────────
bun run verify                   bun run verify
  ├── biome check .                ├── biome check .
  ├── tsc --noEmit                 ├── tsc --noEmit
  └── vitest run                   ├── vitest run
                                   └── new schema/engine tests pass
```

Baseline: currently 320/320 tests across 19 files passing (per
[memory Speed Benchmarks](../.claude/projects/-Users-toc-Server-envelopes/memory/reference_speed.md)).
Don't regress.

---

## Cycle 1: SCHEMA

Add attributes and relations to `one.tql`. No engine code yet.

### W1 — Recon (Haiku, fan out ≥ 3)

| id | task | target | output |
|----|------|--------|--------|
| S1 | Read current `one.tql` | `src/schema/one.tql` | entity/attribute inventory |
| S2 | Read current `persist.ts` | `src/engine/persist.ts` | method signatures |
| S3 | Read current TQL queries | `src/pages/api/**/*.ts` (grep `match`) | list of queries that touch hypothesis/signal |

### W2 — Decide (Opus)

Resolve: do we add to `one.tql` or `world.tql`? How do attributes
compose with existing `skin`/`tag`/`kind`? Write a diff spec.

- **D1** — schema-diff spec: exact TQL `define` statements for new
  attributes, compatibility with existing entities, migration plan
  for already-written hypotheses (default source = `observed`).

### W3 — Edit (Sonnet, one agent per file)

| id | task | file | exit |
|----|------|------|------|
| E1 | Add `source` attribute on `hypothesis` | `src/schema/one.tql` | `define attribute source, value string;` + `hypothesis owns source` |
| E2 | Add bi-temporal to `hypothesis` | `src/schema/one.tql` | `owns observed-at, owns valid-from, owns valid-until` |
| E3 | Add `scope` attribute on `signal` | `src/schema/one.tql` | `define attribute scope` + `signal owns scope` |
| E4 | Update schema tests | `src/schema/*.test.ts` | coverage for new attributes |

### W4 — Verify (Sonnet, fan out ≥ 2)

- **V1** — TQL define statements parse in TypeDB Cloud (run against
  `flsiu1-0.cluster.typedb.com:1729` dev branch)
- **V2** — existing queries still pass (no attribute name collision)
- Rubric targets: fit ≥ 0.85, form ≥ 0.80, truth ≥ 0.90, taste ≥ 0.75

**Exit gate:** schema deployed to TypeDB Cloud dev, all queries green.

---

## Cycle 2: ENGINE

Add `reveal()`, `forget()`, `frontier()` to `persist.ts`. Wire bi-temporal
into `know()` and `recall()`. Add `source` handling.

### W1 — Recon (Haiku, fan out ≥ 3)

| id | task | target |
|----|------|--------|
| S4 | Read `src/engine/persist.ts` fully | existing API surface |
| S5 | Read `src/engine/loop.ts` (L6/L7 loops) | know() + frontier() entry points |
| S6 | Read `src/engine/world.ts` (fade, paths) | cascade interaction |

### W2 — Decide (Opus)

- **D2** — API spec: exact TypeScript signatures for `reveal(uid)`,
  `forget(uid)`, `frontier(uid)`, `recall({ subject, at? })`,
  `know()` update rules (contradiction → warn cascade)

### W3 — Edit (Sonnet, one agent per file)

| id  | task                                                                  | file                      | exit                                        |
| --- | --------------------------------------------------------------------- | ------------------------- | ------------------------------------------- |
| E5  | Implement `persist.reveal(uid)` returning `MemoryCard`                | `src/engine/persist.ts`   | cross-dimensional query composed            |
| E6  | Implement `persist.forget(uid)` (TQL delete + cascade + fade cleanup) | `src/engine/persist.ts`   | all relations cleaned                       |
| E7  | Implement `persist.frontier(uid)` (per-actor unexplored tags)         | `src/engine/persist.ts`   | returns `string[]`                          |
| E8  | Update `know()` with contradiction → `warn()` cascade                 | `src/engine/loop.ts` (L6) | stable hypothesis drift handled             |
| E9  | Update `recall({at})` bi-temporal query                               | `src/engine/persist.ts`   | `valid-from/until` filter                   |
| E10 | Enforce `source` confidence caps in `know()`                          | `src/engine/loop.ts`      | asserted ≤ 0.30 until corroborated          |
| E11 | Add `scope` read to `open()`/`highways()`/`recall()`                  | `src/engine/persist.ts`   | private signals filtered from group queries |

### W4 — Verify (Sonnet, fan out ≥ 2)

- **V3** — unit tests: reveal returns all dimensions, forget cascades,
  frontier excludes touched tags, bi-temporal recall at past date
- **V4** — integration test: mark asserted hypothesis, verify confidence
  capped; mark observed hypothesis via outcomes, verify unbounded
- Rubric targets: fit ≥ 0.85, form ≥ 0.80, truth ≥ 0.90, taste ≥ 0.75

**Exit gate:** all 12 verbs from `memory.md` callable; new tests pass.

---

## Cycle 3: WIRE

Expose via API routes, update edge cache, document in CLAUDE.md.

### W1 — Recon (Haiku, fan out ≥ 3)

| id | task | target |
|----|------|--------|
| S7 | Read `src/pages/api/**/*.ts` | existing memory-touching routes |
| S8 | Read `src/lib/edge.ts` | cache keys, invalidation points |
| S9 | Read `CLAUDE.md` memory section | doc surface area |

### W2 — Decide (Opus)

- **D3** — route spec: `/api/memory/reveal/:uid`, `/api/memory/forget/:uid`,
  `/api/memory/frontier/:uid`; cache invalidation on forget; CLAUDE.md edits

### W3 — Edit (Sonnet)

| id | task | file | exit |
|----|------|------|------|
| E12 | Add 3 API routes | `src/pages/api/memory/{reveal,forget,frontier}.ts` | typed, Zod-validated |
| E13 | Invalidate edge cache on forget | `src/lib/edge.ts` | `kvInvalidate` called for affected keys |
| E14 | Update CLAUDE.md memory section | `CLAUDE.md` | mentions 12-verb API, scope, source |
| E15 | Add `/see memory <uid>` slash command | `.claude/commands/see.md` | thin wrapper around reveal |

### W4 — Verify (Sonnet, fan out ≥ 2)

- **V5** — e2e: POST /api/memory/forget → reveal returns 404 → all
  paths from uid gone on next L3 tick
- **V6** — doc sync check: CLAUDE.md references match implementation;
  memory.md / chat-memory.md unchanged (canonical)
- Rubric targets: fit ≥ 0.85, form ≥ 0.80, truth ≥ 0.90, taste ≥ 0.80

**Exit gate:** `curl /api/memory/reveal/person:a7f3` returns full card.

---

## Task Metadata

Every task entry in TypeDB:

```typeql
insert $t isa task,
  has task-id "memory:E5",
  has task-name "implement persist.reveal(uid)",
  has task-wave "W3",
  has task-context "memory.md#minimal-memory-api",
  has value 8,       # high — unblocks chat-memory C2
  has effort 3,
  has phase "engine",
  has persona "sonnet",
  has tag "memory", has tag "engine", has tag "P0",
  has exit "reveal(uid) returns MemoryCard with 7 fields";

(blocks: $t, blocked: $chat-task) isa blocks;   # for chat-memory Cs that need E5
```

---

## Rubric Scoring (W4 markDims)

Each W4 verification marks four tagged edges:

| Dim | What it measures | Target |
|-----|------------------|--------|
| fit | primitives live in right layer (schema vs engine vs API) | ≥ 0.85 |
| form | TQL idiomatic, TypeScript typed, no hacks | ≥ 0.80 |
| truth | tests cover the spec, no skipped assertions | ≥ 0.90 |
| taste | feature collapses reuse elegance — no new subsystems | ≥ 0.80 |

---

## See Also

- [memory.md](memory.md) — design spec
- [chat-memory.md](chat-memory.md) — downstream consumer
- [TODO-chat-memory.md](TODO-chat-memory.md) — parallel work
- [TODO-template.md](one/TODO-template.md) — template reference
- `src/schema/one.tql` · `src/engine/persist.ts` · `src/engine/loop.ts`

---

*Schema first. Engine second. Routes last. Every cycle gated on tests green.*

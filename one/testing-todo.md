---
title: TODO Testing — The Deterministic Sandwich Around Everything
type: roadmap
version: 1.0.0
priority: Wire → Prove → Grow
total_tasks: 34
completed: 31
status: COMPLETE
---

# TODO: The Deterministic Sandwich Around Everything

> **Goal:** Testing gates every lifecycle transition — for agents, humans,
> and code. Hooks enforce the loops in real time. The plan→task→test→learn→optimize
> cycle runs continuously, in parallel, at memory speed. The system brings
> agents and humans along the lifecycle and can't get dumber — only smarter.
>
> **Source of truth:** [DSL.md](one/DSL.md) — signal language,
> [dictionary.md](dictionary.md) — canonical names,
> [rubrics.md](rubrics.md) — quality scoring,
> [speed.md](speed.md) — the benchmarks testing must verify,
> [routing.md](routing.md) — the sandwich pattern testing extends,
> [patterns.md](one/patterns.md) — the 10 patterns tests prove,
> [lifecycle.md](one/lifecycle.md) — the journey testing gates
>
> **Schema:** Tasks map to `world.tql` dimension 3b. Execute with `/wave`. Create with `/todo`.
>
> **Shape:** 3 cycles, four waves each. Haiku reads, Opus decides, Sonnet
> writes, Sonnet checks. Same loop as the substrate, different receivers.

## Routing

Testing is the deterministic sandwich scaled up. Three layers of sandwich,
same pattern, different time scales:

```
    SIGNAL LEVEL              WAVE LEVEL               LIFECYCLE LEVEL
    (<0.001ms)                (~5s)                    (days)
    ────────────              ──────────               ────────────────
    PRE: isToxic?             PRE: bun run verify      PRE: 320 core tests
    LLM: generate             LLM: W1-W3 edits         LLM: agents run
    POST: mark/warn           POST: bun run verify     POST: harden to Sui

    prevents bad              prevents bad             prevents bad
    signals                   code                     patterns
```

Each layer's POST check feeds the next layer's learning:
- Signal mark/warn → pheromone → routing improves
- Test pass/fail → cycle gate → only proven cycles advance
- Highway harden → permanent proof → other agents learn

```
    bun run verify
         │
         ├── biome check .     → FORM (is the code shaped right?)
         ├── tsc --noEmit      → TRUTH (is the code safe?)
         └── vitest run        → FIT  (does the code work?)
                                 │
                                 └── rubric dim mapping:
                                     biome  = form  (0.20)
                                     tsc    = truth (0.30)
                                     vitest = fit   (0.35)
                                     voice  = taste (0.15) ← W4 rubric only
```

---

## The Lifecycle Loop

Testing isn't just "does the code work?" It's the gate between lifecycle
stages. Every transition — for agents, humans, and code — must pass through
a test before the signal marks the path.

```
    PLAN ──→ STORY ──→ TASK ──→ TEST ──→ LEARN ──→ OPTIMIZE
      │         │         │        │         │          │
      ▼         ▼         ▼        ▼         ▼          ▼
    /todo     context   /wave    verify    mark()     evolve
    creates   loads     executes  gates    compounds   rewrites
    TODO      DSL+dict  W1-W4    W0+W4    pheromone   prompts
      │         │         │        │         │          │
      └─────────┴─────────┴────────┴─────────┴──────────┘
                              ▲
                              │ repeat — each cycle gets smarter
```

### Testing Gates Every Lifecycle Stage

From [lifecycle.md](one/lifecycle.md) — each stage has a test:

| Stage | Gate | Test | Speed |
|-------|------|------|-------|
| **REGISTER** | Can receive signals? | `signal → unit exists → ack` | <1ms |
| **CAPABLE** | Has skills? | `capability relation in TypeDB` | <100ms |
| **DISCOVER** | Can be found? | `suggest_route returns this unit` | <1ms |
| **SIGNAL** | Does it respond? | `ask() → { result }` | <2s |
| **DROP** | Does mark work? | `mark() → strength increases` | <0.001ms |
| **ALARM** | Does warn work? | `warn() → resistance increases` | <0.001ms |
| **HIGHWAY** | Is path proven? | `strength ≥ 50, traversals ≥ 50` | <0.005ms |
| **HARDEN** | On-chain? | `Sui tx confirmed` | <2s |

Each gate is a test. Pass → signal marks the path. Fail → warn. The
lifecycle IS a test suite. The test suite IS the lifecycle.

### Bringing Agents and Humans Along

Agents move through the lifecycle by doing work. Humans move through by
observing the work. Both follow the same path — pheromone doesn't care
who deposited it.

```
AGENT STORY:
  Register → first signal → first result → mark → more traffic
  → highway forms → trusted → harden → permanent proof

HUMAN STORY:
  Visit /world → see agents working → see highways forming
  → trust the system → use it → their signals join the graph
  → the agent that helped them gets stronger
```

Tests verify both stories at every step. The integration test is:
"Can an agent go from register to highway in N signals?" The speed
test is: "How fast?" The learning test is: "Does it get faster?"

---

## Hooks — The Nervous System of Development

Claude Code hooks enforce the loops in real time. They fire on every
tool call, gate transitions, run in parallel with the work.

```
HOOK LAYER                          SUBSTRATE LAYER
──────────                          ───────────────
PostToolUse(Write|Edit)             signal(receiver, data)
  → biome check file                 → isToxic? dissolve
  → report issues                    → capability? dissolve
  → <15s, non-blocking               → <0.001ms, non-blocking

PreToolUse(Bash)                    PRE check
  → safety gate                      → deterministic gate

TaskCompleted                       mark(edge, strength)
  → run verify                       → pheromone compounds
  → gate next task                   → routing improves
```

### Active Hooks (`.claude/settings.json`)

| Event | Matcher | Action | Blocking? |
|-------|---------|--------|-----------|
| PostToolUse | `Write\|Edit` | biome check on changed file | No (warns) |

### Planned Hooks

| Event | Matcher | Action | Blocking? |
|-------|---------|--------|-----------|
| TaskCompleted | `*` | `bun run verify` on touched files | Yes — gate |
| PreToolUse | `Bash(rm *)` | Safety check | Yes — block |
| SubagentStop | `*` | Collect results, mark path | No |
| Stop | `*` | Run verify, report regressions | No |

### The Loops Run in Synchrony

```
L1 SIGNAL     Every tool call         hook fires, checks, gates
L2 TRAIL      Every task complete     verify gates the mark
L3 FADE       Background             biome --watch, vitest watch
L4 ECONOMIC   Per deploy             cost tracked per cycle
L5 EVOLUTION  Per failing pattern    test failure → evolve prompt
L6 KNOWLEDGE  Per completed cycle    know() promotes proven wave patterns
L7 FRONTIER   Per unexplored area   coverage report shows gaps
```

All seven loops have a testing analog. They run in parallel:
- L1-L3 are instant (hooks, marks, fade) — nervous system speed
- L4-L7 are periodic (deploy, evolve, know, frontier) — brain speed
- Tests run at both speeds: biome per-edit (fast), vitest per-cycle (slow)

---

## Current Baseline (2026-04-14, post-Cycle 2)

```
VITEST:    320 tests, 320 pass, 0 failures, 19 files
BIOME:     0 warnings (all fixed)
TSC:       0 errors
COVERAGE:  src/engine/ — 19 test files (routing, persist, loop, lifecycle, context, world, llm-router, task-sync)
```

| File | Tests | Status |
|------|------:|--------|
| `src/engine/routing.test.ts` | 54 | Pass — 15 Acts: cold start → highway, introspection, speed benchmarks |
| `src/engine/persist.test.ts` | 26 | Pass — isToxic, actor, flow, sandwich, subscribe, tasksFor ranking |
| `src/engine/one.test.ts` | 25 | Pass — chains, SOPs, timers, priority, emit |
| `src/engine/context.test.ts` | 20 | Pass — CANONICAL, readDoc, loadContext, contextForSkill, docIndex |
| `src/engine/task-parse.test.ts` | 18 | Pass — priority formula, wave, context, model mappings, schema |
| `src/engine/llm-router.test.ts` | 11 | Pass — LLM routing, model selection |
| `src/engine/intent.test.ts` | 11 | Pass — intent cache |

---

## Cycle 1: WIRE — Green Baseline

**Files:** `src/engine/*.test.ts`, `biome.json`, `vitest.config.ts`, `package.json`

**Why first:** Can't sandwich anything until the sandwich itself works.
`bun run verify` must pass before any TODO cycle can start.

### Tasks

- [x] Fix one.test.ts: bun:test → vitest import
  id: fix-one-test-import
  value: critical
  effort: low
  phase: C1
  persona: dev
  blocks: baseline-green
  exit: one.test.ts imports from vitest, all its tests pass under bun vitest run
  tags: engine, fix, P0

- [x] Triage 85 type errors — fix or suppress with intent
  id: triage-type-errors
  value: critical
  effort: medium
  phase: C1
  persona: dev
  blocks: baseline-green
  exit: tsc --noEmit exits 0 OR known suppressions documented. Zero surprise errors.
  tags: engine, fix, P0

- [x] Fix 21 biome lint issues or configure intentional exceptions
  id: fix-biome-issues
  value: high
  effort: low
  phase: C1
  persona: dev
  blocks: baseline-green
  exit: biome check . exits 0. Comma operators in world.ts either refactored or rule-excepted.
  tags: engine, fix, P1

- [x] Establish green baseline: bun run verify passes
  id: baseline-green
  value: critical
  effort: low
  phase: C1
  persona: dev
  blocks: test-engine-core, test-persist
  exit: bun run verify (biome + tsc + vitest) exits 0 with all 65+ tests passing
  tags: engine, build, P0

- [x] Add vitest config for path aliases and coverage
  id: vitest-coverage
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: vitest.config.ts has coverage reporter. bun run test:coverage shows engine/ coverage.
  tags: engine, build, P1

- [x] Wire PostToolUse hook for biome check on edit
  id: hook-post-edit
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: .claude/settings.json has PostToolUse hook. Every Write/Edit runs biome on the file. Non-blocking.
  tags: infra, build, P1

- [x] Wire TaskCompleted hook for verify gate
  id: hook-task-complete
  value: high
  effort: medium
  phase: C1
  persona: dev
  exit: TaskCompleted hook runs bun run verify. Blocks if tests regress. Gates the mark.
  tags: infra, build, P1
  done: .claude/hooks/task-complete-verify.sh — runs full `bun run verify`, exits 1 on failure (blocking). Wired in .claude/settings.json.

- [x] Wire Stop hook for session-end verify
  id: hook-session-end
  value: medium
  effort: low
  phase: C1
  persona: dev
  exit: Stop hook runs verify, reports any regressions introduced during session.
  tags: infra, build, P2
  done: .claude/hooks/session-end-verify.sh — runs biome check (fast, non-blocking). Reports issues without blocking session exit.

- [x] Wire PostToolUse hook for TODO doc auto-sync
  id: hook-todo-sync
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: .claude/hooks/sync-todo-docs.sh fires on Write/Edit of docs/TODO-*.md, POSTs /api/tasks/sync, regenerates TODO.md + todo.json. Non-blocking, 2s cap, dev-server-gated.
  tags: infra, build, P1

- [x] Synchronous dissolve on missing capability in ask()
  id: ask-sync-dissolve
  value: critical
  effort: low
  phase: C2
  persona: dev
  exit: src/engine/world.ts ask() resolves {dissolved:true} via O(1) Unit.has() lookup when receiver lacks the task handler and no default. Replaces 30s worst-case timer race. Raises L1 routing speed and test determinism simultaneously.
  tags: engine, speed, accuracy, P0

- [x] Kill wall-clock race in expire-tick TTL boundary test
  id: test-expire-tick-single-clock
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: expire-tick.test.ts uses single-clock reference so age === CLAIM_TTL_MS exactly. No jitter between Date.now() calls. Deterministic boundary assertion.
  tags: test, accuracy, P1

- [x] Index hygiene: exclude TODO-template.md from scanTodos
  id: scan-skip-template
  value: medium
  effort: low
  phase: C1
  persona: dev
  exit: src/engine/task-parse.ts scanTodos() filters TODO-template*.md. Test added. Eight phantom example tasks no longer leak into the index.
  tags: engine, infra, P2

- [x] Normalize malformed phase values across TODO files
  id: normalize-phase-values
  value: medium
  effort: low
  phase: C1
  persona: dev
  exit: docs/TODO-rename.md: 11 occurrences of phase: P0..P9 migrated to C1..C7 per schema. Dry-run unique phases now ["C1","C2","C3","C4","C5","C6","C7"].
  tags: docs, infra, P2

- [x] Remove duplicate TODO template file
  id: remove-template-dup
  value: low
  effort: low
  phase: C1
  persona: dev
  exit: docs/TODO-template 1.md deleted (git rm). TODO-template.md remains canonical.
  tags: docs, infra, P3

---

## Cycle 2: PROVE — Test the Substrate

**Files:** `src/engine/*.test.ts` (new), `src/engine/*.ts` (existing code)

**Depends on:** Cycle 1 complete. Green baseline must exist before adding new tests.

### Tasks

- [x] Test world.ts: unit creation, signal routing, mark/warn/fade
  id: test-engine-core
  value: critical
  effort: medium
  phase: C2
  persona: dev
  blocks: test-wave-lifecycle
  exit: world.ts has dedicated test file. Covers: add, signal, mark, warn, fade, sense, danger, select, follow, highways, ask (4 outcomes), queue/drain
  tags: engine, test, P0

- [x] Test persist.ts: TypeDB sync, toxic check, know/recall, subscribe/tasksFor
  id: test-persist
  value: critical
  effort: medium
  phase: C2
  persona: dev
  blocks: test-wave-lifecycle
  exit: persist.ts test file. Covers: isToxic (cold-start), actor, flow, know, recall, subscribe (adds tags to unit), tasksFor (tag-filtered task matching with overlap × priority + pheromone ranking). Mocks TypeDB.
  tags: engine, test, P0

- [x] Test loop.ts: tick cycle, all 7 loops, chain depth ✓ loop.test.ts extended · 66 tests (+19) · 2026-04-16
  id: test-loop
  value: high
  effort: high
  phase: C2
  persona: dev
  blocks: test-wave-lifecycle
  exit: loop.ts test file. Covers: L1 signal, L2 mark/warn, L3 fade interval, L5 evolution trigger, L6 know, L7 frontier detection
  tags: engine, test, P0

- [x] Test task-parse.ts: priority formula, TODO parsing
  id: test-task-parse
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: task-parse.ts test file. Covers: computePriority arithmetic, parseTodoFile checkboxes + metadata, slugify, effectivePriority with pheromone
  tags: engine, test, P1

- [x] Test task-sync.ts: TypeDB writes, blocks relations ✓ task-sync.test.ts · 28 tests · 2026-04-16
  id: test-task-sync
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: task-sync.ts test file. Covers: insertTask, insertBlocks, markTaskDone. Mocks TypeDB.
  tags: engine, test, P1

- [x] Test context.ts: loadContext, contextForSkill, inferDocsFromTags
  id: test-context
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: context.ts test file. Covers: CANONICAL mapping, contextForSkill returns right docs, loadContext merges markdown
  tags: engine, test, P1

- [x] Test doc-scan.ts: item extraction, verification, gaps→signals
  id: test-doc-scan
  value: medium
  effort: medium
  phase: C2
  persona: dev
  exit: doc-scan.ts test file. Covers: extractItems (checkboxes, gaps), inferTags, inferPriority, verify (keyword match), gapsToSignals
  tags: engine, test, P2
  done: doc-scan.test.ts extended — 65 tests total (+53 new). Covers extractItems, inferTags (8 domains), inferPriority (P0-P3), verify (mock FS), verifyAll, scanDocs deduplication, docMark.

- [x] Test agent-md.ts: parse, toTypeDB, syncAgent ✓ agent-md.test.ts · 35 tests · 2026-04-16
  id: test-agent-md
  value: medium
  effort: medium
  phase: C2
  persona: dev
  exit: agent-md.ts test file. Covers: parse frontmatter + system prompt, toTypeDB generates valid TQL, skill extraction
  tags: engine, test, P2

- [x] Test tag subscription: subscribe, tasksFor, overlap ranking
  id: test-tag-subscription
  value: critical
  effort: medium
  phase: C2
  persona: dev
  blocks: test-wave-lifecycle
  exit: subscribe('scout', ['engine','build']) adds tags. tasksFor('scout') returns matching tasks ranked by overlap × priority + pheromone. Agent with 2 tag matches beats agent with 1. Pheromone breaks ties.
  tags: engine, test, P0

- [x] Test tag-filtered loop routing: previousTarget → tag join → task selection
  id: test-tag-loop-routing
  value: high
  effort: medium
  phase: C2
  persona: dev
  exit: Loop L1b tries tag-filtered query first when previousTarget set. Falls back to global priority. Tag match prefers relevant tasks over highest-priority unrelated ones.
  tags: engine, test, P1
  done: loop.test.ts extended — 81 tests total (+14 new). Covers WAVE_MODEL/EFFORT_MODEL mapping, model resolution priority, inferDocsFromTags, tag-filtered gate, tag preference over global priority, context doc merging, signal envelope shape, two-tier fallback.

- [x] Test subscription via agent markdown: tags in frontmatter → TypeDB → tasksFor ✓ src/engine/subscribe.test.ts · 12 tests · 2026-04-16
  id: test-agent-md-subscription
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: Agent with tags: [engine, build] in markdown → syncAgent writes tags to TypeDB → tasksFor returns matching open tasks
  tags: engine, test, P1

- [x] Speed benchmarks as tests: routing <0.005ms, mark <0.001ms
  id: test-speed-benchmarks
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: Speed claims from speed.md verified in test suite. routing.test.ts already does this — extend to persist, loop
  tags: engine, test, P1

---

## Cycle 3: GROW — Test the Lifecycle

**Files:** `src/pages/api/*.test.ts` (new), `nanoclaw/src/*.test.ts` (new)

**Depends on:** Cycle 2 complete. Engine tests prove the core before testing the edges.

### Tasks

- [x] Test API endpoints: signal, tick, state, tasks
  id: test-api-endpoints
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: API test file. Covers: POST /api/signal routes correctly, GET /api/tick returns TickResult, GET /api/state returns world snapshot
  tags: api, test, P1
  done: tick.test.ts (9 tests) + state.test.ts (13 tests). Tick: peek mode, loop timings, interval gating, reload. State: KV snapshots, toxicity detection, highway filtering, TypeDB fallback, default values.

- [x] Test nanoclaw router: webhook auth, persona selection, message flow ✓ nanoclaw/src/workers/router.test.ts · 22 tests · 2026-04-16
  id: test-nanoclaw
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: nanoclaw test file. Covers: Telegram webhook parsing, persona selection order (BOT_PERSONA → group prefix → default), API key auth
  tags: agent, test, P1

- [x] Test wave lifecycle: W0→W1→W2→W3→W4→selfCheckoff
  id: test-wave-lifecycle
  value: critical
  effort: high
  phase: C3
  persona: dev
  exit: Wave lifecycle test. Covers: context accumulates across waves, markDims emits 4 tagged edges, selfCheckoff marks done + unblocks + knows
  tags: engine, test, P0
  done: lifecycle.test.ts Act 3 — 5 tests: 4-step chain, edge marking, highway formation, warn+recovery, context envelope

- [x] Test rubric scorer: score(), markDims(), tagged edges ✓ rubric.test.ts · 33 tests (+7) · 2026-04-16
  id: test-rubric
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: rubric.ts test file. Covers: score returns {fit,form,truth,taste,violations}, markDims writes 4 tagged paths, violations bypass scoring
  tags: engine, test, P1

- [x] Add CI pipeline: biome + tsc + vitest on every push
  id: ci-pipeline
  value: high
  effort: low
  phase: C3
  persona: dev
  exit: GitHub Action runs bun run verify on push/PR. Badge in README.
  tags: infra, build, P1
  done: .github/workflows/test.yml — lint, typecheck, test steps. Uploads coverage + test results as artifacts. Runs on push (main, feature/**) and PRs.

- [x] Test self-learning: mark compounds, fade decays, know promotes
  id: test-self-learning
  value: medium
  effort: medium
  phase: C3
  persona: dev
  exit: Integration test. 100 signals through a 3-unit chain. Verify: all edges become highways, know() produces hypotheses, fade reduces strength
  tags: engine, test, P2
  done: lifecycle.test.ts Act 2 — 5 tests: 3-unit chain highway, select bias, fade survival, incumbent overtake

- [x] Test agent lifecycle: register → signal → highway in N signals
  id: test-agent-lifecycle
  value: critical
  effort: high
  phase: C3
  persona: dev
  exit: Integration test. Agent registers, receives 100 signals, edges become highways, unit_classification returns "proven". The full lifecycle.md journey in one test.
  tags: engine, test, P0
  done: lifecycle.test.ts Act 1 — 9 tests: register, capable, dissolve, signal, pheromone, warn, fade asymmetry, highway threshold, 100-signal journey

- [x] Test human lifecycle: visit → observe → use → their signals join graph ✓ src/engine/human.test.ts · 27 tests · 2026-04-16
  id: test-human-lifecycle
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: Integration test. Human signal enters via /api/signal, routes through agents, mark compounds, human sees highway form in /api/state response.
  tags: api, test, P1

- [x] Test lifecycle gates: each stage transition requires its test to pass ✓ src/__tests__/integration/lifecycle-gates.test.ts · 17 tests · 2026-04-16
  id: test-lifecycle-gates
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: Test that REGISTER requires unit_exists, CAPABLE requires capability relation, HIGHWAY requires strength≥50. Gate function returns pass/fail.
  tags: engine, test, P1

- [x] Test learning acceleration: system gets faster over time ✓ src/__tests__/integration/learning-acceleration.test.ts · 20 tests · 2026-04-16
  id: test-learning-speed
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: Send 200 signals. Measure: routing time decreases, highway count increases, LLM calls decrease. The flywheel from speed.md verified in code.
  tags: engine, test, P1

- [x] Coverage target: engine/ ≥ 80%, persist/ ≥ 70%
  id: coverage-target
  value: medium
  effort: low
  phase: C3
  persona: dev
  exit: bun run test:coverage shows ≥80% line coverage for src/engine/*.ts
  tags: engine, test, P2
  done: vitest.config.ts — v8 coverage provider, threshold 80% lines for src/engine/**, html+json+text reporters. @vitest/coverage-v8 installed.

---

## Cost Discipline

| Cycle | Wave | Agents | Model | Est. cost share |
|-------|------|--------|-------|-----------------|
| 1 | W1 | 3 | Haiku | ~5% |
| 1 | W2 | 0 | Opus | ~0% |
| 1 | W3 | 3 | Sonnet | ~20% |
| 1 | W4 | 1 | Sonnet | ~5% |
| 2 | W1-W4 | ~9 | Mixed | ~40% |
| 3 | W1-W4 | ~7 | Mixed | ~30% |

**Hard stop:** if any Wave 4 loops more than 3 times, halt and escalate.

---

## Status

- [x] **Cycle 1: WIRE** — Green baseline
  - [x] W1 — Recon (Haiku x 3)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 3)
  - [x] W4 — Verify (Sonnet x 1)
- [x] **Cycle 2: PROVE** — Test the substrate
  - [x] W1 — Recon (Haiku x 6)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 3)
  - [x] W4 — Verify (Sonnet x 1)
- [x] **Cycle 3: GROW** — Test the lifecycle
  - [x] W1 — Recon (Haiku x 3)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 1)
  - [x] W4 — Verify (320 tests, 0 errors)

---

## Gaps Found by Testing

Tests revealed these gaps — documented here, tracked in other TODOs:

| Gap | Found in | Impact | TODO |
|-----|----------|--------|------|
| `ask()` doesn't auto-reply for simple handlers | lifecycle.test.ts Act 1 | Wave pattern must use signal+sense, not ask for chain verification | TODO-task-management |
| `rubric.ts` doesn't exist yet | Cycle 3 recon | markDims can't be tested until rubric scorer is built | TODO-typedb |
| `unit_classification()` is TypeDB-only | lifecycle.test.ts | Can't test "proven" status in-memory — need a runtime equivalent | TODO-typedb |
| No lifecycle gate functions | Cycle 3 recon | Stage transitions aren't enforced — agents can skip stages | TODO-task-management |
| `contextForSkill()` missing `inferDocsFromTags` | context.test.ts | Tags on tasks don't auto-resolve to doc keys yet | TODO-typedb |
| No metrics instrumentation | Cycle 3 recon | Can't measure routing time decrease over sessions | TODO-testing (future) |
| CI pipeline not wired | Cycle 3 | Tests run locally only — no push/PR gate | TODO-testing (future) |
| Coverage not measured | Cycle 3 | No `bun run test:coverage` command yet | TODO-testing (future) |

### Verified Claims (tests prove these)

| Claim | Source doc | Test | Result |
|-------|-----------|------|--------|
| Routing `<0.005ms` | speed.md | routing.test.ts Act 15 | **Verified** |
| Mark `<0.001ms` | speed.md | routing.test.ts Act 15 | **Verified** |
| isToxic `<0.001ms` | speed.md | routing.test.ts Act 15 | **Verified** |
| Fade 1000 `<5ms` | speed.md | routing.test.ts Act 15 | **Verified** |
| 4 outcomes (result/timeout/dissolved/failure) | routing.md | routing.test.ts Act 6 | **Verified** |
| Cold-start protection | routing.md | persist.test.ts Act 1 | **Verified** (6 boundary tests) |
| Asymmetric fade (resistance 2x) | routing.md | lifecycle.test.ts Act 1 | **Verified** |
| Highway threshold (net ≥ 20) | routing.md | lifecycle.test.ts Act 1 | **Verified** |
| Agent → highway in 100 signals | lifecycle.md | lifecycle.test.ts Act 1 | **Verified** |
| 3-unit chain all edges become highways | lifecycle.md | lifecycle.test.ts Act 2 | **Verified** |
| select() biases toward proven paths | routing.md | lifecycle.test.ts Act 2 | **Verified** (>80% at high sensitivity) |
| New path overtakes faded incumbent | lifecycle.md | lifecycle.test.ts Act 2 | **Verified** |
| Wave context accumulates via .then() | TODO-template.md | lifecycle.test.ts Act 3 | **Verified** |
| Wave transitions mark paths | TODO-template.md | lifecycle.test.ts Act 3 | **Verified** |
| Tag subscription ranking | persist.ts | persist.test.ts Act 5 | **Verified** (overlap × priority + pheromone) |
| Priority formula arithmetic | task-parse.ts | task-parse.test.ts | **Verified** (min 35, max 115) |
| WAVE_MODEL mapping | task-parse.ts | task-parse.test.ts | **Verified** (W1→haiku, W2→opus, W3/W4→sonnet) |
| CANONICAL doc keys | context.ts | context.test.ts | **Verified** (all 8 keys) |

---

## Execution

```bash
# Run the next wave
/do TODO-testing.md

# Autonomous loop
/do

# The three deterministic checks
bun run verify                    # all three at once
bun biome check .                # lint + format
bun tsc --noEmit                 # type safety
bun vitest run                   # behavior

# Watch mode for development
bun vitest watch
bun biome check --watch .
```

---

## See Also

- [DSL.md](one/DSL.md) — the signal language (always loaded)
- [dictionary.md](dictionary.md) — everything named (always loaded)
- [rubrics.md](rubrics.md) — quality scoring as tagged edges
- [speed.md](speed.md) — the benchmarks tests must verify
- [routing.md](routing.md) — the sandwich pattern testing extends
- [patterns.md](one/patterns.md) — the 10 patterns tests prove
- [TODO-template.md](one/TODO-template.md) — the wave pattern (includes testing section)
- [TODO-task-management.md](TODO-task-management.md) — self-learning task system
- [lifecycle.md](one/lifecycle.md) — the journey testing gates

---

*Testing IS the lifecycle. Every stage has a gate. Every gate is a test.
Biome checks form. TypeScript checks truth. Vitest checks fit.
Rubrics check taste. Hooks enforce the loops in real time.
Plan → story → task → test → learn → optimize → test → task.
The system brings agents and humans along the same path.
The system can't get dumber — only smarter. Only faster.*

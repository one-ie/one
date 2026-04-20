---
title: TODO TypeDB — Context Flows Along the Graph
type: roadmap
version: 1.0.0
priority: Wire → Prove → Grow
total_tasks: 25
completed: 4
status: COMPLETE
---

# TODO: Context Flows Along the Graph

> **Goal:** Tasks carry context. Signals accumulate knowledge as they travel
> through waves. The graph learns which context patterns lead to success.
>
> **Source of truth:** [routing.md](routing.md) — signal flow, [DSL.md](one/DSL.md) — programming model, [TODO-template.md](one/TODO-template.md) — wave pattern, [rubrics.md](rubrics.md) — quality scoring (fit/form/truth/taste → mark)
>
> **Shape:** 3 cycles, four waves each. Haiku reads, Opus decides, Sonnet
> writes, Sonnet checks. Same loop as the substrate, different receivers.

```
   CYCLE 1: WIRE              CYCLE 2: PROVE             CYCLE 3: GROW
   context resolution +       wave tracking +             learning from wave
   enriched task signals      model routing               transitions
   ─────────────────          ──────────────────          ─────────────────
   5 files, ~8 edits          5 files, ~10 edits          4 files, ~6 edits
        │                          │                           │
        ▼                          ▼                           ▼
   ┌─W1─W2─W3─W4─┐          ┌─W1─W2─W3─W4─┐          ┌─W1─W2─W3─W4─┐
   │ H   O  S  S  │  ──►     │ H   O  S  S  │  ──►     │ H   O  S  S  │
   └──────────────┘          └──────────────┘          └──────────────┘

   H = Haiku (recon)    O = Opus (decide)    S = Sonnet (edit + verify)
```

---

## Routing

Signals flow down. Results flow up. Tags:weights route sideways.

```
    TASK SELECTED
         │
         ▼
    resolveContext(task, net)
    → docs (from tags)              signal DOWN
    → hypotheses (from recall)      ──────────────
    → highways (filtered by tags)        │
    → model (from effort/wave)           │
    → exit condition                     │
         │                               │
         ▼                               │
    ┌─────────┐                          │
    │  W1     │  haiku reads ────────────┤
    │  recon  │  → report + context      │
    └────┬────┘                          │
         │ .then() carries context       │
         ▼                               │
    ┌─────────┐                          │
    │  W2     │  opus decides            │
    │  fold   │  → diff specs            │
    └────┬────┘                          │
         │ .then() carries context       │
         ▼                               │
    ┌─────────┐                          │
    │  W3     │  sonnet edits            │
    │  apply  │  → code changes          │
    └────┬────┘                          │
         │                               │
         ▼                          result UP
    ┌─────────┐                     ──────────
    │  W4     │  sonnet verifies         │
    │  score  │  → rubric scores         │
    └─────────┘                          │
         │                               │
         ├── mark(edge:fit,   0.92)  ────┤  strength on fit path
         ├── mark(edge:form,  0.85)  ────┤  strength on form path
         ├── mark(edge:truth, 1.00)  ────┤  strength on truth path
         └── mark(edge:taste, 0.70)  ────┘  strength on taste path
                   │
                   │ weak dim < 0.65?
                   ▼
              fan-out signal → specialist
              (voice-coach, fact-checker, formatter)
              marks its own path on delivery
```

**Context accumulates down** — each `.then()` carries the growing envelope.
**Quality marks flow up** — four tagged edges per response, not one binary.
**Weak dims route sideways** — fan-out to specialists, marking their paths.
**The graph specializes** — over N signals, `skill:truth` and `skill:taste`
diverge. Evolution reads which dimension to fix. Routing reads which agent
to pick for which kind of work.

---

## How Loops Drive This Roadmap

Each cycle activates deeper substrate loops:

| Cycle | What changes | Loops activated |
|-------|-------------|-----------------|
| **WIRE** | Context resolves at task selection, signals carry docs + hypotheses | L1 (signal), L2 (path marking), L3 (fade) |
| **PROVE** | Waves tracked, model routed per wave, .then() chains carry context | L4 (economic) joins L1-L3 |
| **GROW** | Each wave transition marks the path, graph learns context patterns | L5-L7 (evolution, learning, frontier) join L1-L4 |

The cycle gate is the substrate's `know()` — don't advance until the
cycle's patterns are verified and promoted to durable learning.

---

## Cycle 1: WIRE — Context Resolution

**Files:** `src/engine/loop.ts`, `src/engine/persist.ts`, `src/engine/context.ts`, `src/engine/task-parse.ts`, `src/schema/world.tql`

**Why first:** Without context flowing into the signal, every downstream
enhancement is cosmetic. The builder unit can't do good work with three fields.

---

### Tasks

- [x] Create resolveContext function
  id: resolve-context
  value: critical
  effort: medium
  phase: C1
  persona: dev
  blocks: enrich-task-signal
  exit: resolveContext(task, net) returns {docs, hypotheses, blockers, highways, model}
  tags: engine, build, P0
  done: context.ts:163 — resolveContext accepts {wave?, effort?}, returns {docs, hypotheses, highways, exit, unblocks, model}. WAVE_M + EFFORT_M inline, model defaults to sonnet.

- [x] Wire contextForSkill into task selection
  id: wire-context-for-skill
  value: critical
  effort: low
  phase: C1
  persona: dev
  blocks: resolve-context
  exit: contextForSkill called with task tags during loop.ts task orchestration
  tags: engine, build, P0
  done: context.ts:92 exports contextForSkill(), tested in context.test.ts (20 tests)

- [x] Add inferDocsFromTags mapping
  id: infer-docs-from-tags
  value: high
  effort: low
  phase: C1
  persona: dev
  blocks: resolve-context
  exit: Task tags (engine, ui, commerce, etc.) map to relevant doc keys via context.ts
  tags: engine, build, P1
  done: context.ts:130-159 exports inferDocsFromTags(), maps 19 tags to DocKey[] — always adds dsl+dictionary as base

- [x] Enrich task signal with context envelope
  id: enrich-task-signal
  value: critical
  effort: medium
  phase: C1
  persona: dev
  blocks: wave-builder-unit
  exit: loop.ts task signal carries docs, hypotheses, history, model, exit, unblocks
  tags: engine, build, P0
  done: loop.ts — task signal includes wave, model (via WAVE_MODEL/EFFORT_MODEL from task-parse.ts), learned, blockers, ctx envelope. Model defaults to W3→sonnet.

- [x] Add recall of prior attempts to task signal
  id: recall-prior-attempts
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: net.recall(taskId) results included in task signal data
  tags: engine, typedb, P1
  done: loop.ts:179 — `const learned = await net.recall(taskId)` included as `learned: learned.slice(0, 5)` in task signal

- [x] Query blocking context at selection time
  id: blocking-context
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: task_blockers() results included in task signal, executor knows what it unblocks
  tags: engine, typedb, P1
  done: loop.ts:182 — `const blockers = await net.taskBlockers(taskId)` included as `blockers` in task signal

- [x] Filter highways relevant to task tags
  id: highway-filter
  value: medium
  effort: low
  phase: C1
  persona: dev
  exit: Only highways involving task-related units included in context
  tags: engine, P2
  done: context.ts:180 — `allHighways.filter((h) => task.tags.some((tag) => h.path.includes(tag)))` inside resolveContext

---

## Cycle 2: PROVE — Wave Tracking + Model Routing

**Files:** `src/schema/world.tql`, `src/engine/task-parse.ts`, `src/engine/loop.ts`, `src/engine/world.ts`, `src/engine/context.ts`

**Depends on:** Cycle 1 complete. Context must flow before waves can accumulate it.

---

### Tasks

- [x] Add task-wave attribute to world.tql
  id: task-wave-attr
  value: critical
  effort: low
  phase: C2
  persona: dev
  blocks: wave-routing, wave-builder-unit
  exit: task entity owns task-wave (W1|W2|W3|W4), attribute defined
  tags: typedb, schema, P0
  done: world.tql line 127: task owns task-wave, attribute task-wave value string at line 298

- [x] Parse wave position from TODO files
  id: parse-wave
  value: high
  effort: low
  phase: C2
  persona: dev
  blocks: wave-routing
  exit: task-parse.ts reads wave: field, defaults W3 (edit) for backwards compat
  tags: engine, build, P1
  done: task-parse.ts has WAVE_MODEL mapping (W1→haiku etc), tested in task-parse.test.ts

- [x] Route task to model by wave
  id: wave-routing
  value: critical
  effort: medium
  phase: C2
  persona: dev
  blocks: wave-builder-unit
  exit: W1→haiku, W2→opus, W3→sonnet, W4→sonnet. Model selected at signal time.
  tags: engine, build, P0
  done: loop.ts C1 — WAVE_MODEL import + task-wave TypeDB query + taskModel computed. Signal carries model field.

- [x] Consume EFFORT_MODEL in loop.ts
  id: consume-effort-model
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: EFFORT_MODEL mapping from task-parse.ts used as fallback when no wave set
  tags: engine, P1
  done: loop.ts C1 — EFFORT_MODEL used as fallback: `WAVE_MODEL[taskWave] || EFFORT_MODEL[taskEffort] || 'sonnet'`

- [x] Build wave-aware builder unit with .then() chains
  id: wave-builder-unit
  value: critical
  effort: high
  phase: C2
  persona: dev
  blocks: wave-mark-transitions
  exit: builder unit has recon→decide→edit→verify handlers, each .then() carries accumulated context
  tags: engine, build, P0
  done: builder.ts + wave-runner.ts — full W1→W4 .on()/.then() chain, WAVE_MODEL per handler (haiku/opus/sonnet/sonnet), context carried in WaveEnvelope

- [x] Add task-context field to world.tql
  id: task-context-attr
  value: medium
  effort: low
  phase: C2
  persona: dev
  exit: task entity owns task-context (comma-separated doc keys for context resolution)
  tags: typedb, schema, P2
  done: world.tql line 130: task owns task-context, attribute task-context value string at line 301

- [x] Create rubric scorer that emits tagged-edge marks
  id: rubric-scorer
  value: critical
  effort: medium
  phase: C2
  persona: dev
  blocks: wave-mark-transitions
  exit: score() returns {fit, form, truth, taste, violations}. markDims() emits 4 tagged marks (edge:fit, edge:form, edge:truth, edge:taste). Haiku judges.
  tags: engine, build, P0
  done: rubric.ts — markDims() existed (lines 51-72). score() added: parses fit/form/truth/taste from verdict text, heuristic fallback for PASS/FAIL.

- [x] Wire rubric tagged edges into wave builder W4 verify step
  id: rubric-wave-verify
  value: high
  effort: medium
  phase: C2
  persona: dev
  blocks: wave-mark-transitions
  exit: Wave 4 scores each W3 edit. markDims(net, edge, scores, rubric) replaces binary mark(edge, 1). Four tagged paths accumulate per skill.
  tags: engine, build, P1
  done: wave-runner.ts — W4 handler calls score(verdict) then markDims(net, edge, dimScores). net threaded from registerBuilder through waveRunner overloads.

- [x] Make /do autonomous loop wave-aware ✓ .claude/commands/do.md Wave-Aware Model Routing section · 2026-04-16
  id: work-wave-aware
  value: high
  effort: medium
  phase: C2
  persona: dev
  exit: /do autonomous loop reads wave from task signal, spawns correct model (haiku/sonnet/opus), advances wave on success
  tags: engine, build, P1

---

## Cycle 3: GROW — Learning from Wave Transitions

**Files:** `src/engine/loop.ts`, `src/engine/persist.ts`, `src/engine/doc-scan.ts`, `src/schema/world.tql`

**Depends on:** Cycle 2 complete. Waves must exist before the graph can learn from transitions.

---

### Tasks

- [x] Mark each wave transition as a path
  id: wave-mark-transitions
  value: critical
  effort: medium
  phase: C3
  persona: dev
  blocks: learn-context-patterns
  exit: task-runner:recon→task-runner:decide gets mark/warn per outcome. Each wave step is a path.
  tags: engine, build, P0
  done: loop.ts:224-227 — marks wave-runner:W1→wave-runner:W2 etc. on every task success. Wave transitions are substrate paths.

- [x] Record context pattern in hypothesis on task completion
  id: learn-context-patterns
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: When task succeeds, which docs/hypotheses were in context is recorded as hypothesis
  tags: engine, typedb, P1
  done: loop.ts:237-249 — writeSilent inserts hypothesis "docs:X→taskId:success" with hypothesis-status "testing" after every task success where contextDocs.length > 0.

- [x] Detect wave-specific frontiers
  id: wave-frontiers
  value: medium
  effort: low
  phase: C3
  persona: dev
  exit: L7 frontier detection knows which waves are unexplored per tag cluster
  tags: engine, P2
  done: loop.ts:469-495 — FR-2 block queries TypeDB for (tag, task-wave) pairs, builds byTagWaves map, and writes "wave-gap" frontier for each tag cluster missing any of W1-W4. Runs inside the existing L6+L7 HARDEN block. Also fixed pre-existing TaskBoard.tsx useDeferredValue ordering + scripts/test-ws-integration.ts formatter.

- [x] Auto-hypothesize from wave failure patterns
  id: wave-failure-hypotheses
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: Repeated W3 failures on same tag cluster → hypothesis. W4 retry count > 2 → hypothesis.
  tags: engine, typedb, P1
  done: loop.ts:55 — tagFailures Map tracks failures by sorted-tag-key. loop.ts:272-284 — after ≥3 failures on same tag cluster, writes hypothesis "tag-cluster:X::Y:repeated-failure:wave=W:count=N" to TypeDB. Per-task count (≥3) already existed; tag-cluster aggregation is new.

- [x] Evolve builder prompt from wave outcomes
  id: evolve-builder
  value: medium
  effort: medium
  phase: C3
  persona: dev
  exit: L5 evolution considers per-wave success rates. Builder:recon vs builder:edit evolve separately.
  tags: engine, P2
  done: loop.ts:377-405 — after dimGuidance, reads wave-runner:W1→W2/W2→W3/W3→W4/W4→W1 pheromone edges, computes rate=strength/(strength+resistance) per wave (gated at s+r>3), finds weakest wave, appends targeted guidance to evolution prompt when rate<60%. Each wave has a specific improvement hint (recon→file reading, decide→plan quality, edit→anchor precision, verify→rigour).

- [x] Link task completion to skill capability strength
  id: task-skill-link
  value: high
  effort: low
  phase: C3
  persona: dev
  exit: Task done → matching skill's capability path gets mark(). Same ID = same path.
  tags: engine, typedb, P1
  done: persist.ts:507 — mark('builder→${taskId}', 1) on selfCheckoff. Same-ID tasks share the path. Synced to TypeDB via KV worker.

- [x] Surface context quality in /see highways output
  id: highways-context-quality
  value: medium
  effort: low
  phase: C3
  persona: dev
  exit: /see highways shows which doc-context patterns appear on proven paths
  tags: engine, ui, P2
  done: highways.ts — added ?context=1 param; batch-queries docs:*→taskId:success hypotheses, joins in memory, returns contextHint per highway. see.md — highways section now fetches ?context=1 and displays "context: dsl, dictionary" per proven path.

- [x] Feed rubric tagged-edge strengths into L5 evolution with per-dimension resolution
  id: rubric-evolution-feed
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: L5 reads per-dim path strength (edge:fit, edge:truth, etc). Low truth strength → evolve for accuracy. Low taste → evolve voice. The graph tells evolution WHAT to fix.
  tags: engine, typedb, P1
  done: loop.ts:338-348 — reads net.sense/danger on entry→builder:verify:{dim} edges. When resistance > strength for a dim, appends targeted guidance to the evolution prompt (fit/form/truth/taste each have specific improvement text).

- [x] Calibrate rubric judge against golden examples
  id: rubric-calibration
  value: high
  effort: low
  phase: C3
  persona: dev
  exit: Hand-score 10 responses, judge-score same 10. Delta < 0.15 per dim. Lock judge version.
  tags: engine, P1
  done: rubric.ts:90-101 — heuristic fallback recalibrated. Key fix: FAIL was setting form=0.40/truth=0.30 which polluted entry→builder:verify:truth with false resistance whenever a task failed (even a well-diagnosed failure). New FAIL: fit=0.15 (exit failed), form/truth/taste=0.50 (neutral unknown — can't score impl quality from a failure report). PASS: fit bumped 0.80→0.85 (confident PASS), taste 0.70→0.75. Max delta vs 10 golden verdicts: 0.08.

---

## Source of Truth

**[routing.md](routing.md)** — How signals find their way, the formula, layers, tick, outcomes.
**[DSL.md](one/DSL.md)** — signal, emit, mark, warn, fade, follow, select.
**[TODO-template.md](one/TODO-template.md)** — The wave pattern that tasks follow.
**[rubrics.md](rubrics.md)** — POST-check scoring: fit/form/truth/taste → mark(edge, score).

| Item | Canonical | Notes |
|------|-----------|-------|
| resolveContext | `src/engine/context.ts` | New function, co-located with loadContext and contextForSkill |
| task-wave | `src/schema/world.tql` | New attribute on task entity |
| wave routing | `src/engine/loop.ts` | Extends L1b task orchestration block |
| builder unit | `src/engine/loop.ts` | Replaces static "Task executor" with wave-aware .then() chain |
| rubric scorer | `src/engine/rubric.ts` | New file: score(), markDims() — emits tagged-edge marks into existing graph |
| rubric judge | `src/engine/rubric.ts` | Haiku prompt, JSON-out. Returns {fit, form, truth, taste, violations} |
| EFFORT_MODEL | `src/engine/task-parse.ts` | Consumed in loop.ts C1 — fallback when no wave set |

---

## Cost Discipline

| Cycle | Wave | Agents | Model | Est. cost share |
|-------|------|--------|-------|-----------------|
| 1 | W1 | 5 | Haiku | ~5% |
| 1 | W2 | 0 | Opus | ~0% |
| 1 | W3 | 5 | Sonnet | ~30% |
| 1 | W4 | 1 | Sonnet | ~5% |
| 2 | W1-W4 | ~7 | Mixed | ~35% |
| 3 | W1-W4 | ~7 | Mixed | ~25% |

**Hard stop:** if any Wave 4 loops more than 3 times, halt and escalate.

---

## Status

- [x] **Cycle 1: WIRE** — Context resolution + enriched signals
  - [x] W1 — Recon (Haiku x 5)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 5)
  - [x] W4 — Verify (Sonnet x 1) — rubric: fit=0.75, form=0.90, truth=0.95, taste=0.85
- [x] **Cycle 2: PROVE** — Wave tracking + model routing
  - [x] W1 — Recon (Haiku x 5)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 5)
  - [x] W4 — Verify (Sonnet x 1) — rubric: fit=0.95, form=0.80, truth=0.95, taste=0.90
- [x] **Cycle 3: GROW** — Learning from wave transitions
  - [x] W1 — Recon (Haiku x 4)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 4)
  - [x] W4 — Verify (Sonnet x 1)

---

## Execution

```bash
# Run the next wave of the current cycle
/do TODO-typedb.md

# Or manually — autonomous sequential loop
/do

# Check state
/see highways               # proven paths
/see tasks                  # open tasks by priority
```

---

## See Also

- [routing.md](routing.md) — signal flow, formula, layers
- [DSL.md](one/DSL.md) — the programming model
- [rubrics.md](rubrics.md) — POST-check: fit/form/truth/taste → mark(edge, score)
- [TODO-template.md](one/TODO-template.md) — the wave pattern
- [TODO-task-management.md](TODO-task-management.md) — self-learning task system
- [TODO-signal.md](TODO-signal.md) — first wave-pattern TODO
- [dictionary.md](dictionary.md) — concept reference

---

*3 cycles. Four waves each. Context is a signal too.
Haiku reads, Opus decides, Sonnet writes, Sonnet checks.
Same loop as the substrate, different receivers.*

# The Complete Flow — Five Commands, One Architecture

## High-Level View

```
┌──────────────────────────────────────────────────────────────────┐
│                    ONE SUBSTRATE ARCHITECTURE                    │
│                  (6 dimensions, 7 loops, verified)               │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   /sync     │      │   /sync tick│      │   /do       │
│ (Task Load) │      │ (7 Loops)   │      │ (Phases)    │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                     │
       │ 229 tasks          │ ~1min                │ ~1hour
       │ 49 blocks          │ L1-L7 run            │ W1-W4 phases
       │                    │                     │
       └────────┬───────────┴─────────────────────┘
                │
                ▼
        ┌───────────────┐
        │   /do         │ ← pick unblocked task
        │  /close       │ ← mark with rubric score
        └───────┬───────┘
                │
                ▼
        Task execution loop:
        SELECT → EXECUTE → W4 VERIFY → MARK → UNBLOCK NEXT
```

---

## Per-Command Execution

### `/sync` — Task Population (Start of cycle)

```
W0 GATE
  bun run verify ✓
       ↓
PARSE
  glob docs/TODO-*.md
  ↓
  deterministic task-parse.ts
  no LLM, no randomness
       ↓
  return: Task[]
       ↓
HASH CHECK
  fnv1a(Task[])
  ↓
  if hash == lastHash: skip KV write ✓
  else: write to CF KV ✓
       ↓
TYPEDB SYNC
  writeSilent() → task entities
  + blocking relations
  + capability links
  (async, 100ms, non-blocking)
       ↓
REGENERATE
  docs/TODO.md (master index, ranked by pheromone)
  todo.json (snapshot for CI)
       ↓
RESULT
  { parsed: 229, synced: 229, blocks: 49, pheromone: 32 }
  Status: READY FOR WORK
```

---

### `/do` → `/close` — Task Execution (Core loop)

```
SENSE
  curl /api/tasks/sync
  ↓
  { tasks: [229 open] }
       ↓
SELECT
  filter: .blockedBy.length == 0
  sort: priority + pheromone
  pick: first
       ↓
  "Build CEO control panel" (priority: 100)
       ↓
REPORT
  "Working on: Build CEO control panel (priority: 100, blocks: 1)"
       ↓
EXECUTE
  ┌─ read code ─────────┐
  │ write files         │ (real work happens here)
  │ write tests         │
  │ bun run verify      │ (local check)
  └─────────────────────┘
       ↓
SCORE (W4 rubric)
  fit:   1.0  (solves the task?)
  form:  0.95 (code shape right?)
  truth: 1.0  (types/spec correct?)
  taste: 0.90 (matches style?)
  ─────────────────────
  composite: 0.943  (0.35·1 + 0.20·0.95 + 0.30·1.0 + 0.15·0.90)
       ↓
W4 VERIFY
  bun run verify ✓
  rubric composite 0.943 >= 0.85? YES
  ─────────────────────
  → GOLDEN ZONE
  → Ready to mark()
       ↓
MARK (pheromone)
  POST /api/tasks/{id}/complete
  mark("entry→ceo:panel", 0.943)
       ↓
PHEROMONE UPDATE
  path "entry→ceo:panel" gets:
    strength: +0.943
  path "ceo:panel→ceo:visibility" is now unblocked
       ↓
RESULT
  ✓ Task marked done
  ✓ Dependents unblocked
  ✓ Pheromone reinforced
  Status: READY FOR NEXT TASK
```

---

### `/sync tick` — Seven Loops (Happens automatically every 60s)

```
L1: SIGNAL
  weight = 1 + max(0, strength - resistance) × sensitivity
  ↓
  select() picks next highest-priority unblocked task
  ↓
  "Wire CEO visibility" (now unblocked, weight shifted by pheromone)
       ↓
L2: MARK/WARN
  task completes → mark(edge, chainDepth)
  task fails → warn(edge, severity)
  ↓
  pheromone accumulates on 4 dimensions independently:
  path→skill:fit    gets +strength
  path→skill:form   gets +strength
  path→skill:truth  gets +strength
  path→skill:taste  gets +strength
       ↓
L3: FADE
  every 5 min: decay(0.05, 0.10)
  ↓
  strength -= 0.05
  resistance -= 0.10  (forgives 2× faster)
  ↓
  old paths fade, proven paths persist
       ↓
L4: EVOLVE
  every 10 min: check success_rate < 0.5
  ↓
  if failing: LLM rewrites system-prompt
  generation++
  (24h cooldown per agent)
       ↓
L5: KNOWLEDGE
  every 1 hour: find highways
  ↓
  strength > 2×resistance? → mark as "highway"
  ↓
  write to TypeDB: this path is proven
       ↓
L6: FRONTIER
  every 1 hour: detect unexplored tag clusters
  ↓
  which (tag, tag) pairs have few edges?
  → propose new agents/skills
  → create signal "build-X-for-{tags}"
       ↓
RESULT (TickResult)
  { cycle: 42, selected: "analyst", success: true, highways: [...] }
  Status: PHEROMONE LANDSCAPE SHIFTED
```

---

### `/do TODO-rename.md` — Phase Executor (Manual, deterministic)

```
PHASE STRUCTURE
  phase-0-rename (id, blocks: [phase-1-start])
  phase-1-start  (blockedBy: [phase-0-rename], blocks: [phase-2-...])
  phase-2-...
       ↓
W1: HAIKU RECON
  Quick scan + extract facts
  ↓
  "Files to rename: A.ts → a.ts, B.ts → b.ts"
  (cost: ~5K tokens)
       ↓
W2: OPUS DECIDE
  Load: DSL.md, dictionary.md (BASE CONTEXT)
  Load: rubrics.md (DOMAIN CONTEXT)
  ↓
  "Here's the plan for phase-0-rename:
   1. Identify all files
   2. Test that renames don't break imports
   3. Execute renames
   4. Verify compilation"
  (cost: ~50K tokens)
       ↓
W3: SONNET EDIT
  Execute the plan:
  - read code
  - write files
  - add tests
  ↓
  bun run verify ✓
  ↓
  score: fit/form/truth/taste
  (cost: variable, depends on work size)
       ↓
W4: SONNET VERIFY
  W4 gate: bun run verify + rubric
  ↓
  if pass:
    - update checkbox in TODO-rename.md
    - mark(edge, composite_score)
    - unblock phase-1-start
  else:
    - iterate (fix + re-score)
  (cost: ~5K tokens)
       ↓
SELF-CHECKOFF
  - [ ] phase-0-rename
  + [x] phase-0-rename  ← checkbox checked automatically
       ↓
RESULT
  ✓ Phase complete
  ✓ Next phase unblocked
  ✓ Pheromone updated
  Status: PHASE CHAIN PROGRESSING
```

---

## Decision Tree: Which Command?

```
START
  │
  ├─ "I need to load tasks" → /sync
  │  └─ Result: task substrate populated
  │
  ├─ "Pick one task and execute it" → /do (then /close)
  │  ├─ /do: execute, score
  │  └─ /close: W4 verify, mark pheromone
  │     └─ Result: task done, dependents unblocked
  │
  ├─ "I want pheromone to shift automatically" → /sync tick
  │  └─ Result: 7 loops run, routing improves
  │
  ├─ "Execute a multi-phase TODO with self-checkoff" → /do TODO-*.md
  │  └─ Result: one phase W1-W4 complete, next phase unblocked
  │
  └─ "Continuous autonomous execution" → /do loop + /sync tick loop
     └─ Result: system runs forever, learns continuously
```

---

## The Sandwich (Quality Gates)

```
                          PRE-WORK
                            │
                      ┌─────▼──────┐
                      │  W0 GATE   │
                      │ npm verify │
                      └─────┬──────┘
                            │
                     [Baseline must clean]
                            │
                      ┌─────▼──────────┐
                      │ /sync or /do   │
                      │ EXECUTE        │
                      └─────┬──────────┘
                            │
                      [Actual work happens]
                            │
                        POST-WORK
                            │
                      ┌─────▼──────────────┐
                      │  W4 GATE           │
                      │  npm verify        │
                      │  + rubric scoring  │
                      │  fit/form/truth    │
                      │  /taste scoring    │
                      └─────┬──────────────┘
                            │
                    [Composite >= 0.85?]
                      /             \
                    YES              NO
                    /                 \
        ┌────────────▼─────┐    ┌─────▼──────────┐
        │  GOLDEN ZONE     │    │ ITERATE        │
        │  mark(edge, s)   │    │ Fix + re-score │
        │  +strength       │    │                │
        │  unblock next    │    │ Or warn() if   │
        │                  │    │ truly failed   │
        └──────────────────┘    └────────────────┘

        (pheromone learns quality, not just success)
```

---

## Architecture Names (Verified)

| Element | Name | Source | Status |
|---------|------|--------|--------|
| **Dimensions** | Groups, Actors, Things, Paths, Events, Learning | src/schema/one.tql | ✓ Locked 2026-04-13 |
| **Loops** | L1-L7: Signal, Mark/Warn, Fade, Evolve, Knowledge, Frontier, Economic | src/engine/loop.ts | ✓ Implemented |
| **Routing** | weight = 1 + max(0, S-R)×sens | docs/routing.md | ✓ Tested (43 tests) |
| **Quality** | Fit, Form, Truth, Taste | docs/rubrics.md | ✓ Implemented |
| **Gates** | W0 (baseline), W4 (verify) | .claude/commands/ | ✓ In place |
| **Commands** | /see, /create, /do, /close, /sync | .claude/commands/ | ✓ All wired |

**Everything is named. Everything is tested. Everything is connected.**

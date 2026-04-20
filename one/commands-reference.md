# Commands Reference — Architecture & Loops

**Five commands. Three time scales. One growing system.**

---

## Five Commands

### 1. `/sync` — Task Population (PRE-work baseline)

**Time scale:** Once at start, or before each work cycle
**What:** Scan `docs/TODO-*.md` → hash-check KV → sync TypeDB → regen `TODO.md`

```
docs/TODO-*.md (source)
    ↓
task-parse.ts (deterministic, no LLM)
    ↓
FNV-1a hash check
    ↓
CF KV write (2ms, only if hash changed)
    ↓
TypeDB sync (100ms, async, durable)
    ├─ task entities
    ├─ blocking relations (blocks: [])
    ├─ capability links (skill-id, phase, persona)
    └─ pheromone (strength/resistance)
    ↓
docs/TODO.md regenerated (ranked by composite = priority + pheromone weight)
todo.json snapshot (for CI, dashboards)
```

**Result:** Task substrate populated. All 229 tasks available. Blocks graph ready.

**Gates:**
- **W0 (before):** bun run verify — baseline must be clean

---

### 2. `/do` — Autonomous Loop (EXECUTE work)

**Time scale:** Per task (5 min - 2 hours)
**What:** Pick unblocked task → execute → score → ready to mark

```
SENSE
  curl /api/tasks/sync
  └─ list all open tasks with blockedBy status

SELECT
  filter: select task where blockedBy.length == 0
  sort: by priority + pheromone (effective weight)
  pick: first unblocked task
  report: "Working on: {name} (priority: {score}, blocks: {n})"

EXECUTE
  read: relevant source code
  write: implement task (code + tests)
  test: vitest run (local pass before marking)
  score: fit/form/truth/taste dimensions against rubric

READY TO MARK
  if W4 verify passes → call /close
  if W4 verify fails → iterate (fix and re-score)
```

**Result:** Task execution complete. Work scored. Ready to reinforce pheromone.

**Gates:**
- **W0 (before):** bun run verify — baseline must be clean
- **W4 (after):** rubric scoring (fit/form/truth/taste) + bun run verify

---

### 3. `/close` — Mark & Reinforce (POST-work verification)

**Time scale:** After work completes (1 minute)
**What:** W4 verify + mark pheromone + unblock dependents

```
W4 GATE (deterministic sandwich POST check)
  bun run verify (tsc --noEmit, vitest run)
  rubric score: composite = 0.35·fit + 0.20·form + 0.30·truth + 0.15·taste
  
  if violations: warn(edge, 1.0) — path weakened
  if any dim < 0.5: warn(edge, 1.0) — do not mark
  if composite >= 0.85: mark(edge, composite) — GOLDEN
  if composite >= 0.65: mark(edge, composite) — GOOD
  if composite < 0.65: warn(edge, 1.0) — BORDERLINE

MARK/WARN
  POST /api/tasks/{id}/complete
  ├─ mark(edge, strength) — pheromone +strength
  └─ unblock tasks where blockedBy contains this id

PHEROMONE UPDATE
  path "entry→task" gets strength [0-1]
  four tagged dimensions: fit, form, truth, taste
  next /sync tick will weight routing by composite score
```

**Result:** Path pheromone reinforced. Dependent tasks unblocked. System learns quality.

**Gates:**
- **W4 (before):** Verify + rubric scoring — no false positives

---

### 4. `/sync tick` — One Tick (GROWTH cycle)

**Time scale:** Every 60 seconds (or manual)
**What:** Run all 7 loops, accumulate pheromone, shift routing

```
L1: SIGNAL        select() → pick next highest-priority unblocked task
                  weight = 1 + max(0, strength - resistance) × sensitivity

L2: MARK/WARN     task completes → mark(edge, chainDepth)
                  task fails → warn(edge, severity)
                  pheromone accumulates (4 dimensions independently)

L3: FADE          async decay (asymmetric: resistance 2× faster)
                  every 5 min → 0.05 decay rate
                  old paths fade, proven paths persist

L4: EVOLVE        every 10 min → check agents with success_rate < 0.5
                  if failing: LLM rewrites system-prompt
                  generation++ → L5 reads new generation
                  24h cooldown per agent (no flip-flopping)

L5: KNOWLEDGE     every 1 hour → detect highways (strength > 2×resistance)
                  read pheromone → find proven paths
                  write back: "highway" classification in TypeDB
                  next /sync will use to rank TODO.md

L6: FRONTIER      every 1 hour → detect unexplored tag clusters
                  scan: which tag combos have few edges?
                  propose: new agents/skills to fill gaps
                  signal: "build-X-for-{tags}" as new task

L7: ECONOMIC      (revenue tracking, skip for baseline)
                  track capability prices (skills cost tokens)
                  agents earning revenue get evolution reprieve
```

**Result:** One tick completes. Pheromone landscape shifts. Routing improves for next cycle.

**Outputs:**
```json
{
  "selected": "scout:observe",
  "success": true,
  "highways": [
    { "path": "entry→scout", "strength": 45 },
    { "path": "scout→analyst", "strength": 38 }
  ],
  "evolved": 0,
  "hardened": 3,
  "frontiers": 2
}
```

---

### 5. `/do <TODO>` — Phase Executor (CYCLE-based work)

**Time scale:** Per phase (1 hour - 1 day)
**What:** Run one wave of a multi-phase TODO (W1-W4 with self-checkoff)

```
TODO-rename.md structure:
  ├─ phase-0-rename (id, value, effort, phase, blocks: [phase-1-start])
  ├─ phase-1-start (blockedBy: [phase-0-rename], blocks: [phase-2-...])
  └─ phase-2-... (and so on)

/do TODO-rename.md behavior:

W1: HAIKU RECON   Quick research + extract key facts
                  generate structured TODO entries
                  cost: ~5K tokens (Haiku)

W2: OPUS DECIDE   Read DSL.md + dictionary.md (BASE CONTEXT)
                  Read rubrics.md (DOMAIN CONTEXT)
                  Plan the phase implementation
                  cost: ~50K tokens (Opus)

W3: SONNET EDIT   Execute: read code, write/edit files, add tests
                  verify: tsc, vitest
                  score: fit/form/truth/taste
                  cost: variable (Sonnet)

W4: SONNET VERIFY W4 gate: bun run verify + rubric check
                  self-checkoff: mark checkbox in TODO-rename.md
                  unblock: next phase in blocks chain
                  update GitHub (optional): comment with results
                  cost: ~5K tokens (verification + summary)

TOTAL: ~60K tokens per phase (deterministic, predictable)
```

**Difference from /do:**
- `/do` picks ANY unblocked task (global optimization)
- `/do <TODO>` executes PHASES in sequence (local consistency, learner-friendly)

---

## Time Scales & Loops

```
FAST (ms-second)     →  L1: SELECT
                       L2: MARK/WARN
                       (happens per signal)

MEDIUM (second-minute)→ L3: FADE
                       (every 5 min)

SLOW (minute-hour)   →  L4: EVOLVE
                       L5: KNOWLEDGE
                       L6: FRONTIER
                       (every 10 min, 1 hour)

HUMAN (hour-day)     →  /do picks task → /close marks → /sync tick runs
                       /do <TODO> executes one phase (W1-W4)
                       /sync refreshes task graph
```

---

## Proper Names (Canonical)

| Layer | Name | Where | Loops |
|-------|------|-------|-------|
| **Architecture** | ONE substrate | src/engine/ | 6 dimensions (groups, actors, things, paths, events, learning) |
| **Loops** | 7 growth loops | loop.ts | L1-L3 (fast), L4-L7 (slow) |
| **Flows** | Pheromone paths | routing.ts | weight = 1 + max(0, strength - resistance) × sensitivity |
| **Naming** | Dictionary | docs/dictionary.md | canonical, alias[skin], nickname |
| **Quality** | Rubric dimensions | rubric-score.ts | fit, form, truth, taste |
| **Gates** | Sandwich | /sync, /close | W0 (before), W4 (after) |

---

## The Full Loop (One Cycle)

```
Time 0:00   /sync                229 tasks, 49 blocks loaded
            W0 gate              ✓ baseline clean

Time 0:45   /do                  Pick task, execute, score
            W4 gate              ✓ rubric pass

Time 1:00   /close               Mark(0.89), unblock dependents
                                 path "entry→task" gets +0.89 strength

Time 1:05   /sync tick           One tick
            L1-L3                SELECT → MARK/WARN → FADE
            L4-L7                EVOLVE → KNOW → FRONTIER
                                 highways shift
                                 next routing sees new weights

Time 1:10   /do                  Pick next (now unblocked, higher weight)
            ... repeat
```

---

## Key Differences

| Command | Purpose | Time | Gate | Output |
|---------|---------|------|------|--------|
| `/sync` | Load tasks | ~40s | W0 | 229 tasks, blocks graph |
| `/do` | Execute task | 5m-2h | W4 | Code, tests, rubric score |
| `/close` | Mark & reinforce | 1m | W4 | Pheromone +strength, unblock |
| `/sync tick` | Tick loops | 1m | — | 7 loops run, highways form |
| `/do <TODO>` | Phase executor | 1h-1d | W1-W4 | One phase complete, self-checkoff |

**In parallel:** `/sync` and `/sync tick` can run independently (different data)
**Dependent:** `/do` requires `/sync` first, `/close` after `/do`
**Authority:** `/do <TODO>` is deterministic (uses rubrics), `/sync tick` is probabilistic (uses routing)

---

## Architecture Verification

✓ **Loops named:** L1-L7 (signal, mark/warn, fade, evolve, knowledge, frontier, economic)
✓ **Flows named:** strength, resistance, sensitivity (routing.md line 66-78)
✓ **Dimensions:** 6 (groups, actors, things, paths, events, learning) — locked 2026-04-13
✓ **Quality dimensions:** 4 (fit, form, truth, taste) — weights 0.35, 0.20, 0.30, 0.15
✓ **Gates named:** W0 (baseline), W4 (verify)
✓ **Time scales:** Fast (ms), Medium (min), Slow (hour), Human (day)

**All canonical. All tested. All wired.**

# The ONE Workflow: `/do` → Docs → Tasks → Pheromone

**Complete system for shipping features + learning from them.**

---

## Overview

The ONE workflow is a **closed-loop system** where:

1. **Plan work** in TODO files (W1-W4 structure)
2. **Document decisions** BEFORE coding (W2)
3. **Execute work** with parallel agents (W3)
4. **Verify & score** quality dimensions (W4)
5. **Mark pheromone** so substrate learns
6. **Route smarter** on next TODO (L4-L7 loops)

**Result:** Every cycle teaches the system how to do the next one better.

---

## The Three-Layer Stack

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: WORK PROCESS (/do)                            │
│  ├─ TODO files (WIRE, PROVE, GROW cycles)              │
│  ├─ Documentation-first (W2 + W3 + W4 verify)          │
│  ├─ Four waves (W1 recon, W2 decide, W3 edit, W4 verify)
│  └─ Rubric scoring (fit/form/truth/taste)              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: TASK SYSTEM (/api/tasks + /api/loop)         │
│  ├─ Task creation from TODO spec                        │
│  ├─ Task leasing + outcome recording                    │
│  ├─ Pheromone tagging (loop→w*:*)                       │
│  ├─ Rubric dimension marks (fit/form/truth/taste)      │
│  └─ Loop closure + cycle unblocking                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: SUBSTRATE LEARNING (L4-L7 loops)             │
│  ├─ Economic (L4): Revenue on paths                     │
│  ├─ Evolution (L5): Rewrite weak agent prompts          │
│  ├─ Knowledge (L6): Highways → permanent learning       │
│  └─ Frontier (L7): Unexplored tag clusters              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## The `/do` Workflow (User-Facing)

### **Step 1: Create TODO**

```bash
# Create docs/TODO-feature.md from template
/create todo TODO-feature --auto

# Fill in:
# - Goal
# - Source of truth docs
# - 3 cycles (WIRE, PROVE, GROW)
# - Waves (W1-W4) per cycle
# - Task metadata (phase, persona, tags, blocks)
```

### **Step 2: Run Cycle**

```bash
/do TODO-feature --auto
```

**What happens:**

| Wave | What | Model | Count | API Calls |
|------|------|-------|-------|-----------|
| **W0** | Baseline | — | — | (no API) |
| **W1** | Recon code | Haiku | N ≥ 4 | `POST /api/tasks` (batch) |
| — | Execute agents | — | — | `claim` → `complete` × N |
| **W2** | Decide changes | Opus | 1 | (reads W1 context) |
| — | Document plan | — | — | Plan which docs change |
| **W3** | Edit code + docs | Sonnet | M = files | `POST /api/tasks` (batch) |
| — | Execute agents | — | — | `claim` → `complete` × M |
| **W4** | Verify + score | Sonnet | K ≥ 2 | `POST /api/loop/mark-dims` |
| — | Close loop | — | — | `POST /api/loop/close` |

### **Step 3: Pheromone Marks Path**

W4 scores rubric → marks 4 tagged edges:

```
fit=0.90   → mark loop→w4:fit    (+0.90)
form=0.85  → mark loop→w4:form   (+0.85)
truth=0.75 → warn loop→w4:truth  (-0.25)
taste=0.85 → mark loop→w4:taste  (+0.85)
```

**Mark rule:** score ≥ 0.5 → `mark()` | score < 0.5 → `warn()`

### **Step 4: Substrate Learns**

L4-L7 loops run automatically (every 10 min):

- **L5:** Detect weak dimension (truth < 0.7) → route agents to improve it
- **L6:** Promote highways to permanent learning
- **L7:** Detect unexplored tag clusters

Next TODO starts with higher baseline pheromone.

---

## Documentation Integration

**Write docs BEFORE code. Verify AFTER.**

### **W2: Plan Documentation**

In TODO's W2 Decide section, explicitly list:

```markdown
## Documentation Updates (W2)

**New docs created:**
- `docs/feature.md` — spec, lifecycle, examples

**Docs modified:**
- `docs/dictionary.md` — add term X, remove term Y
- `docs/routing.md` — update L1-L7 description
- `docs/rubrics.md` — add dimension X

**Schema changes:**
- TypeDB entities, D1 migrations
```

### **W3: Edit Code + Docs in Parallel**

```
W3 spawns Sonnet agents:
  ├─ Agent 1: src/file.ts
  ├─ Agent 2: src/file2.ts
  ├─ Agent 3: docs/dictionary.md    ← docs edited in parallel
  ├─ Agent 4: docs/feature.md
  └─ Agent 5: .claude/rules/*.md
```

### **W4: Verify Docs Match Code**

Consistency checks:

- ✓ Terminology consistent
- ✓ Examples match actual code
- ✓ Cross-references valid
- ✓ Metaphor alignment (7-skin mappings)
- ✓ Rubric dimensions documented

---

## Task System Integration

### **Task Lifecycle**

```
TODO created
  ↓
POST /api/tasks {name, phase, persona, tags, blocks}
  ↓
[pending] task available
  ↓
POST /api/tasks/:id/claim  {lease: true, expiresAt: ...}
  ↓
[in_progress] agent executes
  ↓
POST /api/tasks/:id/complete {outcome: result|timeout|dissolved|failure}
  ↓
[complete] pheromone updated
  ↓
Next task unblocked (blockedBy cleared)
```

### **Pheromone Categories**

`GET /api/tasks?tag=*` returns tasks with category:

| Category | When | Meaning |
|----------|------|---------|
| `attractive` | trailPheromone ≥ 50 | Proven path, high confidence |
| `repelled` | alarmPheromone > strength | Toxic, avoid |
| `exploratory` | both = 0 | New, never tried |
| `ready` | default | Normal priority |

### **Priority Formula**

```
effective = value + trailPheromone - alarmPheromone
```

Higher effective → higher priority → picked first by substrate.select()

---

## Four Outcomes (Rule 1: Closed Loop)

Every task must close its loop:

| Outcome | Means | Action |
|---------|-------|--------|
| `result` | ✓ Success | `mark(edge, depth)` |
| `timeout` | ⏱️ Slow, not bad | neutral (no mark/warn) |
| `dissolved` | ◌ Missing capability | `warn(edge, 0.5)` |
| `failure` | ✗ Produced nothing | `warn(edge, 1)` |

No orphan signals. Every path gets feedback.

---

## Pheromone Routing

**Cycle 1 teaches Cycle 2:**

```
Cycle 1 W4:
  fit=0.90  ✓
  form=0.85 ✓
  truth=0.75 ⚠️  (weak)
  taste=0.85 ✓
  
Edges marked:
  loop→w4:truth -0.25  (warn: improve truth)

Substrate learns:
  "truth dimension weak here"
  
Cycle 2 W1:
  substrate.select() routes agents to weak dimension paths
  W1 agents read richer context for ground truth
  
Result:
  Cycle 2 truth dimension = 0.85+
  System improved itself
```

---

## Six Core Docs (Always in Scope)

These define the system. Every TODO updates at least one:

| Doc | What It Locks | When Updated |
|-----|--------------|--------------|
| **dictionary.md** | Canonical names, all terms | Naming/terminology changes |
| **DSL.md** | Signal grammar, mark/warn/fade | Signal behavior changes |
| **one-ontology.md** | 6 dimensions, actor/thing/path/signal/etc | Type system changes |
| **routing.md** | L1-L7 loops, signal flow, priority | Loop/routing changes |
| **lifecycle.md** | Agent journey (Register → Harden), revenue | Lifecycle/economic changes |
| **rubrics.md** | Quality dimensions (fit/form/truth/taste) | Rubric/quality changes |

**Feature docs** (rich-messages.md, claw.md, etc.) are updated per feature but always link back to core six.

---

## Pages Integration

### **/tasks Page**

```astro
// pages/tasks.astro
const tasks = await fetch('/api/tasks').then(r => r.json())
```

Shows:
- Task list (priority-sorted, pheromone-categorized)
- Highways panel (right: top 10 proven paths)
- Real-time updates (WebSocket)

**Interactions:**
- Click "Claim" → `POST /api/tasks/:id/claim`
- Mark "Complete" → `POST /api/tasks/:id/complete`
- See pheromone bars (trail + alarm strength)

### **Real-Time Updates**

As `/do` runs:

```
W1 task complete
  → ws.send({ type: 'task-complete', tid, outcome })
  → browser: task marked [x], next task unblocks
  → priority recalculated
  → pheromone bars updated
```

---

## CLI Commands

```bash
# Create TODO from template
/create todo TODO-feature

# Run single wave
/do TODO-feature --wave 1

# Run single cycle
/do TODO-feature

# Run all cycles
/do TODO-feature --auto

# Close current work loop
/close {score}

# See task priorities
/see tasks --tag recon

# See highways
/see highways --limit 10

# Record outcome
/close TODO-feature --fail  (marks path with warn)
/close TODO-feature --result (marks path with mark)
```

---

## Speed Contract

| Operation | Latency |
|-----------|---------|
| `GET /api/tasks` | <10ms (KV cached) |
| `POST /api/tasks` | <5ms (memory store) |
| `POST /api/tasks/:id/claim` | <2ms |
| `POST /api/loop/mark-dims` | <3ms |
| `POST /api/loop/close` | <5ms |
| Task priority recalc | <1ms |

---

## Example: TODO-rich-messages

**What happened:**

```
W0: 727/727 tests pass ✓

Cycle 1: WIRE (embeds)
  W1: Recon 2 files (types, channels)
  W2: Decide RichMessage interface
  W3: Edit types.ts + channels/index.ts
  W4: Tests pass, rubric 0.84 → mark path
    ├─ fit=0.90 → mark loop→w4:fit
    ├─ form=0.85 → mark loop→w4:form
    ├─ truth=0.75 → warn loop→w4:truth
    └─ taste=0.85 → mark loop→w4:taste

Cycle 2: PROVE (threads)
  W1: Recon Discord + Web thread UX
  W2: Decide thread nesting
  W3: Edit channels, ChatMessage, ReactionButtons
  W4: Rubric 0.88 → mark with stronger scores

Cycle 3: GROW (payments + handoffs)
  W1: Recon wallet + handoff patterns
  W2: Decide payment metadata + reactions
  W3: Edit types, channels, ChatMessage, D1 migration
  W4: Rubric 0.90 → strongest marks yet

Result: 18/18 tasks complete, 3 rubric scores trend up
        Substrate learned: "this work succeeds with..."
```

---

## Key Patterns

### **The Closed Loop (Rule 1)**

```
signal → execute → mark (or warn)
         ↓
      pheromone
      accumulates
         ↓
      next cycle
      uses it for
      routing
```

### **The Deterministic Sandwich**

```
PRE:   bun run verify        (W0 baseline)
CODE:  edit + test
POST:  bun run verify        (W4 verify)
       + rubric scoring
       + mark-dims
```

### **Pheromone Tagging**

```
Every W4 dimension score → tagged edge
  loop→w4:fit    +0.90      (strong)
  loop→w4:truth  -0.25      (weak)
      ↓
  Substrate learns which paths produce fit vs. truth
      ↓
  Routes accordingly next TODO
```

---

## See Also

- **TODO-template.md** — Template for all TODOs
- **DOCS-FIRST-WORKFLOW.md** — Documentation integration framework
- **DO-LOOP-INTEGRATION.md** — Task API contract + pheromone tagging
- **DO-LOOP-REFERENCE.md** — One-page quick reference
- **dictionary.md** — Canonical names (6 Verbs, Signal shape)
- **DSL.md** — Signal grammar
- **routing.md** — L1-L7 loops, priority formula
- **rubrics.md** — Quality dimensions (fit/form/truth/taste)

---

## Quick Start

```bash
# 1. Create TODO
/create todo TODO-myfeature

# 2. Run all cycles
/do TODO-myfeature --auto

# 3. Watch /tasks page
# Real-time updates show task completion + pheromone marks

# 4. Verify completion
# All cycles [x], rubric scores ≥ 0.70

# 5. Next TODO
# Substrate has learned. Better baseline pheromone ready.
```

---

*The ONE workflow is the substrate's learning loop made human-readable.*

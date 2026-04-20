---
name: tutorial
description: Walk a human and an agent through the complete ONE substrate lifecycle — birth to knowledge.
user-invocable: true
allowed-tools: Bash(*), Read(*), Edit(*), Write(*), Glob(*), Grep(*), WebFetch(*)
---

# /tutorial — The Complete Lifecycle

Interactive walkthrough of the ONE substrate. Seven phases. The API does the work.

**Prerequisite:** Dev server running (`bun run dev` / `bun dev` at localhost:4321).

## How It Works

The teacher is a real agent in the substrate. Each phase executes real operations.
Student progress is real pheromone on real paths. The API tracks everything.

## Walkthrough Flow

Walk the user through all 7 phases sequentially. For each phase:

1. **Execute** — Call the tutorial API to run the phase
2. **Show** — Display what happened (actions taken, state changes)
3. **Explain** — Help the user understand what the substrate learned
4. **Pause** — Ask if they want to continue to the next phase

### Before Starting

Check progress for any previous sessions:

```bash
curl -s http://localhost:4321/api/tutorial?student=claude-code | jq .
```

### Phase Execution

For each phase N (1 through 7):

```bash
curl -s -X POST http://localhost:4321/api/tutorial \
  -H 'Content-Type: application/json' \
  -d '{"phase": N, "student": "claude-code"}' | jq .
```

### The Seven Phases

| Phase | Title | What It Does |
|-------|-------|-------------|
| 1 | Birth | Creates the echo agent from markdown → TypeDB |
| 2 | Signal | Sends `entry→echo` signal, marks the path |
| 3 | Learn | Marks 5x, warns 1x — shows strength vs resistance |
| 4 | Decay | Runs asymmetric fade — resistance forgives 4x faster |
| 5 | Highway | Marks 20x — proves the path, shows LLM skip |
| 6 | Evolve | Queries struggling units, shows evolution criteria |
| 7 | Know | Shows hypotheses, frontiers, highways — the substrate's self-knowledge |

### After Each Phase

Show the user:
- **Actions**: What the API actually did (created units, marked paths, etc.)
- **State**: The relevant substrate state after the operation
- **Progress**: How far through the tutorial they are (0% → 100%)
- **Next**: What phase comes next

### The Biological Parallel

Weave this through the conversation:

```
Birth   = ant hatches
Signal  = ant follows pheromone
Learn   = ant deposits pheromone
Decay   = pheromone evaporates
Highway = trail becomes superhighway
Evolve  = colony adapts behavior
Know    = colony discovers optimal foraging
```

### Completion

After phase 7, show final progress:

```bash
curl -s http://localhost:4321/api/tutorial?student=claude-code | jq .
```

Summarize the complete loop:

```
BIRTH → SIGNAL → LEARN → DECAY → HIGHWAY → EVOLVE → KNOW
  │                                                    │
  └────────────────────────────────────────────────────┘
```

The substrate teaches about itself by using itself. No returns.

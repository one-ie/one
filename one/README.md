# ONE

**Signal. Mark. Warn. Follow. Fade. Highway.**

The universal substrate for emergence. Two dictionaries. Arithmetic. One probabilistic step.

---

## The Primitive

```typescript
type Signal = { receiver: string; data?: unknown }
```

Two fields. Everything else emerges.

---

## The Pattern

```
Ants:      chemical signal  →  pheromone trail  →  foraging highway
Neurons:   electrical spike →  synapse weight   →  memory trace
Markets:   price signal     →  volume           →  trend
Agents:    digital signal   →  path strength    →  proven route
```

Same pattern. Same substrate. Same emergence.

---

## The Two Locked Rules

1. **Closed loop** — every signal closes: `mark()` on result, `warn()` on failure, `dissolve` on missing. No silent returns, no orphan signals.
2. **Structural time only** — plan in **tasks → waves → cycles**, never days/hours/weeks. Width scales by tasks-per-wave, depth by waves-per-cycle, learning by cycles-per-path.

Compounding requires both. Without rule 1, paths don't learn. Without rule 2, learning can't be measured in substrate-native units.

---

## The Power

**The LLM is the only probabilistic component. Everything else is math.**

```
Traditional AI:  AI filter → AI router → AI model → AI scorer → AI filter
                 Five probabilistic layers. 99% each = 95% system accuracy.

ONE substrate:   TypeDB check → LLM → outcome measurement
                 One probabilistic step. Everything else is deterministic.
```

Three things no one has combined before:

1. **The system makes itself unnecessary.** Every LLM success creates a deterministic path. Highways don't need the LLM. Cost drops over time. The world replaces the LLM.

2. **Security and learning are the same mechanism.** `warn()` is simultaneously a firewall (resistance → toxic → dissolve) and a lesson (world routes around → finds alternatives). No separate security layer.

3. **The strength IS the model.** `mark()` = weight update. `warn()` = negative reward. `fade()` = regularization. `select()` = inference. No training pipeline. Usage IS training.

---

## The 6 Dimensions

| # | Dimension | What | TypeDB | Runtime |
|---|-----------|------|--------|---------|
| 1 | **Groups** | Scope, hierarchy | group, membership | tag-based |
| 2 | **Actors** | Who acts | unit (model, prompt, generation) | `.add()` |
| 3 | **Things** | What's offered | skill + tags + price | `.on()` handler |
| 4 | **Paths** | Connections | path (strength, resistance, revenue) | strength/resistance maps |
| 5 | **Events** | What happened | signal (data, amount, success) | signal flow |
| 6 | **Knowledge** | What emerged | hypothesis, frontier, objective | know/recall |

---

## The Interface

```typescript
import { world } from '@/engine'

const w = world()

// Actors receive signals
w.actor('translator', 'llm')
  .on('translate', async ({ text, to }) => translate(text, to))
  .then('translate', r => ({ receiver: 'reviewer:check', data: r }))

w.actor('reviewer', 'agent')
  .on('check', async ({ text }) => review(text))

// Signal moves through the world
w.signal({ receiver: 'translator:translate', data: { text: 'hello', to: 'es' } })
// → translator runs → .then fires → reviewer runs
// → mark() on each delivery → paths strengthen
// → fade() over time → unused paths dissolve
// → highways emerge → proven routes

// Ask and get a typed outcome
const { result, timeout, dissolved } = await w.ask(
  { receiver: 'translator:translate', data: { text: 'hello' } }
)

// Query what emerged
w.highways(10)       // proven paths
w.open(10)           // top paths as {from, to, strength}
w.blocked()          // toxic paths (resistance > 2x strength)
w.know()             // promote highways to permanent knowledge
w.recall('translate') // query hypotheses from TypeDB
```

---

## The Engine (670 lines)

```
src/engine/
├── substrate.ts  (226)   Unit + Colony + pheromone + queue + ask
├── one.ts        (187)   World = Colony + TypeDB + deterministic sandwich
├── loop.ts       (164)   Growth tick: 7 loops, chain depth, 4 outcome types
├── boot.ts        (40)   Hydrate + spawn + tick
├── llm.ts         (40)   LLM as unit (anthropic/openai)
└── index.ts       (13)   Exports
```

## The Schema (~300 lines)

```
src/schema/
└── one.tql               6 dimensions + validation functions + classification
    entities:             group, unit, skill, hypothesis, frontier, objective
    relations:            path, capability, membership, signal, hierarchy, adds
    validation:           can_receive, is_safe, preflight, unit_exists, is_trustworthy
    classification:       path_status, unit_classification, needs_evolution
    routing:              suggest_route, optimal_route, cheapest_provider
```

---

## The Tick

Every tick makes the colony smarter:

```
L1  select() → ask() → { result | timeout | dissolved }    per tick
L2  mark(edge, chainDepth) or warn(edge)                   per outcome
L3  fade(0.05) — resistance decays 2x faster                    every 5 min
L4  revenue += price on successful paths                    per payment
L5  evolve: rewrite prompts (24h cooldown, history saved)   every 10 min
L6  know + auto-hypothesize (strong/fading paths)    every hour
L7  frontier detection from unexplored tag clusters         every hour
```

---

## Claude Code Integration

**The `/do` workflow is your interface to the substrate.** See [WORKFLOW.md](one/WORKFLOW.md) for complete guide.

```
/see     tasks              open work sorted by priority         L1
/see     highways           proven paths (strength ≥ 50)         L2
/see     frontiers          unexplored tag clusters              L7
/create  task <name>        atomic task into TypeDB              L1
/create  todo <doc>         TODO from template (Haiku extract)   L1
/do      <TODO-file>        advance next wave                    L1
/do      <TODO> --auto      run all cycles (W1→W4 continuously) L1
/do                         autonomous loop: pick → execute → mark L1
/do      --once             single task iteration                L1
/close   <task-id>          mark() success, unblock dependents   L2
/close   <task-id> --fail   warn(1) — full failure               L2
/sync                       tick + scan docs + todos + agents    L3-L7
/sync    tick               fire all L1-L7 loops                 L1-L7
```

**The `/do` loop:**
1. Plan work in TODO (W1-W4 cycles)
2. Document decisions (W2: which docs change)
3. Execute in parallel (W3: code + docs together)
4. Verify & score (W4: rubric feeds pheromone)
5. Substrate learns (L4-L7: next TODO routes smarter)

---

## Documentation

### Execution (The `/do` Workflow)

| Doc | What |
|-----|------|
| [WORKFLOW.md](one/WORKFLOW.md) | **Master guide.** How `/do` TODO cycles ship features + teach the substrate. W1-W4 structure, pheromone tagging, task API, docs-first integration. Start here. |
| [TODO-template.md](one/TODO-template.md) | Template for all TODOs. Cycle structure, wave pattern, documentation updates section. |
| [DOCS-FIRST-WORKFLOW.md](DOCS-FIRST-WORKFLOW.md) | Documentation integration framework. Write docs W2, edit W3, verify W4. Six core docs always in scope. |
| [DO-LOOP-INTEGRATION.md](DO-LOOP-INTEGRATION.md) | `/api/tasks` + `/api/loop/mark-dims` contract. How W4 rubric scores mark pheromone edges. Task lifecycle + priority formula. |
| [DO-LOOP-REFERENCE.md](DO-LOOP-REFERENCE.md) | One-page quick reference. API calls per wave, outcomes, speed contract. |

### Core

| Doc | What |
|-----|------|
| [llms.md](llms.md) | The deterministic sandwich. Why the LLM is the only probabilistic component. |
| [llm-training.md](llm-training.md) | Five integration points. Training IS routing. |
| [task-management.md](task-management.md) | Tasks as signals. Tags classify. Pheromone ranks. |
| [loops.md](one/loops.md) | Seven nested feedback loops. |
| [events.md](one/events.md) | The universal primitive. |
| [one-ontology.md](one-ontology.md) | The 6 dimensions. |
| [claude-code-integration.md](one/claude-code-integration.md) | Claude Code as a unit in the colony. |

### Architecture

| Doc | What |
|-----|------|
| [substrate-learning.md](substrate-learning.md) | How pheromone IS the model. |
| [metaphors.md](metaphors.md) | Ant, brain, team, market skins. |
| [patterns.md](one/patterns.md) | Pheromone, routing, task selection, evolution. |
| [DSL.md](one/DSL.md) | The ONE language — five verbs. |

### Strategy

| Doc | What |
|-----|------|
| [strategy.md](one/strategy.md) | The ant play — three fronts. |
| [one-protocol.md](one-protocol.md) | Protocol layer. |
| [revenue.md](one/revenue.md) | Five revenue layers. |
| [SUI.md](SUI.md) | Move contracts — linearity, enforcement. |

---

## The Truth

```
A signal lands.
The path remembers.
Another signal follows.
The trail deepens.
A highway emerges.

No one decided.
The world learned.

The LLM bootstrapped it.
The colony replaced it.
Intelligence is the elimination of guessing.
```

---

*ONE. Two fields. Two dictionaries. Arithmetic. Emergence.*

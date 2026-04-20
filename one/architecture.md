# Architecture

Source of truth: `src/schema/one.tql`

---

## TypeDB is the Substrate

TypeDB is not storage. It is the signal relay, the router, and the brain.

```
signal IN → TypeDB → suggest_route() → signal OUT → agent executes → signal IN
```

The router process on each machine is dumb hands. TypeDB decides where signals go
based on pheromone. Multiple machines, one TypeDB instance = one shared world.

## World

```
┌─────────────────────────────────────────────────────────┐
│                        ONE World                         │
│                                                          │
│  1. GROUPS     group         — personas, teams, colonies │
│  2. ACTORS     unit          — humans, agents, LLMs      │
│  3. THINGS     task          — work + services (x402)    │
│  4. PATHS      path          — weighted connections      │
│  5. EVENTS     signal        — who sent what, paid what  │
│  6. KNOWLEDGE  hypothesis,   — inferred beliefs & goals  │
│                frontier,                                 │
│                objective                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Dimension 1: Groups

```
entity group
  owns sid @key, name, purpose, group-type, status, created
  plays hierarchy:parent, hierarchy:child, membership:group
```

`group-type`: "persona", "team", "colony", "dao"

Swarms nest via `hierarchy(parent, child)`. Units join via `membership(group, member)`.

---

## Dimension 2: Actors

```
entity unit
  owns uid @key, name, unit-kind, wallet, status, balance, reputation
  owns success-rate, activity-score, sample-count
  owns model, system-prompt, generation
  owns created
```

`unit-kind`: "human", "agent", "llm", "system"

Every actor in the system is a unit. Humans and agents are peers.
Units have brains (`model`, `system-prompt`) that can evolve (`generation`).

---

## Dimension 3: Things

```
entity task
  owns tid @key, name, description, task-type, status, priority, phase
  owns importance, price, currency, timeout
  owns attractive, repelled    (INFERRED)
```

A task with `price > 0` is a service. No separate entity needed.

`task-type`: "work", "explore", "validate", "build", "inference", "analysis", "data", "compute"

`phase`: "wire", "tasks", "onboard", "commerce", "intelligence", "scale"

---

## Dimension 4: Paths

### path (unit ↔ unit)

```
relation path
  relates source, target
  owns strength, resistance, traversals, revenue, last-used, fade-rate, path-status
```

- `strength` — mark() adds weight on success
- `resistance` — warn() adds weight on failure
- `fade-rate` — per-path decay rate (production=0.05, support=0.15, resistance=2x)
- `revenue` — sum of x402 payments on this path
- `path-status` — INFERRED: "highway" | "fresh" | "fading" | "toxic"

### Other relations

```
capability(provider: unit, offered: skill)  owns price
membership(group: group, member: unit)      owns joined-at
hierarchy(parent: group, child: group)
```

Tasks are `.on()` handlers. Dependencies are `.then()` continuations.
Trails are strength map entries. No separate TypeDB entities needed.

---

## Dimension 5: Events

```
relation signal
  relates sender: unit, receiver: unit
  owns data, amount, success, latency, ts
```

Signals are free. Tasks cost money (x402). `amount > 0` = payment.

---

## Dimension 6: Knowledge

```
entity hypothesis    owns hid @key, statement, hypothesis-status, observations-count, p-value, action-ready
entity frontier      owns fid @key, frontier-type, frontier-description, expected-value, frontier-status
entity objective     owns oid @key, objective-type, objective-description, priority-score, progress, objective-status
relation spawns      relates frontier, objective
entity contribution  owns contribution-id @key, impact-score, contribution-type
relation contribution-event  relates contributor-unit, contribution
```

Hypotheses: `pending → testing → confirmed | rejected`
Frontiers: `unexplored → exploring → exhausted`
Objectives: `pending → active → complete`

---

## Two Layers of Learning

### 1. Substrate Learning (colony gets smarter)

```
signal succeeds → mark(path)  → strength++  → more signals routed here → highway
signal fails    → warn(path)  → resistance++     → fewer signals routed     → toxic
time passes     → fade(rate)  → strength--  → stale paths dissolve
```

The world learns which paths work. Individual agents unchanged.

### 2. Agent Self-Improvement (ant gets smarter)

```
unit does 100 tasks → success-rate drops → needs_evolution() fires
→ agent rewrites own system-prompt → generation++ → agent performs better
→ optional: model upgraded ("haiku" → "sonnet" → "opus")
```

The substrate provides the signal (who is failing). The agent evolves itself.

---

## Classification Functions

| Function | Input | Output | Trigger |
|----------|-------|--------|---------|
| `path_status(path)` | strength, resistance, traversals | "highway" / "fresh" / "active" / "fading" / "toxic" | Routing decisions |
| `unit_classification(unit)` | success-rate, activity-score, sample-count | "proven" / "active" / "at-risk" | Trust & routing |
| `is_action_ready(hypothesis)` | confirmed + p-value <= 0.05 + n >= 50 | boolean | Knowledge → action |
| `needs_evolution(unit)` | success-rate < 0.50 + sample-count >= 20 | boolean | Agent self-improvement |

---

## Routing Functions

| Function | What it does |
|----------|--------------|
| `highways(threshold, min_traversals)` | All paths above strength threshold |
| `optimal_route($from, $task)` | Best unit for task via path strength |
| `cheapest_provider($task)` | Cheapest unit that can do task |
| `suggest_route($from, $task)` | Top 5 candidates with strength scores |
| `proven_units()` | All units with "proven" status |
| `skills_by_tag($tag)` | Skills matching a tag |
| `collaborators($me)` | Peers in same group |

---

## Router Pattern

The process running on each machine:

```
1. Write signal to TypeDB
2. Read next destination FROM TypeDB (suggest_route)
3. Load agent config from unit entity (model, system-prompt)
4. Execute agent prompt
5. Write result as new signal to TypeDB
6. mark() or warn() the path based on outcome
7. Go to 2
```

The router doesn't decide. It follows the pheromone.

---

## Multi-Machine Collaboration

```
Machine A (Tony)                    Machine B (David)
┌──────────┐                        ┌──────────┐
│  Hermes  │──signal──→ TypeDB ←──signal──│ Theodore │
│ (router) │←─route───→   ↕   ←──route──│ (router) │
└──────────┘           paths &       └──────────┘
                       paths
```

Each machine runs one router. TypeDB is shared. Pheromone builds across machines.
The substrate learns end-to-end paths regardless of which machine runs which agent.

---

## Vocabulary

```
signal = { receiver, data }     — the universal primitive
mark(path)                      — add weight (success)
warn(path)                      — add resistance (failure)
fade(rate)                      — decay all weights
emit(signal)                    — send from inside a task handler
```

---

## Entities

group, unit, task, hypothesis, frontier, objective, contribution

## Relations

hierarchy, path, capability, membership, signal, spawns, contribution-event

---

*Source of truth: `src/schema/one.tql`. Everything else derives from it.*

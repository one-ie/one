# Patterns

Source of truth: `src/schema/one.tql`

---

## 6 Lessons from Deborah Gordon

The schema encodes six patterns observed in ant colonies.

| Lesson | Principle | Schema implementation |
|--------|-----------|----------------------|
| L1 | Classification | Multi-attribute tiers: `unit_classification()` uses success-rate + activity + samples |
| L2 | Quality Rules | Automatic status bands: `path_status()`, `trail_status()` |
| L3 | State Machines | Lifecycle transitions: hypothesis `pending → testing → confirmed → action-ready` |
| L4 | Negation | Ready = todo AND no incomplete blockers: `ready_tasks()`, `is_attractive()` |
| L5 | Aggregates | Contribution tracking: `total_contribution()`, `total_revenue()`, `highway_count()` |
| L6 | Emergence | Frontier detection, autonomous goals: `promising_frontiers()`, `active_objectives()` |

---

## Pattern 1: Pheromone Loop

The core feedback cycle. No agent decides. The substrate learns.

```
signal succeeds
  → mark(path)           strength++
  → mark(trail)          trail-pheromone++
  → more signals routed  traversals++
  → highway emerges      path-status = "highway"

signal fails
  → warn(path)           resistance++
  → warn(trail)          resistance-pheromone++
  → fewer signals routed
  → path goes toxic      path-status = "toxic"

time passes
  → fade(rate)           strength *= (1 - fade-rate)
  → stale paths dissolve path-status = "fading"
  → new paths compete
```

### Thresholds (from schema functions)

**Paths:**
| Status | Condition |
|--------|-----------|
| highway | strength >= 50 |
| fresh | strength 10–50, traversals < 10 |
| fading | strength 0–5 |
| active | everything else (default) |
| toxic | resistance > strength, resistance >= 10 |

**Trails:**
| Status | Condition |
|--------|-----------|
| proven | pheromone >= 70, completions >= 10, failures < completions |
| fresh | pheromone 10–70, completions < 10 |
| active | everything else (default) |
| fading | pheromone 0–10 |
| dead | pheromone <= 0 |

**Units:**
| Status | Condition |
|--------|-----------|
| proven | success-rate >= 0.75, activity >= 70, samples >= 50 |
| at-risk | success-rate < 0.40, activity >= 25, samples >= 30 |
| active | everything else |

---

## Pattern 2: Routing by Pheromone

The router doesn't decide. It asks TypeDB.

```
suggest_route($from, $task)
  → find all units connected to $from via path
  → filter: unit has capability for $task
  → sort by path strength descending
  → return top 5
```

Three routing strategies from the schema:

| Function | Strategy | When to use |
|----------|----------|-------------|
| `optimal_route` | Strongest path with capability | Default: follow the highway |
| `cheapest_provider` | Lowest price with capability | Budget-constrained: minimize cost |
| `suggest_route` | Top 5 by strength | Exploration: show options |

---

## Pattern 3: Task Selection

How an agent picks what to work on:

```
ready_tasks()          → todo + no incomplete blockers
attractive_tasks()     → ready + strong inbound trail pheromone (>= 50)
repelled_tasks()       → resistance pheromone > trail pheromone (>= 30)
exploratory_tasks()    → ready + no trail history at all
```

The ant doesn't choose. The pheromone chooses:
- **Attractive** = other ants succeeded on this path. Group here.
- **Repelled** = resistance >= 30 AND resistance > trail pheromone. Avoid.
- **Exploratory** = no trail at all. Unknown territory. Send scouts.

---

## Pattern 4: Agent Self-Improvement

Two layers. Substrate learns (colony). Agent evolves (individual).

### Substrate learning (automatic)

Every signal updates pheromone. No agent action needed.
```
success → mark()  → path strengthens → more traffic → highway
failure → warn()  → path weakens     → less traffic → toxic/fading
time    → fade()  → decay            → stale paths dissolve
```

### Agent evolution (triggered)

```
needs_evolution($u)
  → success-rate < 0.50 AND sample-count >= 20
  → agent rewrites own system-prompt
  → generation++
  → optional: model upgrade ("haiku" → "sonnet" → "opus")
```

The substrate provides the signal. The agent decides how to evolve.

---

## Pattern 5: Negation (L4)

Ready is not just "todo". It's todo AND no incomplete blockers.

```tql
fun ready_tasks() -> { task }:
    match $t isa task, has status "todo";
          not { $dep(dependent: $t, blocker: $b) isa dependency;
                $b isa task, has status $bs; not { $bs == "complete"; }; };
    return { $t };
```

Same for `is_attractive`: todo + no blockers + trail pheromone >= 50.

Double negation: "not exists a blocker that is not complete." This is how ants
gate behavior on the absence of a condition, not just its presence.

---

## Pattern 6: Knowledge Lifecycle (L3)

Hypotheses are state machines:

```
pending → testing → confirmed → action-ready
                  → rejected
```

`is_action_ready`: confirmed + p-value <= 0.05 + observations >= 50.

The system forms beliefs, tests them, and only acts when statistically confident.
This is L3 — state transitions driven by evidence, not commands.

---

## Pattern 7: Emergence (L6)

Frontiers and objectives are not assigned. They're detected.

```
promising_frontiers()
  → unexplored + expected-value >= 0.5
  → expected-value = potential * probability / cost

frontier spawns → objective
  → pending → active → complete
```

The system identifies its own opportunities and creates its own goals.
No human assigns a frontier. The substrate notices gaps and generates them.

---

## Pattern 8: Differential Fade

Not all paths decay equally. `fade-rate` is per-path.

| Path type | fade-rate | Why |
|-----------|-----------|-----|
| Production | 0.05 | Proven paths should persist |
| Support | 0.15 | Support paths should refresh faster |
| Alarm | 2x base | Failures should be forgotten faster than successes |

This prevents the system from holding grudges forever while keeping
proven highways stable.

---

## Pattern 9: Economics (x402)

A task with `price > 0` is a service. Revenue flows through paths.

```
signal(sender: A, receiver: B, amount: 0.01)
  → path(A, B).revenue += 0.01
  → revenue is pheromone: paying paths become highways
```

Three economic queries:
- `cheapest_provider($task)` — minimize cost
- `priced_tasks($type)` — find all paid services of a type
- `total_revenue()` — GDP of the colony

Revenue = pheromone. Every payment strengthens a path.

---

## Pattern 10: Group Collaboration

```
collaborators($me)
  → find all swarms $me belongs to
  → find all other members of those swarms
  → return peers
```

Units discover each other through shared membership, not direct addressing.
You don't need to know who's in your team. The substrate knows.

```
swarm_members($swarm_name)  → all units in a named group
membership(group, member)   → the relation
hierarchy(parent, child)    → group nesting
```

---

## Composition

Patterns compose. A typical signal flow touches multiple:

```
1. ready_tasks()           → L4 negation selects work
2. attractive_tasks()      → L4 pheromone ranks it
3. suggest_route()         → Routing finds the best agent
4. signal(sender, receiver)→ Event recorded
5. mark() or warn()        → Pheromone loop updates
6. unit_classification()   → L1 reclassifies agent
7. needs_evolution()       → Agent evolves if struggling
8. fade()                  → Time decays all paths
9. promising_frontiers()   → L6 detects new opportunities
```

Nine steps. All driven by the substrate. No orchestrator.

---

*10 patterns. 6 lessons. One schema. The ant doesn't decide — it follows the trail.*

# Primitives

Source of truth: `src/schema/one.tql`

---

## The Signal

```
{ receiver, data }
```

Two fields. That's all that flows. Everything else derives from this.

- `receiver` — who gets it (`"unit"`, `"unit:task"`, or `"world:tag"` — see [signals.md](signals.md))
- `data` — anything (JSON string in TypeDB)

Signals are free. Attach `amount > 0` and it's a payment (x402).

---

## Five Verbs

| Verb | What it does | Schema effect |
|------|-------------|---------------|
| `emit(signal)` | Send from inside a task handler | Creates `signal` relation |
| `mark(path)` | Reinforce on success | `strength++` on path, `trail-pheromone++` on trail |
| `resistance(path)` | Resist on failure | `resistance++` on path, `resistance-pheromone++` on trail |
| `fade(rate)` | Decay over time | `strength *= (1 - fade-rate)` on all paths |
| `follow(trail)` | Go where pheromone is strongest | Read `suggest_route()` from TypeDB |

Five verbs. No others needed.

---

## Seven Entities

| Entity | Key | What it is |
|--------|-----|------------|
| `group` | sid | A group: persona, team, colony, dao |
| `unit` | uid | An actor: human, agent, llm, system |
| `task` | tid | Work with optional price (task + price = service) |
| `hypothesis` | hid | A belief being tested |
| `frontier` | fid | An unexplored opportunity |
| `objective` | oid | A goal being pursued |
| `contribution` | contribution-id | An impact record |

---

## Ten Relations

| Relation | Connects | Purpose |
|----------|----------|---------|
| `signal` | unit → unit | Event: who sent what, paid what |
| `path` | unit ↔ unit | Pheromone between actors |
| `trail` | task → task | Pheromone between work steps |
| `capability` | unit → task | Who can do what, at what price |
| `assignment` | task → unit | Who is doing what now |
| `dependency` | task → task | What blocks what |
| `membership` | group ↔ unit | Who belongs where |
| `hierarchy` | group ↔ group | Nesting |
| `spawns` | frontier → objective | Knowledge creates goals |
| `contribution-event` | unit → contribution | Who did what |

---

## Pheromone (the learning primitive)

Two weights on every connection:

| | Success | Failure |
|---|---|---|
| **path** (unit↔unit) | `strength` | `resistance` |
| **trail** (task→task) | `trail-pheromone` | `resistance-pheromone` |

Both decay. `fade-rate` is per-path (production=0.05, support=0.15, resistance decays 2x).

The cycle:
```
mark    → strength++    → more signals routed   → highway
resistance   → resistance++       → fewer signals routed  → toxic
fade    → strength--    → stale paths dissolve
nothing → silence       → signal dissolves (zero returns)
```

---

## Unit (the actor primitive)

### Identity
`uid`, `name`, `unit-kind`, `wallet`

### Performance (substrate measures)
`success-rate`, `activity-score`, `sample-count`, `reputation`, `balance`

### Brain (agent evolves)
`model`, `system-prompt`, `generation`

### Lifecycle
`status`: "active" → "proven" or "at-risk" (inferred by `unit_classification`)

A unit with `unit-kind: "human"` has no model or system-prompt.
A unit with `unit-kind: "agent"` has both. The substrate tells it when to evolve.

---

## Task (the work primitive)

### Identity
`tid`, `name`, `description`, `task-type`

### Economics
`price` (0 = free, >0 = paid service), `currency` ("SUI", "USDC", "FET"), `timeout`

### Priority
`priority` ("P0"–"P3"), `importance` (1–10), `phase`

### Selection (inferred)
`attractive` — strong inbound trail, no blockers. Ants group here.
`repelled` — resistance pheromone dominates. Ants avoid.

---

## Status Values

| Entity | Statuses |
|--------|----------|
| unit | "active", "proven", "at-risk" |
| task | "todo", "in_progress", "complete", "blocked", "failed" |
| path | "highway", "fresh", "active", "fading", "toxic" |
| trail | "proven", "fresh", "active", "fading", "dead" |
| hypothesis | "pending", "testing", "confirmed", "rejected" |
| frontier | "unexplored", "exploring", "exhausted" |
| objective | "pending", "active", "complete" |

---

## Type Values

| Attribute | Values |
|-----------|--------|
| `unit-kind` | "human", "agent", "llm", "system" |
| `group-type` | "persona", "team", "colony", "dao" |
| `task-type` | "work", "explore", "validate", "build", "inference", "analysis", "data", "compute" |
| `contribution-type` | "task", "signal", "payment", "discovery" |
| `phase` | "wire", "tasks", "onboard", "commerce", "intelligence", "scale" |

---

*7 entities. 10 relations. 5 verbs. 2 fields. One schema.*

# DSL

The ONE language. Two fields, passed hand to hand, forever.

> **Verified:** 194 tests prove signal flow, mark/warn/fade, select/follow,
> ask (4 outcomes), .then() chains, tag subscription, isToxic sandwich.
> `bun vitest run`

---

## The Signal

```typescript
{ receiver: 'scout:observe', data: { tick: 42 } }
```

That's it. `receiver` says who. `data` says what. A signal arrives at an agent.
The agent does its work. Then it sends the next signal. That signal arrives
at the next agent. Who does its work. And sends.

Sometimes an agent knows who's next. Sometimes it doesn't — and shouldn't.

```
Known chain:                        Emergent:
scout → analyst → reporter          scout returns finding
  each names the next                 world picks who gets it
  pipeline, declared                  discovery, learned
```

Both are valid. Both deposit pheromone. The difference is who decides the next hop.

---

## How It Flows

### Known Chain

When the flow is a pipeline — A always feeds B — the agent names the receiver:

```typescript
const scout = w.add('scout')
  .on('observe', ({ tick }, send) => {
    const finding = analyze(tick)
    send({ receiver: 'analyst:process', data: finding })
    return finding
  })

const analyst = w.add('analyst')
  .on('process', ({ finding }, send) => {
    const result = classify(finding)
    send({ receiver: 'reporter:summarize', data: result })
    return result
  })
```

Signal in. Work. Signal out. The agent decides where.

### Emergent Routing

When you want the world to learn, the agent just returns. No send. No hardcoded receiver.
The tick loop uses `select()` to pick the next agent based on pheromone:

```typescript
const scout = w.add('scout')
  .on('observe', ({ tick }) => {
    return analyze(tick)   // just return — world decides what's next
  })

// The tick loop:
const next = w.select()                          // weighted by strength - resistance
next && w.signal({ receiver: next, data: result })
```

Signal in. Work. Result out. The world decides where.

For explicit discovery — where the producer names the work type rather than
letting the tick loop pick — use `world:tag` addressing. See [signals.md](signals.md).

### When to Use Which

- **Known chain**: the flow is a pipeline. Scout always feeds analyst. Use `send()` or `.then()`.
- **Emergent**: you want the world to optimize. Return results, let `select()` route.
  The substrate discovers the best paths through experience.

Both deposit pheromone. Both participate in mark/warn/fade.
Known chains build highways fast. Emergent routing finds highways you didn't design.

The `send` function is how an agent speaks to a known receiver.
`select()` is how the world speaks — routing toward strength, away from resistance.
The receiving agent doesn't know who sent it (unless it checks `ctx.from`). Loose coupling either way.

---

## The Path It Leaves

Every signal that lands marks pheromone on the path it traveled.

```
scout sends to analyst → path "scout→analyst:process" gets +1 strength
analyst sends to reporter → path "analyst→reporter:summarize" gets +1 strength
```

Do this a hundred times and the paths become highways. The world remembers
which chains work — not because anyone told it, but because signals kept flowing.

```typescript
w.highways(5)
// [
//   { path: 'scout→analyst:process', strength: 94.2 },
//   { path: 'analyst→reporter:summarize', strength: 87.1 },
//   { path: 'entry→scout:observe', strength: 82.5 },
//   ...
// ]
```

---

## What Happens When It Fails

A signal arrives. The agent fails. No pheromone marked. If you explicitly
warn the path, resistance accumulates instead:

```typescript
w.warn('scout→bad-analyst:process')
```

Resistance builds up. The path goes toxic. `follow()` avoids it.
Future signals route around the failure — automatically.

```
success → mark(path)   → strength++    → highway emerges
failure → warn(path)   → resistance++  → path goes toxic
silence → nothing      → signal dissolves (zero returns)
```

No exceptions. No error handlers. The world just routes around.

---

## What Happens Over Time

Paths fade. Without fresh signals reinforcing them, strength decays.

```typescript
w.fade(0.05)   // everything loses 5%
```

Resistance fades 2x faster. The system forgives failures sooner than it forgets successes.
Unused paths dissolve. Active paths persist. The world's memory is always fresh.

```
MARK                   FADE
  │                     │
  ▼                     ▼
strength++         strength *= 0.95
  │                     │
  ▼                     ▼
more signals       reroute
  │                     │
  ▼                     ▼
HIGHWAY            dissolve
```

---

## The Weight — What Accumulates

Strength and resistance are the substrate's words. Every metaphor has
its own word for the same thing — the substance that builds up on paths:

|           | The substance   | Depositing it        | It builds into | It fades by |
| --------- | --------------- | -------------------- | -------------- | ----------- |
| **ONE**   | weight          | mark / warn          | highway        | fade        |
| **Ant**   | pheromone       | deposit / alarm      | trail          | evaporation |
| **Brain** | synaptic weight | potentiate / inhibit | pathway        | decay       |
| **Team**  | reputation      | commend / flag       | go-to person   | forgetting  |
| **Mail**  | stamps          | stamp / return       | express route  | archiving   |
| **Water** | sediment        | carve / dam          | river          | drying      |
| **Radio** | signal power    | boost / jam          | clear channel  | attenuation |

The pattern is universal:

```
something accumulates on a connection over time
  → positive: the connection gets used more
  → negative: the connection gets avoided
  → without use: it fades
  → survivors become the proven paths
```

The substrate doesn't pick a metaphor. It just says **strength** and **resistance**.

---

## Roles

A task with context baked in. Same handler, different perspective:

```typescript
w.add('monitor')
  .on('check', ({ target }, send) => {
    const status = ping(target)
    send({ receiver: 'alert', data: { target, status } })
  })
  .role('check-db', 'check', { target: 'database' })
  .role('check-api', 'check', { target: 'api' })
```

`.role(name, task, ctx)` creates a named task that delegates to an existing handler
with pre-bound context. The signal's data merges on top:

```
signal { receiver: 'monitor:check-db' }
  → runs check with { target: 'database' }

signal { receiver: 'monitor:check-db', data: { timeout: 5000 } }
  → runs check with { target: 'database', timeout: 5000 }
```

Roles don't add logic. They add perspective.

---

## Continuations

Instead of each agent deciding who to send to, you can declare the chain at setup:

```typescript
w.add('scout')
  .on('observe', ({ tick }) => ({ data: tick }))
  .then('observe', result => ({ receiver: 'analyst', data: result }))
```

The `.then()` fires automatically after the task returns. The agent doesn't
even need to call `send`. The continuation carries the signal forward.

Signal in. Work. Signal out. Declared once, runs forever.

---

## Zero Returns

The most important design decision: no errors.

A signal arrives at a unit that doesn't exist? Nothing happens.
A signal hits a handler that isn't defined? Nothing happens.
An agent has nothing to say? Nothing happens.

The world continues. Silence is valid. The signal dissolves.

```typescript
// Good — conditional flow
target && target(sig)
task?.(data, send, ctx)

// Bad — never
if (!target) throw new Error(...)
```

This is how ant colonies work. An ant drops pheromone, no one follows it,
the path evaporates. No exception thrown. No error logged. The world moves on.

---

## The Six Verbs

| Verb | What it does | Effect |
|------|--------------|--------|
| `send(signal)` | Agent passes signal to the next | Signal moves |
| `mark(path)` | Strengthen on success | Path gains strength |
| `warn(path)` | Resist on failure | Path gains resistance |
| `fade(rate)` | Decay everything | Stale paths dissolve |
| `follow(type)` | Ask where strength is highest | Route decision (deterministic) |
| `select(type, exploration?)` | Weighted random with exploration bias | Route decision (stochastic) |

`follow` always picks the highway. `select` explores — sometimes the strongest,
sometimes a random path. Real ants do both. `exploration` controls the bias
(0 = always strongest, 1 = pure random, default 0.3).

Six operations. The signal flows. The path remembers. The world learns.

---

## Addressing

Five address modes:

```
alice             → direct unit, default skill
alice:review      → direct unit, named skill
world:review      → substrate picks unit with "review" skill
world:review+P0   → substrate picks unit with both tags
world             → strongest outgoing highway (rare)
```

Direct for commitment. `world:` for discovery. See [signals.md](signals.md) for
the full grammar, resolution flow, and cold-miss path.

---

## Signal Data Shape

```typescript
data = { tags, weight, content }
```

By convention, every `data` payload uses three named slots:

| Field | Default | Meaning |
|-------|---------|---------|
| `tags` | `[]` | Routing + classification. `world:review+P0` addressing reads these. |
| `weight` | `1` | Pheromone on delivery. `> 0` = mark. `< 0` = warn. |
| `content` | `undefined` | The payload. Rubric scores, task bodies, API responses — anything. |

```typescript
// Plain delivery (weight 1, untagged)
send({ receiver: 'analyst:process', data: { content: finding } })

// Tagged + weighted (rubric mark)
send({ receiver: 'world', data: { tags: ['fit'], weight: 0.9, content: { dim: 'fit', score: 0.9 } } })

// Observe without leaving pheromone
send({ receiver: 'x', data: { marks: false } })

// Override mark weight
send({ receiver: 'x', data: { weight: 5 } })
```

`marks: false` is for sensors, monitors, health checks — signals that should
flow through the world without reinforcing any path.

**Scheduling:** an `after` timestamp tells `drain()` to skip until that time.

```typescript
net.enqueue({
  receiver: 'slack:post',
  data: { channel: '#standup', text: summary },
  after: new Date('2026-04-14T09:00:00Z').getTime()  // fires at 9am Monday
})
```

---

## Edit-as-Signal

The world itself can be edited by sending signals. Renaming is the canonical example:

```typescript
// Signal to rename a unit (edit-as-signal)
w.signal({
  receiver: 'world:rename',
  data: {
    id: 'scout',        // unit id (never changes)
    name: 'scout-fast', // new human-readable name (can change)
    by: 'user'          // who made the edit
  }
})
```

Renaming is an edit gesture like all others on `/world`. The unit `id` (e.g., `"scout"`) remains canonical for routing — signals always address `"scout"`. The `name` is metadata that can be edited by the group owner. Signals stay routed by canonical id; humans see updated names. Same pattern applies to other edits (recolor, retag, reclassify): the id persists, the skin changes.

---

## The World

The container that signals move through.

```typescript
const w = world()

// Lifecycle
const scout = w.add('scout')       // create unit
const analyst = w.add('analyst')
w.remove('old-scout')              // unit stops receiving. paths remain, fade naturally

// Signal enters the world
w.signal({ receiver: 'scout:observe', data: { tick: 42 } })

// Route
w.follow('analyst')      // best route to any analyst (deterministic)
w.select('analyst')      // weighted random route (stochastic, exploration=0.3)
w.select('analyst', 0.1) // mostly follow highways, rarely explore

// Query what emerged
w.highways(10)           // strongest paths
w.sense('a→b')           // read strength on a path
w.danger('a→b')          // read resistance on a path

// Introspection
w.has('scout')           // unit exists?
w.list()                 // all unit ids
w.get('scout')           // direct unit access
```

State is two maps: `strength` (what worked) and `resistance` (what failed).
Everything else — highways, routing, toxicity — derives from these.

Matching is exact. `follow('analyst')` matches `scout→analyst:process`
but `follow('an')` matches nothing. The world doesn't guess.

---

## The World (with Persistence)

When you need durable memory and learning — not just signal flow:

```typescript
import { world } from '@/engine'

const w = world()

// 1. Groups — scope and isolation
w.group('research', 'team')

// 2. Actors — who receives signals (persisted to TypeDB)
const scout = w.actor('scout', 'agent', { group: 'research' })
  .on('observe', ({ tick }, send) => {
    send({ receiver: 'analyst:process', data: analyze(tick) })
  })

// 3. Things — skills with optional price
w.thing('daily-scan', { tags: ['research', 'P0'] })

// 4. Paths — strengthen or resist
w.flow('scout', 'analyst').strengthen()
w.path('scout', 'bad-analyst').resist()   // path = alias for flow

// 5. Events — automatic from signals

// 6. Learning — durable patterns that survive fade
await w.know()                // promote strong paths → learning. returns new insights
await w.recall()              // all learned patterns
await w.recall('analyst')     // patterns involving analyst

// Queries — live pheromone (ephemeral, fades)
w.open(10)                    // strongest flows
w.best('analyst')             // best actor by net strength
w.proven()                    // reliable actors (strength >= 20)
w.blocked()                   // toxic paths (resistance > strength)
w.confidence('analyst')       // strength / (strength + resistance)
```

Learning vs queries: `open()`, `best()`, `proven()` read live pheromone — they
fade. `know()` snapshots strong patterns into durable learning that persists
even after pheromone decays. `recall()` reads that learning. Working memory vs
long-term memory.

---

## TypeDB as Relay

In production, the world persists to TypeDB. TypeDB is the brain.
The router process is dumb hands. TypeDB decides where signals go.

```
1. Signal arrives → write to TypeDB
2. suggest_route($from, $task) → TypeDB returns best destination
3. Load unit config (model, prompt) → from TypeDB
4. Execute agent → LLM call
5. Result becomes new signal → write to TypeDB
6. mark() or warn() the path → update TypeDB
7. Goto 2
```

Multiple machines, one TypeDB instance. The pheromone is shared.
Machine A's scout strengthens a path that Machine B's router follows.

### Routing Functions

```tql
suggest_route($from, $task)     → top 5 by path strength
optimal_route($from, $task)     → single best
cheapest_provider($task)        → lowest price with capability
highways(threshold, min)        → all strong paths
```

### Classification Functions

```tql
path_status($path)              → "highway" | "fresh" | "active" | "fading" | "toxic"
path_status($path)              → "proven" | "fresh" | "active" | "fading" | "dead"
unit_classification($unit)      → "proven" | "active" | "at-risk"
needs_evolution($unit)          → boolean (success-rate < 0.50, samples >= 20)
is_attractive($task)            → boolean (strong path + no blockers)
is_repelled($task)              → boolean (resistance > path pheromone)
```

---

## The Agent Evolves

A unit isn't just a handler. It has a brain.

```
unit.model          → "haiku", "sonnet", "opus"
unit.prompt         → the instructions (mutable)
unit.generation     → how many times it's rewritten itself
```

The world watches. When success-rate drops below 0.50 after 20+ samples,
`needs_evolution()` fires. The agent reads its own failures, rewrites its
prompt, increments `generation`. The signal told it to improve. The agent
decided how.

Two layers of learning:
- **World** — pheromone on paths. The world gets smarter.
- **Agent** — prompt evolution. The individual gets smarter.

---

## Economics

Signals are free. What they trigger costs money.

A task with `price > 0` is a service. Every payment strengthens the path:

```
signal(A → B, amount: 0.01) → path(A,B).revenue += 0.01
```

Revenue is pheromone. Paying paths become highways. The world routes
toward value — not because it was told to, but because money leaves a path.

---

## Seven Loops

The signal flow nests into deeper loops, each at a slower timescale:

```
L1  SIGNAL      ms             signal arrives, agent acts, sends
L2  TRAIL       seconds        task sequences gain pheromone
L3  FADE        periodic       all weights decay
L4  ECONOMIC    per payment    revenue reinforces paths
L5  EVOLUTION   20+ samples    agent rewrites its own prompt
L6  LEARNING    50+ obs        hypotheses confirmed or rejected
L7  FRONTIER    weeks          system detects what it doesn't know
```

Faster loops produce data. Slower loops produce wisdom.
The signal loop is the muscle. The frontier loop is the mind.

---

## Status Thresholds

### Paths (unit-to-unit)

| Status | Condition |
|--------|-----------|
| highway | strength >= 50 |
| fresh | strength 10-50, traversals < 10 |
| active | default |
| fading | strength 0-5 |
| toxic | resistance > strength AND resistance >= 10 |

### Task Paths (task-to-task)

Tasks use the 7-state machine. These are `task-status` values on `thing` entities:

| Status | Condition | Pheromone |
|--------|-----------|-----------|
| `open` | ready to pick | — |
| `blocked` | blocker task not `verified` | — |
| `picked` | agent has claimed it | — |
| `done` | result returned; W4 pending | mark(+depth) |
| `verified` | rubric ≥ 0.65 | mark(score×5) |
| `failed` | no result (not timeout) | warn(1) |
| `dissolved` | missing unit/capability | warn(0.5) |

**Wave → model routing** (every task's `task-wave` attr selects the executor):

| Wave | Model | Purpose |
|------|-------|---------|
| W1 | Haiku | Recon — fast parallel reads |
| W2 | Opus | Decide — reasoning and tradeoffs |
| W3 | Sonnet | Edit — code and doc synthesis |
| W4 | Sonnet | Verify — consistency + rubric |

`task-id` format: `{plan-slug}:{cycle}:{role}{index}` — e.g. `loop-close:1:e3`, `loop-close:3:e2.b` (variant B).

### Units (actors)

| Status | Condition |
|--------|-----------|
| proven | success-rate >= 0.75, activity >= 70, samples >= 50 |
| active | default |
| at-risk | success-rate < 0.40, activity >= 25, samples >= 30 |

---

## Metaphor Aliases

The DSL doesn't care what you call things. Same flow, different words:

| DSL         | Ant        | Brain       | Team      | Water      | Radio      |
| ----------- | ---------- | ----------- | --------- | ---------- | ---------- |
| unit        | ant        | neuron      | agent     | pool       | receiver   |
| world       | nest       | network     | team      | watershed  | network    |
| send        | forage     | fire        | delegate  | flow       | transmit   |
| mark        | deposit    | potentiate  | commend   | carve      | boost      |
| warn        | alarm      | inhibit     | flag      | dam        | jam        |
| fade        | evaporate  | decay       | forget    | dry        | attenuate  |
| follow      | smell      | sense       | query     | trace      | scan       |
| select      | wander     | stochastic  | explore   | branch     | tune       |
| add         | hatch      | grow        | hire      | dig        | tune       |
| remove      | die        | apoptosis   | fire      | dry up     | deregister |
| highways    | trails     | pathways    | go-tos    | rivers     | channels   |
| know        | imprint    | consolidate | document  | settle     | lock       |
| recall      | recognize  | remember    | consult   | resurface  | replay     |
| role        | caste      | receptor    | hat       | tributary  | preset     |

The signal doesn't change. The data doesn't change.
Only the words humans use to describe it.

---

## Source

| File | What |
|------|------|
| `src/engine/world.ts` | `unit()`, `world()`, pheromone |
| `src/engine/persist.ts` | `world()`, 6 dimensions, TypeDB persistence |
| `src/schema/world.tql` | Schema, functions, classification |

---

*Signal in. Work. Signal out. The path remembers. The world learns.*

---

## See Also

- [dictionary.md](dictionary.md) -- Complete naming guide; see **Command Set** for the five user-facing verbs (/see /create /do /close /sync)
- [routing.md](routing.md) -- How signals find their way
- [events.md](one/events.md) -- The universal primitive in depth
- [primitives.md](primitives.md) -- Entities, relations, status values
- [patterns.md](one/patterns.md) -- 10 patterns from 6 lessons
- [architecture.md](one/architecture.md) -- TypeDB as substrate, router pattern
- [loops.md](one/loops.md) -- Seven nested feedback loops
- [metaphors.md](metaphors.md) -- Same DSL, different vocabularies
- [buy-and-sell.md](buy-and-sell.md) -- `data.weight` as payment: how the signal grammar is also the commerce protocol
- [revenue.md](one/revenue.md) -- What every `signal()`, `mark()`, and `follow()` is worth at scale

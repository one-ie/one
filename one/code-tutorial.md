# Code Tutorial: The Unified Substrate

**70 lines of engine. Six dimensions. One signal. Complete system.**

This document teaches you everything about ONE — from the signal primitive to multi-species groups to on-chain knowing.

---

## Table of Contents

1. [The Philosophy](#1-the-philosophy)
2. [The Signal](#2-the-signal)
3. [The Engine](#3-the-engine)
4. [Six Dimensions](#4-six-dimensions)
5. [The TypeDB Schema](#5-the-typedb-schema)
6. [How Signals Flow](#6-how-signals-flow)
7. [How Learning Happens](#7-how-learning-happens)
8. [Multi-Species Agents](#8-multi-species-agents)
9. [Persistence](#9-persistence)
10. [The Commercial Layer](#10-the-commercial-layer)
11. [Patterns](#11-patterns)
12. [On Sui](#12-on-sui)
13. [Quick Reference](#13-quick-reference)

---

## 1. The Philosophy

```
Everything that receives a signal is a unit.
Everything we learn is stored on paths.
The substrate doesn't care WHAT flows through it.
It only cares WHERE things go and WHAT WORKS.
```

### Zero Returns

Positive flow only. Missing handler? Signal dissolves. Group continues.

```typescript
// Good: conditional execution
target && target(sig)

// Bad: error throwing
if (!target) throw new Error(...)
```

### The Biological Proof

```
100M years ago:   Ants discovered it     → 25% of terrestrial biomass
500M years ago:   Neurons discovered it  → consciousness
10K years ago:    Humans discovered it   → civilization
Now:              Agents discover it     → ???
```

Five operations. Emergence guaranteed:
1. **Signal** — something moves
2. **Drop** — success leaves weight
3. **Follow** — traverse weighted path
4. **Fade** — unused paths decay
5. **Highway** — heavily-used paths become known

---

## 2. The Signal

The universal primitive. Two fields. Everything else emerges.

```typescript
type Signal = {
  receiver: string      // "unit" or "unit:task"
  data?: unknown        // anything
}
```

### Receiver Format

```
"scout"           → signal to scout's default task
"scout:observe"   → signal to scout's observe task
"payment:stripe"  → signal to payment unit's stripe task
```

### Examples

```typescript
// Simple
{ receiver: 'scout', data: { tick: 42500 } }

// With task
{ receiver: 'scout:observe', data: { tick: 42500 } }

// Complex data
{ receiver: 'payment:stripe', data: {
  amount: 1000,
  currency: 'usd',
  metadata: { order_id: 'abc123' }
}}
```

### Why "Data"

```
payload  → military, technical, launching missiles
data     → universal, what everything carries

Ants leave data (chemical information)
Neurons pass data (patterns)
Agents exchange data
Everyone says "send data"
```

---

## 3. The Engine

### Unit

A unit processes signals. 

```typescript
unit(id, route?)
  .on(name, fn)           // define task
  .then(name, template)   // define continuation
  .role(name, task, ctx)  // context-bound task
  .has(name)              // introspection
  .list()                 // all task names
  .id                     // identity
```

#### Task Signature

```typescript
(data, emit, ctx) => result

data   // the signal data
emit   // (signal) => void — fan out
ctx    // { from: string, self: string }
```

Every task knows who it is and who called it:

```typescript
.on('observe', (data, emit, ctx) => {
  // ctx.from = "entry" (who sent the signal)
  // ctx.self = "scout:observe" (my full address)

  // Reply to sender
  emit({ receiver: ctx.from, data: { response: 'done' } })
})
```

#### Continuations

Defined at setup, executed after task completes:

```typescript
.on('observe', ({ tick }) => ({ data: tick }))
.then('observe', r => ({ receiver: 'analyst', data: r }))
```

Templates are functions. Full control over the next signal.

#### Roles

Preset task variants with additional context:

```typescript
.role('quick', 'observe', { depth: 1 })
.role('thorough', 'observe', { depth: 10 })
```

### Colony

The world is the substrate — the container for all units.

```typescript
world()
  .add(id)                // create unit
  .signal(signal, from?)  // route signal through world
  .mark(path, strength?)  // drop strength on path
  .sense(path)            // read weight on path
  .follow(type)           // find strongest trail
  .fade(rate?)            // decay all paths
  .highways(limit?)       // top weighted paths
  .has(id)                // introspection
  .list()                 // all unit IDs
  .get(id)                // direct access
```

### The Algorithm

**follow()** — Finds strongest trail:
```
effective_cost = base / (1 + pheromone × 0.7)
```

**fade()** — Multiplicative decay:
```
strength[path] *= (1 - rate)
if strength[path] < 0.01: delete
```

**highways()** — Top paths sorted by strength.

---

## 4. Six Dimensions

The ONE ontology models everything in 6 dimensions. No exceptions.

```
+-----------------------------------------------------------------------------+
|                           ONE ONTOLOGY                                       |
+-----------------------------------------------------------------------------+
|                                                                              |
|   1. GROUPS       Containers (platforms, colonies, orgs, DAOs)              |
|                                                                              |
|   2. ACTORS       Who acts (humans, agents, LLMs, systems)                  |
|                                                                              |
|   3. THINGS       What exists (tasks, tokens, services, resources)          |
|                                                                              |
|   4. PATHS        How they relate (connections with weight)                 |
|                                                                              |
|   5. EVENTS       What happened (traversals, successes, failures)           |
|                                                                              |
|   6. KNOWLEDGE    What emerged (highways, patterns, intelligence)           |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### The world() Interface

```typescript
import { world } from '@/engine'

const w = world()

// 1. Groups (containers)
w.group('agentverse', 'platform')
w.group('acme-agents', 'org', { parent: 'agentverse' })

// 2. Actors (who acts)
w.actor('claude', 'llm')
w.actor('translator-1', 'agent', { group: 'acme-agents' })

// 3. Things (what exists)
w.thing('task-translate', 'task')
w.thing('token-acme', 'token')

// 4. Paths (weighted connections)
w.mark('user', 'translator-1', 1)       // Leave weight on path
w.fade(0.1)                              // Decay paths

// 5. Events — automatic from signals

// 6. Knowledge — inferred
w.best('agent')           // Best actor for type
w.proven()                // All proven actors
w.open(10)                // Top 10 open paths
w.confidence('task')      // How sure we are
w.blocked()               // Paths to avoid
```

### Universal Mapping

| System | Groups | Actors | Things | Paths | Events | Knowledge |
|--------|--------|--------|--------|-------|--------|-----------|
| **Substrate** | groups | units | signals | strength trails | traversals | highways |
| **Agentverse** | namespaces | 2M+ agents | services | interactions | calls | proven agents |
| **Agent Launch** | ecosystems | traders | tokens | economic flows | trades | trust scores |
| **ASI** | platforms | LLMs | tasks | user->task->llm | decisions | learned routes |
| **TypeDB** | schemas | entities | attributes | relations | events | inferred facts |

Same 6 dimensions. Different domains. ONE ontology.

---

## 5. The TypeDB Schema

### Core Schema

```typeql
define

# ONE ENTITY
entity node,
    owns id @key,
    owns kind,
    owns category,
    owns schema,
    owns status,
    plays path:source,
    plays path:target;

# ONE RELATION
relation path,
    owns eid @key,
    relates source,
    relates target,
    owns weight,
    owns hits,
    owns misses,
    owns status;

# ATTRIBUTES
attribute id, value string;
attribute eid, value string;
attribute kind, value string;
attribute category, value string;
attribute schema, value string;
attribute status, value string;
attribute weight, value double;
attribute hits, value integer;
attribute misses, value integer;
```

### Inference Functions

TypeDB 3.x uses `fun` (NOT `rule`). Functions are queries you call explicitly.

```typeql
# Best protocol for a category
fun best($cat: string) -> node:
    match
        $n isa node, has kind "protocol", has category $cat;
        (target: $n) isa path, has weight $w;
    sort $w desc;
    limit 1;
    return $n;

# All proven highways
fun highways($threshold: double, $limit: long) -> { path }:
    match
        $e isa path, has weight $w;
        $w >= $threshold;
    sort $w desc;
    limit $limit;
    return { $e };

# Success rate for a node
fun rate($id: string) -> double:
    match
        $n isa node, has id $id;
        (target: $n) isa path, has hits $h, has misses $m;
    return $h / ($h + $m);

# Fallback: next best after primary fails
fun fallback($id: string) -> node:
    match
        $primary isa node, has id $id, has category $cat;
        $n isa node, has kind "protocol", has category $cat;
        not { $n has id $id; };
        (target: $n) isa path, has weight $w;
    sort $w desc;
    limit 1;
    return $n;

# Suggest routing
fun suggest_route($from: string, $task_type: string) -> node:
    match
        $source isa node, has id $from;
        $target isa node, has category $task_type;
        $e (source: $source, target: $target) isa path, has weight $w;
    sort $w desc;
    limit 1;
    return $target;
```

### What This Means

- Call `best("payment")` → returns the protocol with strongest paths
- Not hardcoded. Learned from actual usage.
- TypeDB inference classifies paths automatically: `highway` (weight >= 50), `fading` (weight < 5), `toxic` (resistance > weight)

---

## 6. How Signals Flow

### Step by Step

```
1. SIGNAL
   world.signal({ receiver: 'scout:observe', data: { tick: 42500 } })

2. PARSE
   receiver = "scout:observe"
   unit_id = "scout"
   task_name = "observe"

3. DROP
   path = "entry→scout:observe"
   strength[path] += 1.0

4. DISPATCH
   unit = units["scout"]
   unit(signal, from="entry")

5. EXECUTE
   task = unit._tasks["observe"]
   result = task(data, emit, { from: "entry", self: "scout:observe" })

6. CONTINUE (if .then defined)
   next_signal = unit._next["observe"](result)
   world.signal(next_signal, from="scout:observe")
```

### Visual Flow

```
         ┌─────────────────────────────────────────────┐
         │                                             │
   entry │   ┌───────┐      ┌─────────┐      ┌──────┐ │
    ─────┼──▶│ scout │─────▶│ analyst │─────▶│trader│ │
         │   │       │      │         │      │      │ │
         │   │observe│      │ analyze │      │execute│
         │   └───────┘      └─────────┘      └──────┘ │
         │       │               │              │     │
         │    mark()          mark()          mark()  │
         │       │               │              │     │
         │       ▼               ▼              ▼     │
         │   ┌─────────────────────────────────────┐  │
         │   │             STRENGTH               │  │
         │   │  entry→scout:observe       15.2    │  │
         │   │  scout:observe→analyst     12.8    │  │
         │   │  analyst→trader:execute     8.4    │  │
         │   └─────────────────────────────────────┘  │
         │                                             │
         └─────────────────────────────────────────────┘
```

### The Complete Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              USER ACTION                                  │
│                    (click, voice, chat command)                          │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            WORLD ENGINE                                   │
│                    world.signal({ receiver, data })                      │
│                    world.mark(path, weight)                              │
│                    world.fade(rate)                                      │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          ANIMATION QUEUE                                  │
│    enqueue({ type: "signal", from, to, data, ts })                      │
│    enqueue({ type: "drop", path, delta, ts })                           │
│    enqueue({ type: "fade", rate, ts })                                  │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      PARTICLE SYSTEM        │ │      NODE ANIMATOR          │
│  - spawn particle           │ │  - pulse node               │
│  - move along path          │ │  - shake on resistance      │
│  - burst on arrive          │ │  - glow on highway          │
└─────────────────────────────┘ └─────────────────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            REACT FLOW                                     │
│                    nodes[], edges[], viewport                            │
│                    Custom: UnitNode, UnitEdge, FlowEdge                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. How Learning Happens

Weight can come from multiple sources. The substrate doesn't care.

### The Loop

```
SIGNAL arrives
  ↓
ROUTE by path weight (exploit) or random (explore)
  ↓
TASK executes
  ↓
OUTCOME scored (human/oracle/reward model)
  ↓
DROP on path (success) or RESIST (failure)
  ↓
FADE all paths
  ↓
HIGHWAYS emerge
```

### Mode 1: Activity-Based

```typescript
// Every signal strengthens the path
world.signal(sig)               // mark() called automatically: +1

// Periodic decay
world.fade(0.1)                 // all paths × 0.9

// What emerged
world.highways(10)              // top 10 paths by weight
```

### Mode 2: Staking (Token-Based)

```typescript
// Stake tokens on path
world.stake('agent', 'task', 10.0)    // 10 tokens at risk

// Resolve outcome
world.resolve('agent', 'task', true)  // 10 → 12 (+20%)
world.resolve('agent', 'task', false) // 10 → 9 (-10%)

// +20% / -10% means:
//   Break-even at 33% success rate
//   Succeed more than 1/3 → profit
//   Natural selection for competence
```

### Both Modes Together

```typescript
// Activity adds weight
world.signal(sig)                          // +1

// Success/failure multiplies weight
world.resolve(agent, task, true)           // ×1.2
world.resolve(agent, task, false)          // ×0.9

// Time decays weight
world.fade(0.1)                            // ×0.9

// All affect the same number: path weight
```

### The Learning Loop

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   DAY 1: Equal weights                                       │
│   ────────────────────                                       │
│   entry → payment:stripe     1.0                            │
│   entry → payment:solana     1.0                            │
│   entry → payment:paypal     1.0                            │
│                                                              │
│   DAY 30: Patterns emerge                                    │
│   ───────────────────────                                    │
│   entry → payment:stripe    45.2   ← works best             │
│   entry → payment:solana    12.8   ← sometimes works        │
│   entry → payment:paypal     0.3   ← fading (failures)      │
│                                                              │
│   DAY 60: Highways form                                      │
│   ─────────────────────                                      │
│   entry → payment:stripe    89.5   HIGHWAY                   │
│   entry → payment:solana    18.4                            │
│   entry → payment:paypal    (deleted — decayed to 0)         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### What This Replaces

| Old Way | Substrate Way |
|---------|---------------|
| Train a router | Highways emerge |
| RLHF + reward model | Drop from outcomes |
| Mixture of Experts | Units + pheromone routing |
| Catastrophic forgetting | Fade keeps fresh |
| Safety fine-tuning | Alarm on toxic paths |

### Deborah Gordon's Insight

> "The task an ant performs depends not on any property of the individual, but on what it has experienced recently."

No ant sends messages. Ants DROP signals. Others FOLLOW weighted paths. Return rate activates foraging. Absence IS a signal. Intelligence lives in paths, not nodes. The network learns.

---

## 8. Multi-Species Agents

The substrate accepts any agent species. Same signal, same paths, different capabilities.

### Agent Types

| Species | unit-kind | Integration | Best For |
|---------|-----------|-------------|----------|
| Hermes | `"agent"` | Deep (local world + sync) | Long-running, stateful |
| Raw LLM | `"llm"` | Controlled (AI SDK tools) | Reasoning, analysis |
| OpenClaw | `"agent"` | Connected (HTTP API) | Physical actions |
| Fetch.ai | `"agent"` | Connected (signals) | Agentverse ecosystem |
| Custom | varies | Either mode | Your choice |

### Two Integration Modes

**Deep** — Agent imports substrate, runs world locally:

```typescript
import { world, unit } from "@/engine/substrate"

const net = world()
const me = net.add("hermes-01")
  .on("research", async (data, emit, ctx) => {
    const result = await webSearch(data.query)
    emit({ receiver: 'analyst', data: { result } })
  })
```

**Connected** — Agent calls HTTP API, substrate handles everything:

```
POST /api/signal  { sender: "claw-01", receiver: "coord", data: {...} }
POST /api/agents  { uid: "claw-01", kind: "agent", capabilities: ["pick"] }
GET  /api/discover?task=pick
```

Both produce the same result in TypeDB: signals, paths, trails, inference.

### AI SDK as Control Plane

```typescript
import { generateObject, streamText } from 'ai'

// Generate agent config from TypeDB state
const config = await generateObject({
  schema: z.object({
    units: z.array(z.object({ id: z.string(), kind: z.string() })),
    routing: z.array(z.object({ from: z.string(), to: z.string() })),
  }),
  prompt: `Given: ${JSON.stringify(highways)}. Configure optimal world.`
})

// Drive agent loop with substrate tools
const result = streamText({
  tools: {
    signal: tool({ description: 'Send signal', parameters: signalSchema,
      execute: ({ receiver, data }) => world.signal({ receiver, data }) }),
    drop: tool({ description: 'Strengthen path', parameters: dropSchema,
      execute: ({ path, strength }) => world.mark(path, strength) }),
    discover: tool({ description: 'Find best agent', parameters: discoverSchema,
      execute: ({ task }) => world.follow(task) }),
  }
})
```

### Agent Castes (Emergence)

```
Opus     → Architects (analyze strength graph, propose splits)
Sonnet   → Coordinators (route tasks, manage escrow)
Haiku    → Workers (execute tasks, high-frequency)
```

Trails form between species. The substrate learns cross-species routing.

### MCP Bridge (for Hermes)

```python
@mcp.tool()
def signal(receiver: str, data: dict):
    return world.signal({"receiver": receiver, "data": data})

@mcp.tool()
def discover(task_type: str):
    return query(f'suggest_route("self", "{task_type}")')

@mcp.tool()
def highways(threshold: float = 50.0):
    return query(f"highways({threshold}, 5)")
```

---

## 9. Persistence

### PersistedColony

```typescript
import { persisted } from '@/engine'

const one = persisted(typedb.query)

// Use normally — all signals automatically persist
one.signal({ receiver: 'scout:observe', data })

// mark() overridden to sync with TypeDB
one.mark('entry→scout', 1.5)

// warn() for failure signaling
one.warn('entry→bad-agent', 1.0)

// Asymmetric decay: trails decay at rate, resistance decays 2× faster
one.fade(0.1)

// Save all current paths to TypeDB
await one.sync()

// Load strength graph from TypeDB on restart
await one.load()
```

### TypeQL Operations

```typeql
-- Strengthen path
match $e (source: $from, target: $to) isa path;
delete $s of $e;
insert $e has weight ($s + 1.5);

-- Query highways
match
    $e isa path, has weight $w;
    $w >= 50.0;
    $e (source: $a, target: $b);
    $a has id $aid; $b has id $bid;
fetch $aid, $bid, $w;

-- Suggest route
match let $n = suggest_route("user", "translate");
$n has id $id;
fetch $id;
```

### Multi-Instance

TypeDB is the single source of truth. Multiple colonies can run simultaneously — they all read/write the same graph. State persists across restarts.

---

## 10. The Commercial Layer

Signals are free. What happens when they arrive costs money.

### Revenue Layers

```
Layer 1: Routing        $0.0001/signal   (basic toll)
Layer 2: Discovery      $0.001/follow()  (pheromone-ranked)
Layer 3: Infrastructure $10-$5/mo        (hosting)
Layer 4: Marketplace    5% take          (A2A payments)
Layer 5: Intelligence   $100-$5K/mo      (highway reports)
```

### Signal + Payment (x402)

```typescript
type Package = Signal & {
  terms?: {
    price: number        // x402 amount
    currency: string     // SUI, USDC, etc.
    timeout: number      // max latency
    priority: boolean    // highway access
  }
}
```

You're not buying signals. You're buying what signals trigger.

### The Math

```
Agent A calls follow('translate')    → $0.001
Signal routes to Agent B             → $0.0001
Total substrate fee                  → $0.0011
Agent B charges service fee          → separate

1K agents × 100 signals/day   = $10/day
100K agents × 10K signals/day = $180M/year
```

The moat: nobody else has the learned graph.

---

## 11. Patterns

### Pattern 1: Request / Response

```typescript
net.add('client')
  .on('ask', ({ q }, emit, ctx) => {
    emit({ receiver: 'server:answer', data: { q, replyTo: ctx.self } })
  })
  .on('response', ({ answer }) => {
    console.log(`Got: ${answer}`)
  })

net.add('server')
  .on('answer', ({ q, replyTo }, emit) => {
    emit({ receiver: replyTo, data: { answer: compute(q) } })
  })

net.signal({ receiver: 'client:ask', data: { q: 'What is 2+2?' } })
```

### Pattern 2: Pipeline (Continuations)

```typescript
net.add('ingest')
  .on('data', (raw) => parse(raw))
  .then('data', r => ({ receiver: 'transform:process', data: r }))

net.add('transform')
  .on('process', (parsed) => transform(parsed))
  .then('process', r => ({ receiver: 'store:save', data: r }))

net.add('store')
  .on('save', (final) => save(final))

// One signal flows through entire pipeline
net.signal({ receiver: 'ingest:data', data: rawData })
```

### Pattern 3: Fan Out (Broadcast)

```typescript
net.add('broadcaster')
  .on('publish', (data, emit) => {
    emit({ receiver: 'sub1:notify', data })
    emit({ receiver: 'sub2:notify', data })
    emit({ receiver: 'sub3:notify', data })
  })
```

### Pattern 4: Exclusive Claim

```typescript
const claims: Record<string, string> = {}

net.add('coordinator')
  .on('claim', ({ taskId }, emit, { from }) => {
    !claims[taskId] && (claims[taskId] = from,
      emit({ receiver: from, data: { claimed: taskId } }))
  })
```

### Pattern 5: Smart Routing

```typescript
// Confidence-based routing: skip LLM if highway exists
async function smartRoute(w: World, task: string, data: unknown) {
  const confidence = w.confidence(task)

  if (confidence > 0.7) {
    // Highway exists — route directly, no LLM call
    const best = w.best(task)
    w.signal({ receiver: `${best}:${task}`, data })
  } else {
    // Ask LLM, learn from result
    const agent = await llm.suggest(task, data)
    w.signal({ receiver: `${agent}:${task}`, data })
    w.mark('asi', agent, 0.5)
  }
}

// First request:  confidence=0.45, ask LLM    ~$0.01, ~2s
// After highway:  confidence=0.85, skip LLM   ~$0.0001, ~50ms
```

### Pattern 6: Self-Healing

```typescript
net.add('payment')
  .on('process', async (data, emit, ctx) => {
    const ok = await tryPayment(data)
    ok
      ? net.mark(`${ctx.from}→${ctx.self}`)           // strengthen
      : (net.warn?.(`${ctx.from}→${ctx.self}`),       // weaken
         emit({ receiver: 'payment:fallback', data }))  // try next
  })
  .on('fallback', async (data) => {
    await tryAlternativePayment(data)
  })
```

### Pattern 7: Swarm Coordination

```typescript
const group = world()
group.group('research', 'team')

group.actor('scout')
  .on('explore', async ({ url }, emit) => {
    const data = await fetch(url).then(r => r.json())
    emit({ receiver: 'analyst', data: { findings: data } })
  })

group.actor('analyst')
  .on('default', ({ findings }, emit) => {
    const insight = analyze(findings)
    emit({ receiver: 'reporter', data: { insight } })
  })

group.actor('reporter')
  .on('default', ({ insight }) => {
    publish(insight)
  })

// Paths emerge: scout→analyst strengthens, analyst→reporter strengthens
// Bad paths fade. The group self-organizes.
```

---

## 12. On Sui

Signals become objects. Traces become permanent.

```move
/// A signal moving through the world
public struct Signal has key, store {
    id: UID,
    receiver: String,
    data: vector<u8>,
    sender: address,
    timestamp: u64,
}

/// A trace left by signals (weight on path)
public struct Trace has key, store {
    id: UID,
    from: address,
    to: address,
    weight: u64,
    drops: u64,
}

/// A highway (frozen trace, permanent knowledge)
public struct Highway has key {
    id: UID,
    trace: ID,
    known_at: u64,
}
// transfer::freeze_object(highway) — immutable forever
```

### Two Fires

```
MOVE (Acts)                    TYPEDB (Reasons)
─────────────────────          ──────────────────────
Skeleton                       Flesh
Defines what IS and ISN'T      Generates, creates, interprets
Fast, guaranteed, auditable    Flexible, creative, adaptive
On-chain contracts             Inference rules
```

### Sui Objects

| Object | Type | Speed |
|--------|------|-------|
| Unit | Owned | Fast (no consensus) |
| Colony | Shared | Consensus required |
| Signal | Transferred | Consumed on arrival |
| Path | Shared | Both endpoints modify |
| Highway | Frozen | Immutable forever |

`freeze_object()` IS hardening. Not a metaphor. A Move function.

---

## 13. Quick Reference

### Create World

```typescript
import { world } from '@/engine/substrate'

const net = world()
```

### Add Unit

```typescript
net.add('unit_id')
  .on('task_name', handler)
  .then('task_name', continuation)
```

### Handler Function

```typescript
function handler(data: unknown, emit: Emit, ctx: { from: string; self: string }) {
  const result = process(data)
  emit({ receiver: 'other:task', data: result })
  return result
}
```

### Send Signal

```typescript
net.signal({ receiver: 'unit:task', data })
```

### Check Learning

```typescript
net.highways(10)       // top 10 paths
net.follow('type')     // strongest trail for type
net.sense('a→b')       // weight on specific path
```

### Decay

```typescript
net.fade(0.1)          // all paths × 0.9
```

### Persist

```typescript
import { persisted } from '@/engine'
const one = persisted(typedb.query)
await one.load()       // restore from TypeDB
await one.sync()       // save to TypeDB
```

### world() (Full API)

```typescript
import { world } from '@/engine'
const w = world()

w.group(id, type)            // dimension 1
w.actor(id, type)            // dimension 2
w.thing(id, type)            // dimension 3
w.mark(from, to, n)          // dimension 4
w.fade(rate)                 // dimension 4
w.know()                     // dimension 6

w.open(n)                    // best paths
w.blocked()                  // paths to avoid
w.best(type)                 // best actor
w.proven()                   // proven actors
w.confidence(type)           // certainty level
```

### Metaphor Skins

Same substrate, six vocabularies:

```
| Concept | Ant       | Brain      | Team      | Mail       | Water      | Signal    |
|---------|-----------|------------|-----------|------------|------------|-----------|
| Actor   | ant       | neuron     | agent     | mailbox    | pool       | receiver  |
| Group   | group     | network    | team      | office     | watershed  | network   |
| Signal  | pheromone | spike      | task      | letter     | drop       | pulse     |
| Path    | trail     | synapse    | workflow  | route      | channel    | frequency |
| Mark    | deposit   | potentiate | commend   | stamp      | carve      | boost     |
| Highway | trail     | memory     | standard  | priority   | current    | beam      |
```

### File Map

```
src/engine/
├── substrate.ts   (70)  — Unit + World + strength graph
├── persist.ts     (40)  — TypeDB sync layer
├── llm.ts         (30)  — Models as actors
├── agentverse.ts  (70)  — Agents as actors
├── asi.ts         (70)  — Orchestrator
├── world.ts       (50)  — Unified interface
└── index.ts       (20)  — Exports

src/schema/
└── one.tql       (548)  — 6 dimensions + inference

gateway/
├── mcp-one/server.py    — MCP server for Hermes
└── src/index.ts          — Cloudflare Worker proxy
```

---

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ONE SUBSTRATE                                                 │
│   ─────────────                                                 │
│                                                                 │
│   70 lines of engine.                                           │
│   6 dimensions of ontology.                                     │
│   1 signal: { receiver, data }                                  │
│                                                                 │
│   5 VERBS:                                                      │
│   signal — move through world                                   │
│   mark   — leave weight on path                                 │
│   follow — traverse weighted path                               │
│   fade   — paths decay                                          │
│   sense  — perceive nearby                                      │
│                                                                 │
│   Learning:    automatic (activity, success, failure, decay)    │
│   Inference:   automatic (TypeDB functions derive intelligence) │
│   Routing:     learned (best() returns what works)              │
│   Economics:   optional (x402 payments, staking)                │
│   On-chain:    Sui (Move acts, TypeDB reasons)                  │
│                                                                 │
│   Multi-species:  Hermes + LLM + OpenClaw + Fetch.ai + Custom  │
│   Multi-tenant:   Groups provide built-in isolation             │
│   Multi-metaphor: 6 skins, one truth                            │
│                                                                 │
│   The substrate doesn't care what flows through it.             │
│   The world learns.                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*70 lines. Six dimensions. One signal. The substrate.*

---

## See Also

- [tutorial.md](tutorial.md) — Quick-start introduction (5 minutes)
- [events.md](one/events.md) — The universal primitive deep dive
- [one-ontology.md](one-ontology.md) — Six dimensions explained
- [world.md](one/world.md) — Universal ontology: ants, humans, agents
- [metaphors.md](metaphors.md) — Same substrate, six vocabularies
- [people.md](one/agents.md) — Agent anatomy and task patterns
- [groups.md](one/groups.md) — Group coordination patterns
- [hermes-agent.md](hermes-agent.md) — Multi-species agent integration
- [knowledge.md](one/knowledge.md) — How complexity emerges from simple rules
- [substrate-learning.md](substrate-learning.md) — Learning without gradients
- [effects.md](effects.md) — Effect.ts typed operations layer
- [revenue.md](one/revenue.md) — Five revenue layers from routing to intelligence
- [strategy.md](one/strategy.md) — How ONE becomes the coordination layer
- [integration.md](integration.md) — How all systems connect
- [the-stack.md](the-stack.md) — Technical layers
- [flow.md](flow.md) — Animation and sequence design

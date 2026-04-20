# Flows

How things move, form, live, and die in the world.

---

## The One Flow

Everything reduces to this:

```
Signal { receiver, data }
  → enters world
    → finds unit
      → executes task
        → emits new signals
          → mark() on path
            → strength accumulates or fades
              → highways emerge
```

Five verbs. One loop. All complexity emerges from here.

```
emit  →  mark  →  warn  →  fade  →  follow
  │        │        │        │         │
 move   strengthen  resist  decay    traverse
```

---

## Signal Flow

A signal is born, routed, consumed, and may spawn children.

```
                    ┌─────────────────────────────────┐
                    │           WORLD                   │
                    │                                   │
  { receiver,  ──→  │  route(receiver)                  │
    data }          │    │                              │
                    │    ▼                              │
                    │  unit.task(data, emit, ctx)       │
                    │    │           │                  │
                    │    ▼           ▼                  │
                    │  result    emit({receiver, data}) │
                    │    │           │                  │
                    │    ▼           ▼                  │
                    │  continuation  mark(from→to)      │
                    │    │           │                  │
                    │    ▼           ▼                  │
                    │  new signal   path strength++     │
                    │    │                              │
                    │    └──→ re-enters world ──→ ...   │
                    └─────────────────────────────────┘
```

**Key properties:**
- Signals carry no return address (push-only, zero pull)
- `ctx.from` tells you who sent it — reply patterns use this
- Missing handler = signal dissolves, group continues (zero returns)
- Each emit carries `ctx.self` as the new `from`

> See: [events.md](one/events.md) for the primitive, [DSL.md](one/DSL.md) for the programming model

---

## Actor Lifecycle

An actor (unit/agent) moves through predictable phases:

```
SPAWN → IDLE → SENSE → ACT → LEARN → SPECIALIZE → HARDEN
  │                                        │              │
  │                                        ▼              ▼
  │                                    highway        frozen on-chain
  │                                    emerges        (permanent proof)
  │                                        │
  └────────── fade back to IDLE ◄──────────┘
```

### Phase Detail

| Phase | What Happens | Substrate Operation |
|-------|-------------|-------------------|
| **Spawn** | Unit created in colony with tasks | `world.add(id)` |
| **Idle** | Waiting for signals | No cost, no state |
| **Sense** | Receives signal, reads context | `task(data, emit, ctx)` |
| **Act** | Executes task, emits signals | `emit({ receiver, data })` |
| **Learn** | Paths strengthen from successful flow | `mark(from→to, strength)` |
| **Specialize** | Repeated success creates preferred routes | Strength accumulates |
| **Harden** | Proven paths become highways | `strength ≥ 50 → highway` |

### Death and Rebirth

Agents don't crash — they fade.

```
Active unit
  → paths strengthen with use
  → paths fade without use (fade rate 0.95)
  → strength drops below threshold (< 5 = fading)
  → signals route elsewhere
  → unit effectively dormant
  → new signals can revive it
```

No garbage collection. No shutdown. No error. Silence is valid.

> See: [people.md](one/agents.md) for anatomy, [ants.md](ants.md) for biological grounding

---

## Group Containment

Groups are the containers of the world. Everything lives inside a group.

```
ROOT GROUP (world)
├── TRADING
│   ├── Units: scout, analyst, trader
│   ├── Skills: tick-data, positions
│   ├── Paths: scout→analyst (strength: 72) ★ highway
│   └── Knowledge: "analyst is fastest for BTC ticks"
│
├── SUPPORT
│   ├── Units: classifier, responder, escalator
│   ├── Skills: tickets, templates
│   ├── Paths: classifier→responder (strength: 45)
│   └── Knowledge: "responder handles 80% without escalation"
│
└── INFRASTRUCTURE
    ├── Units: monitor, alerter, healer
    ├── Skills: services, logs
    └── Paths: monitor→alerter→healer (chain)
```

### Group Properties

- **Isolation**: Paths within a group don't leak to other groups
- **Hierarchy**: Groups nest — a group can contain sub-groups
- **Multi-tenancy**: Each tenant gets a group, same substrate
- **Billing**: Group boundaries = billing boundaries
- **Federation**: Cross-group paths form when groups cooperate

### Group Lifecycle

```
CREATE → POPULATE → ISOLATE → LEARN → FEDERATE
  │         │          │         │         │
  new     spawn      paths     highways   cross-group
  group   units      scoped    emerge     paths form
```

> See: [one-ontology.md](one-ontology.md) for the 6 dimensions, [group.md](group.md) for coordination

---

## Path Formation

Paths are the memory of the world. They record what worked.

```
First signal:    A ──→ B         (strength: 0, new path created)
Success:         A ══→ B         (strength: +1.0, mark)
Repeated:        A ═══→ B        (strength: 15, strengthening)
Proven:          A ════→ B  ★    (strength: 50+, HIGHWAY)
Hardend:    A ════→ B  ◆    (frozen on-chain, permanent)
```

### The Learning Loop

```
MARK                        FADE
  │                           │
  ▼                           ▼
strength++              strength *= 0.95
  │                           │
  ▼                           ▼
more signals              less traffic
  │                           │
  ▼                           ▼
HIGHWAY                   reroute
  │                           │
  ▼                           ▼
know               dissolve
```

### Path Types by Strength

| Strength | Classification | Meaning |
|----------|---------------|---------|
| 0–5 | **Fading** | Unused, dissolving |
| 5–49 | **Active** | In use, not yet proven |
| 50+ | **Highway** | Proven route, fast lane |
| resistance > strength | **Toxic** | Failed, avoid |

### Negative Paths

Not all paths strengthen. Failure creates resistance:

```
signal(A→B) → B fails
  → warn(A→B)             // resistance accumulates
  → resistance > strength  // path becomes toxic
  → follow() skips B      // traffic reroutes
  → C gets the signal     // natural failover
```

> See: [substrate-learning.md](substrate-learning.md) for the learning model

---

## Knowledge Emergence

Raw events become knowledge through three stages:

```
Stage 1: DATA                Stage 2: PATTERNS           Stage 3: KNOWLEDGE
─────────────────           ──────────────────          ──────────────────
Signals flow                 Paths accumulate weight     Highways know
Events log                   Clusters form               Rules fire (inference)
Weights change               Specialists emerge          Proven capabilities freeze

  signal()                     mark() / fade()              highways() / best()
  │                              │                              │
  ▼                              ▼                              ▼
  raw event stream            weighted topology             queryable intelligence
```

### What the Substrate Learns

| Dimension | Learns | How |
|-----------|--------|-----|
| **Paths** | Which routes work | mark() on success, warn() on failure |
| **Events** | What happened | Signal log with timestamps |
| **Knowledge** | What's proven | Functions over accumulated paths |
| **Units** | Who's good at what | Path strength to/from each unit |
| **Skills** | What gets used | Signal frequency per skill |
| **Groups** | Which teams perform | Aggregate path health per group |

> See: [knowledge.md](one/knowledge.md) for the five forces

---

## The Complete Flow

An engineer's view — everything connected:

```
USER REQUEST
  │
  ▼
world.signal({ receiver: 'router', data: request })
  │
  ▼
Router checks highways:  follow('task-type') → proven unit?
  │                         │
  YES                       NO
  │                         │
  ▼                         ▼
Follow highway          LLM decides (expensive, slow)
(fast, cheap)           Signal to candidate units
  │                         │
  ▼                         ▼
Unit executes task      Unit executes task
  │                         │
  ▼                         ▼
emit() results          emit() results
  │                         │
  ▼                         ▼
mark() on path          mark() on path  ←── THIS IS LEARNING
  │                         │
  ▼                         ▼
Path strengthens        New path created
  │                         │
  ▼                         ▼
Next request follows    Next request might follow
the proven path         this path if it works again
  │
  ▼
After many successes: strength ≥ 50 → HIGHWAY
  │
  ▼
Cost drops from $0.01/2s → $0.0001/50ms
  │
  ▼
Highway frozen on-chain (Sui freeze_object)
  │
  ▼
Permanent proof of capability
```

---

## Flow Patterns

### Fan-Out (Broadcast)

```
signal → router
           ├──→ agent-A
           ├──→ agent-B
           └──→ agent-C
```

One signal, many receivers. Router emits multiple signals.

### Fan-In (Gather)

```
agent-A ──→ aggregator → combined result
agent-B ──→     │
agent-C ──→     │
```

Many signals, one collector. Aggregator waits and merges.

### Pipeline (Chain)

```
scout ──→ analyst ──→ trader ──→ settlement
```

Sequential processing. Each stage's output is the next stage's input via continuations.

### Compete (Race)

```
signal → agent-A ──→ first response wins
       → agent-B ──→ (claim pattern)
       → agent-C ──→
```

Multiple candidates, first to claim wins. Losers' signals dissolve.

### Stigmergy (Indirect)

```
unit-A marks path X (strength++)
                                   ← no direct communication
unit-B follows strongest path → finds X
```

No messages exchanged. Coordination through shared environment.

> See: [group.md](group.md) for coordination patterns, [examples.md](examples.md) for production implementations

---

## Metaphor Mapping

The same flow, different words:

| Verb | Ant | Brain | Team | Mail | Water | Radio |
|------|-----|-------|------|------|-------|-------|
| emit (signal moves) | ant walks | spike fires | message sent | letter posted | water flows | signal transmitted |
| mark (path strengthens) | pheromone deposited | synapse potentiates | trust builds | route preferred | channel deepens | frequency locked |
| warn (resistance grows) | resistance pheromone | inhibition | conflict flagged | returned mail | contamination | jamming |
| fade (paths decay) | strength evaporates | synapse weakens | contact lost | route deprecated | channel dries | signal attenuates |
| follow (highway forms) | trail established | memory consolidated | process documented | express lane | river formed | broadcast channel |

> See: [metaphors.md](metaphors.md) for complete vocabulary, [framework.md](framework.md) for UI skins

---

## Reading Order for Engineers

Start here, follow the flow:

1. **[events.md](one/events.md)** — The primitive. Two fields. Five verbs.
2. **[DSL.md](one/DSL.md)** — The programming model. Signal in, work, signal out.
3. **[dictionary.md](dictionary.md)** — Everything named. How it connects.
4. **[people.md](one/agents.md)** — What a unit is. Tasks, continuations, roles.
5. **[group.md](group.md)** — Many units. Coordination patterns.
6. **[ants.md](ants.md)** — The biological source. Nine castes. Five chains.
7. **[knowledge.md](one/knowledge.md)** — How intelligence arises from five forces.
8. **[one-ontology.md](one-ontology.md)** — The 6 dimensions that model everything.
9. **[substrate-learning.md](substrate-learning.md)** — How paths = reinforcement learning.
10. **[integration.md](integration.md)** — How it all connects to real systems.

---

## See Also

- [events.md](one/events.md) — The primitive
- [DSL.md](one/DSL.md) — The programming model
- [dictionary.md](dictionary.md) — Complete naming guide
- [people.md](one/agents.md) — Unit anatomy and tasks
- [group.md](group.md) — Multi-unit coordination
- [knowledge.md](one/knowledge.md) — Five forces driving intelligence

---

*Emit. Mark. Warn. Fade. Follow. Everything flows.*

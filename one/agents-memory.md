# Agent Memory

How individual agents remember, recall, and forget.

## Three Layers of Memory

Every agent has memory at three levels. Each layer operates at a different speed and serves a different purpose.

```
Layer 1: Pheromone (milliseconds)
  In-memory strength/resistance on paths.
  Updated on every signal. Fades over time.
  "What worked recently."

Layer 2: Hypotheses (persistent)
  TypeDB entities with confidence, source, p-value.
  Created by L6 knowledge loop or manual assertion.
  "What we've learned is true."

Layer 3: Context Pack (per-conversation)
  Assembled just-in-time before each LLM call.
  Combines hypotheses + highways + recent signals.
  "What the agent knows right now."
```

## Pheromone: Fast Memory

Pheromone is the agent's short-term memory. Every signal that flows through a path deposits a trace.

```typescript
mark(edge, amount)    // Success. Strength increases.
warn(edge, amount)    // Failure. Resistance increases.
sense(edge)           // Read strength.
danger(edge)          // Read resistance.
```

Four in-memory maps per path:

| Map | Updated by | Purpose |
|-----|-----------|---------|
| `strength` | `mark()` | How well this path works |
| `resistance` | `warn()` | How often this path fails |
| `peak` | `mark()` | Highest strength ever (ghost trail floor) |
| `lastUsed` | Every signal | Timestamp for seasonal decay |

Pheromone is fast (sub-millisecond reads) but impermanent. It fades via L3 every 5 minutes. This is intentional -- recent experience should matter more than ancient history.

### Asymmetric Decay (Forgetting)

The substrate forgives failures faster than it forgets successes:

```
Strength:   strength *= (1 - 0.05)     5% decay per cycle
Resistance: resistance *= (1 - 0.10)   10% decay (2x faster)
```

A seasonal factor accelerates decay for unused paths (up to 2x for paths unused 24h+). But strength never drops below `peak * 0.05` -- ghost trails survive so the substrate remembers that a path once existed.

```
     Fresh    5 hours   24 hours   48 hours
     -----    -------   --------   --------
s=50  50       37.5      16.5       8.5      (floor: 2.5)
r=50  50       25.0       6.3       1.6      (forgives 2x faster)
```

Failures forgive. Proven paths leave traces. This is how the substrate implements graceful forgetting.

## Hypotheses: Permanent Memory

Hypotheses are facts the substrate has learned. They persist in TypeDB and survive restarts.

### Schema

```tql
entity hypothesis,
    owns hid @key,               # unique ID
    owns statement,              # natural language fact
    owns hypothesis-status,      # pending | testing | confirmed | rejected
    owns observations-count,     # sample size
    owns p-value,                # statistical significance
    owns source,                 # observed | asserted | verified
    owns observed-at,            # when learned
    owns valid-from,             # bi-temporal: when fact became true
    owns valid-until;            # bi-temporal: when it stopped being true
```

### Sources

| Source | Created by | Confidence cap | Example |
|--------|-----------|----------------|---------|
| `observed` | L6 loop auto-detection | None | "path alice->bob is proven (confidence 0.92)" |
| `asserted` | Manual insertion, chat | 0.30 | "user prefers dark mode" |
| `verified` | Multiple independent observations | None | Corroborated assertion promoted |

Asserted hypotheses are capped at 0.30 confidence in the chat context. This prevents prompt injection -- you can tell an agent something, but it won't fully trust it until the substrate independently corroborates it.

### Lifecycle

```
pending       Initial state. Not yet validated.
    |
testing       Accumulating observations.
    |
    +---> confirmed    p-value < 0.05, enough samples. Permanent knowledge.
    |
    +---> rejected     Failed to confirm after sufficient samples.
```

### Querying Hypotheses: `recall()`

```typescript
// String match -- search hypothesis statements
const insights = await net.recall('enrollment')
// Returns: [{ pattern: "enrollment->amara is proven", confidence: 0.92 }]

// Bi-temporal query -- what was true at a specific date
const insights = await net.recall({ subject: 'amara', at: '2026-03-15' })
// Returns hypotheses where valid-from <= date <= valid-until
```

Recall deduplicates by pattern and excludes private-scope failures unless explicitly requested.

## Context Pack: Assembled Memory

Before each LLM call, the chat layer assembles a `ContextPack` from the agent's memory layers.

### Assembly (`buildPack`)

```typescript
{
  profile: { uid, handle, messageCount },
  hypotheses: [                          // from TypeDB
    { statement, confidence, source }
  ],
  highways: [                            // from pheromone
    { to, strength }
  ],
  recent: [],                            // from caller
  tools: []                              // from caller
}
```

### Injection into System Prompt

The context pack is prepended to the agent's system prompt with tiered confidence:

| Confidence | Treatment | Example |
|-----------|-----------|---------|
| >= 0.85 | Direct fact | "[fact] user prefers detailed explanations (92%)" |
| 0.50 - 0.85 | Subtle hint | "Consider that the user may prefer..." |
| < 0.50 | Omitted | Not injected into prompt |

Highways are injected as interests:

```
Top interests (by path strength):
  enrollment (strength: 42.5)
  curriculum (strength: 38.1)
  assessment (strength: 25.0)
```

This gives the agent situational awareness without hardcoding knowledge into its prompt.

## Memory Tools (Edge Workers)

Agents deployed as claws have four memory tools available:

| Tool | Purpose | Persistence |
|------|---------|-------------|
| `remember(key, value)` | Store an insight | KV + queryable later |
| `recall(query)` | Full-text search of hypotheses | TypeDB read |
| `mark(target, strength)` | Strengthen path to another unit | In-memory + TypeDB |
| `warn(target, strength)` | Add resistance to a path | In-memory + TypeDB |

An agent can explicitly choose to remember something:

```
Agent: "I notice this student struggles with pronunciation. Let me remember that."
→ remember("student-123-weakness", "pronunciation accuracy below 60%")
```

And recall it in future conversations:

```
Agent: "Let me check what I know about this student."
→ recall("student-123")
→ Returns: [{ pattern: "pronunciation accuracy below 60%", confidence: 0.30 }]
```

## Reveal: Full Memory Export

`reveal(uid)` exports an agent's complete memory across all 6 dimensions. This is the GDPR Article 20 data portability endpoint.

```typescript
const card = await net.reveal('debby:amara')

// Returns:
{
  actor: {
    uid: 'debby:amara',
    kind: 'agent',
    firstSeen: '2026-03-01T...'
  },
  hypotheses: [
    { pattern: 'enrollment->amara is proven', confidence: 0.92 },
    { pattern: 'amara pronunciation drill effective', confidence: 0.78 }
  ],
  highways: [
    { from: 'debby:amara', to: 'debby:enrollment', strength: 42.5 },
    { from: 'debby:amara', to: 'debby:assessment', strength: 28.1 }
  ],
  signals: [
    { data: 'practice session completed', success: true },
    // ... recent 200 signals
  ],
  groups: ['debby'],
  capabilities: [
    { skillId: 'practice', name: 'practice', price: 0.50 },
    { skillId: 'lesson', name: 'lesson', price: 1.00 }
  ],
  frontier: ['advanced-grammar', 'business-english', 'exam-prep']
}
```

The MemoryCard covers all 6 dimensions: groups (membership), actors (identity), things (capabilities), paths (highways), events (signals), learning (hypotheses + frontier).

**Endpoint:** `GET /api/memory/reveal/:uid`

## Frontier: What the Agent Doesn't Know

`frontier(uid)` identifies gaps in an agent's experience.

```typescript
const gaps = await net.frontier('debby:amara')
// Returns: ['advanced-grammar', 'business-english', 'exam-prep']
```

The algorithm:
1. Query all skills and their tags in the world
2. Query tags this agent has touched via outgoing paths
3. Return world tags NOT touched by the agent

This drives proactive capability discovery. An agent that only handles beginner practice sessions will see "advanced-grammar" in its frontier -- a signal that it could expand.

**Endpoint:** `GET /api/memory/frontier/:uid`

## Forget: Complete Erasure

`forget(uid)` implements GDPR Article 17 right-to-erasure. It deletes everything.

```typescript
await net.forget('debby:amara')
```

Deletion order (TypeDB relations before entities):
1. All signals sent by this unit
2. All paths (both source and target)
3. All memberships (group relations)
4. All capabilities (provider relations)
5. Unit entity itself
6. Remove from in-memory world
7. Invalidate KV cache (paths, units, highways)

Orphaned paths left by the deletion decay naturally via the L3 fade loop. The substrate doesn't need to know why a path lost its endpoint -- it just fades.

**Endpoint:** `DELETE /api/memory/forget/:uid`

## How Memory Flows

```
Signal arrives
    |
    v
[Pheromone check]  Is this path toxic? (in-memory, O(1))
    |                 yes -> dissolve, no LLM call
    v
[Context pack]     Assemble hypotheses + highways + recent
    |
    v
[LLM call]         Agent prompt + context pack + user message
    |
    v
[Outcome]          result / timeout / dissolved / failure
    |
    v
[Pheromone update] mark() or warn() (in-memory, <0.001ms)
    |
    v
[TypeDB sync]      writeSilent() (async, fire-and-forget)
    |
    v
[L6 hourly]        Promote highways to hypotheses
    |
    v
[Next conversation] Context pack includes new hypotheses
```

Memory is not a separate system. It is the substrate operating on itself. Pheromone accumulates from signals, hardens into hypotheses, and feeds back into the next signal's context. The agent gets smarter because the paths it uses get stronger, and the knowledge it generates feeds back into its own prompt.

## See Also

- [world-memory.md](world-memory.md) -- How the substrate learns collectively
- [agents-how-they-work.md](agents-how-they-work.md) -- Agent lifecycle, routing, evolution
- [routing.md](routing.md) -- The routing formula that reads pheromone
- [dictionary.md](dictionary.md) -- Canonical names (hypothesis, strength, resistance)
- [patterns.md](one/patterns.md) -- Closed loop, deterministic sandwich

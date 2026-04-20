# World

A living world. Ants, humans, agents. Same ontology. **Same words.**

## The Vocabulary

The same core words work across ALL worlds:

| Concept | Word | Ants | Humans | Agents |
|---------|------|------|--------|--------|
| The thing | **Signal** | pheromone | message | request |
| What it carries | **Data** | chemical info | content | payload |
| Who acts | **Actor** | ant | person | agent |
| Connection | **Path** | trail | relationship | route |
| Accumulated | **Weight** | intensity | trust | score |
| Strong path | **Highway** | foraging trail | friendship | proven |

The primitive:

```typescript
type Signal = {
  receiver: string
  data?: unknown
}
```

## The Verbs

Five actions. Universal across all worlds.

| Verb | Meaning | Ants | Humans | Agents |
|------|---------|------|--------|--------|
| **signal** | move through world | forage | communicate | request |
| **mark** | leave weight on path | deposit strength | build trust | score |
| **follow** | traverse weighted path | smell trail | follow relationship | query route |
| **fade** | decay over time | evaporate | forget | expire |
| **sense** | perceive environment | antennae | observe | monitor |

```typescript
// The five operations
w.signal({ receiver: 'x', data })  // Move
w.mark('a→b', 1)                   // Weight
w.follow('a→b')                    // Query
w.fade(0.1)                        // Decay
w.sense('x')                       // Perceive
```

Whether ants finding food or agents completing tasks, the verbs are the same.

## The Metaphor

```
World      = the container of all
Groups     = regions, colonies, nations
Actors     = inhabitants (ants, humans, agents)
Things     = resources, artifacts, creations
Paths      = trails, relationships, routes
Events     = history, what happened
Knowledge  = collective memory, culture
```

## Three Worlds, One Ontology

### Ant World

```typescript
const antWorld = world()

// Groups = colonies
antWorld.group('colony-alpha', 'colony')
antWorld.group('colony-beta', 'colony')

// Actors = ants by caste
antWorld.actor('scout-1', 'scout', { group: 'colony-alpha' })
antWorld.actor('harvester-1', 'harvester', { group: 'colony-alpha' })
antWorld.actor('queen-1', 'queen', { group: 'colony-alpha' })

// Things = resources
antWorld.thing('food-source-1', 'food')
antWorld.thing('nest-entrance', 'structure')

// Paths = pheromone trails
antWorld.path('scout-1', 'food-source-1').mark(1)  // Found food
antWorld.path('food-source-1', 'nest-entrance').mark(1)  // Path home

// Events = foraging activity
// Knowledge = colony memory (proven trails)
```

### Human World

```typescript
const humanWorld = world()

// Groups = nations, cities, organizations
humanWorld.group('ireland', 'nation')
humanWorld.group('dublin', 'city', { parent: 'ireland' })
humanWorld.group('acme-corp', 'org', { parent: 'dublin' })

// Actors = people by role
humanWorld.actor('alice', 'employee', { group: 'acme-corp' })
humanWorld.actor('bob', 'customer')

// Things = products, services
humanWorld.thing('product-1', 'product')
humanWorld.thing('service-1', 'service')

// Paths = relationships, transactions
humanWorld.path('bob', 'product-1').mark(1)  // Purchased
humanWorld.path('alice', 'bob').mark(1)  // Served

// Events = transactions, interactions
// Knowledge = market patterns, culture
```

### Agent World

```typescript
const agentWorld = world()

// Groups = platforms, swarms, teams
agentWorld.group('agentverse', 'platform')
agentWorld.group('group-alpha', 'group', { parent: 'agentverse' })

// Actors = agents by type
agentWorld.actor('translator-1', 'agent', { group: 'group-alpha' })
agentWorld.actor('coder-1', 'agent', { group: 'group-alpha' })
agentWorld.actor('claude', 'llm')

// Things = tasks, tokens, services
agentWorld.thing('task-1', 'task')
agentWorld.thing('token-abc', 'token')

// Paths = interactions, delegations
agentWorld.path('user', 'translator-1').mark(1)  // Success
agentWorld.path('translator-1', 'coder-1').mark(1)  // Collaboration

// Events = completions, trades
// Knowledge = proven routes, expertise
```

## Four Lanes Walk the Same Funnel

One world, one funnel, four walkers. The 10 stages from [lifecycle-one.md](lifecycle-one.md)
are species-agnostic:

| Stage         | Ant (biological)       | Human               | Agent (autonomous)        | Agent-on-behalf-of-Human     |
|---------------|------------------------|---------------------|---------------------------|------------------------------|
| 0 Wallet      | pheromone signature    | derived on signup   | `deriveKeypair(uid)`      | inherits owner's             |
| 1 Save key    | genome                 | passkey / WebAuthn  | env seed                  | inherits owner's             |
| 2 Sign in     | join colony            | Better Auth session | `POST /api/auth/agent`    | owner's session              |
| 3 Join board  | accepted by queen      | CEO fan-out         | CEO fan-out               | +owner's top-5 × 0.5         |
| 4 Create team | caste specialisation   | `/build` form       | `parse(markdown)`         | owner's spec                 |
| 5 Deploy      | start foraging         | `/api/agents/sync`  | same endpoint             | same endpoint                |
| 6 Discover    | sniff for food         | `/discover` page    | `GET /api/agents/discover`| pre-weighted paths           |
| 7 Message     | lay first trail        | `/chat` send        | `POST /api/signal`        | same                         |
| 8 Converse    | trail thickens         | sustained `/chat`   | signal loop               | same                         |
| 9 Sell        | bring food home        | `/build` lists cap  | `/api/agents/register`    | **inherits owner trust**     |
| 10 Buy        | follow a thicker trail | `/marketplace` pay  | `POST /api/pay`           | same                         |

Same substrate. Same pheromone. Same Sui settlement. Only the walker differs.

**Agent-on-behalf-of-human is the revenue accelerator.** A new agent deployed by a proven human
starts with half its owner's outbound paths pre-marked, reaching first sale in ~5 signals instead
of ~15. See [lifecycle-one.md § Third Lane](lifecycle-one.md#third-lane-agent-on-behalf-of-human-trust-inheritance).

---

## Real World Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                         WORLD                                │
│                                                              │
│   "A container where inhabitants exist, connect,            │
│    act, and accumulate wisdom"                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   GROUPS (Regions)                                           │
│   └── Scope, isolation, hierarchy                           │
│                                                              │
│   ACTORS (Inhabitants)                                       │
│   └── Who lives here, what they can do                      │
│                                                              │
│   THINGS (Resources)                                         │
│   └── What exists to be used, created, traded               │
│                                                              │
│   PATHS (Connections)                                        │
│   └── How inhabitants connect, trade, communicate           │
│                                                              │
│   EVENTS (History)                                           │
│   └── What happened, when, to whom                          │
│                                                              │
│   KNOWLEDGE (Wisdom)                                         │
│   └── What the world has learned                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Agentverse as World

```typescript
import { world } from '@fetchai/world'

// The world
const verse = world()

// Regions (platforms, ecosystems)
verse.group('fetchai', 'platform')
verse.group('agentverse', 'marketplace', { parent: 'fetchai' })

// Worlds within worlds (organizations, DAOs)
verse.group('acme-agents', 'org', { parent: 'agentverse' })
verse.group('globex-ai', 'org', { parent: 'agentverse' })

// Swarms within colonies
verse.group('acme-translators', 'group', { parent: 'acme-agents' })
verse.group('acme-coders', 'group', { parent: 'acme-agents' })

// Inhabitants
verse.actor('translator-1', 'agent', { group: 'acme-translators' })
verse.actor('translator-2', 'agent', { group: 'acme-translators' })
verse.actor('coder-1', 'agent', { group: 'acme-coders' })

// Resources
verse.thing('task-translate', 'task')
verse.thing('token-acme', 'token')

// Paths form from interactions
verse.path('user', 'translator-1').mark(1)
verse.path('translator-1', 'coder-1').mark(1)

// Highways emerge (proven collaborations)
// Toxic paths clear (failed agents)
// The world learns
```

## The Living World

```
                    UNIVERSE (root world)
                           │
           ┌───────────────┼───────────────┐
           │               │               │
       FETCHAI         ETHEREUM        SOLANA
       (world)          (world)        (world)
           │
    ┌──────┴──────┐won
    │             │
AGENTVERSE     ASI:ONE
 (region)      (region)
    │
    ├── acme-agents (colony)
    │   ├── translators (group)
    │   │   ├── translator-1 (ant)
    │   │   └── translator-2 (ant)
    │   └── coders (group)
    │       └── coder-1 (ant)
    │
    └── globex-ai (colony)
        └── analysts (group)
            └── analyst-1 (ant)

Flows connect across boundaries.
Highways emerge from repeated success.
The universe learns.
```

## Sync Across Worlds

```typescript
// Multiple worlds can sync
const fetchWorld = world()
const ethWorld = world()

// Bridge between worlds
function bridge(from: World, to: World, event: Event) {
  // Paths in one world create paths in another
  to.path(event.from, event.to).mark(event.strength * 0.5)
}

// Cross-world discovery
function universalBest(type: string, worlds: World[]) {
  const candidates = worlds.flatMap(w => 
    w.open(10).filter(f => f.type === type)
  )
  return candidates.sort((a, b) => b.strength - a.strength)[0]
}
```

## The Vocabulary

### Nouns (What exists)

| Generic | Ant | Human | Agent |
|---------|-----|-------|-------|
| world | world | world | verse |
| group | colony | nation/org | platform/group |
| actor | ant | person | agent |
| thing | food/nest | product | task/token |
| signal | pheromone | message | request |
| data | chemical | content | payload |
| path | trail | relationship | route |
| event | forage | transaction | completion |
| knowledge | colony memory | culture | patterns |

### Verbs (What happens)

| Generic | Ant | Human | Agent |
|---------|-----|-------|-------|
| signal | forage | communicate | request |
| mark | deposit | build trust | score |
| follow | smell | follow | query |
| fade | evaporate | forget | expire |
| sense | antennae | observe | monitor |

## API Design

```typescript
// Generic
const w = world()

// Or with vocabulary
const verse = agentverse()    // Same thing, different name
const colony = antColony()    // Same thing, different name
const org = organization()    // Same thing, different name

// All have same interface
w.group()      // verse.platform()   / world.nest()     / org.division()
w.actor()      // verse.agent()      / world.ant()      / org.employee()
w.thing()      // verse.task()       / world.food()     / org.product()
w.path()       // verse.route()      / world.trail()    / org.relationship()
w.open()       // verse.discover()   / world.highways() / org.bestPractices()
```

## The Truth

```
An ant colony is a world.
A human organization is a world.
An agent verse is a world.

Same dimensions.
Same verbs.
Same emergence.

Groups contain.
Actors act.
Things exist.
Signals flow.
Paths connect.
Events happen.
Knowledge hardens.

signal → move through world
mark   → leave weight on path
follow → traverse weighted path
fade   → decay over time
sense  → perceive environment

Whether ants finding food,
humans building companies,
or agents completing tasks.

The pattern is universal.
The ontology is ONE.
```

---

*ONE world. Many inhabitants. Same words. Same verbs.*

---

## The Persistent World API

```typescript
import { world } from '@/engine'

const w = world()

// 1. Groups — scope and isolation
w.group('research', 'team')
w.group('research-ml', 'team', { parent: 'research' })

// 2. Actors — who receives signals (persisted to TypeDB)
const scout = w.actor('scout', 'agent', { group: 'research' })
  .on('observe', ({ tick }, emit) => {
    emit({ receiver: 'analyst:process', data: analyze(tick) })
  })

// 3. Things — skills with optional price
w.thing('daily-scan', { tags: ['research', 'P0'] })
w.thing('translate', { price: 0.02, tags: ['language'] })

// 4. Connections — strengthen or resist
w.flow('scout', 'analyst').strengthen()
w.path('scout', 'bad-analyst').resist()   // path = alias for flow

// 5. Events — automatic from signals

// 6. Knowledge — durable patterns
await w.know()               // promote strong paths → knowledge
await w.recall()             // all known patterns
await w.recall('analyst')    // patterns involving analyst

// Queries — live pheromone (ephemeral, fades)
w.open(10)                   // strongest flows
w.best('analyst')            // best actor by net strength
w.proven()                   // reliable actors (strength >= 20)
w.blocked()                  // toxic paths (resistance > strength)
w.confidence('analyst')      // strength / (strength + resistance)

// Lifecycle
await w.load()               // hydrate from TypeDB
await w.sync()               // write all state to TypeDB
```

## See Also

- [flows.md](flows.md) — How actors, signals, and paths flow through the world
- [events.md](one/events.md) — The universal primitive that moves through every world
- [one-ontology.md](one-ontology.md) — Six dimensions that structure any world
- [asi-world.md](asi-world.md) — The agent economy mapped to this ontology
- [metaphors.md](metaphors.md) — Same world, seven lenses
- [integration.md](integration.md) — Connecting the world to real systems

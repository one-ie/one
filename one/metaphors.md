# Metaphors

Same system. Different languages. **Same words.**

One formula. Seven skins. Infinite frameworks.

---

## The Universal Vocabulary

The breakthrough: **the same core words work across ALL metaphors**.

| Concept | Word | Ants | Neurons | Markets | Agents | Ledger |
|---------|------|------|---------|---------|--------|--------|
| The thing | **Signal** | pheromone | spike | price | request | tx |
| What it carries | **Data** | chemical | pattern | volume | payload | bytes |
| Who acts | **Unit** | ant | neuron | trader | agent | object |
| The container | **World** | nest | network | market | swarm | package |
| Connection | **Path** | trail | synapse | flow | route | shared object |
| Positive weight | **Strength** | intensity | potentiation | volume | score | strength (u64) |
| Negative weight | **Resistance** | alarm | inhibition | crash | penalty | resistance (u64) |
| Strong path | **Highway** | foraging trail | memory | trend | proven | frozen Highway |

This is the primitive:

```typescript
type Signal = {
  receiver: string
  data?: unknown
}
```

**Signal** works everywhere. **Data** carries anything. The vocabulary is universal.

---

## The Universal Verbs

Five runtime verbs + one persistence verb. Every metaphor. Same meaning.

| Verb       | Meaning                | Ants        | Neurons       | Markets    | Agents      | Ledger          |
| ---------- | ---------------------- | ----------- | ------------- | ---------- | ----------- | --------------- |
| **signal** | move through world     | forage      | fire          | trade      | request     | send tx         |
| **mark**   | leave weight on path   | deposit     | potentiate    | volume     | score       | emit Marked     |
| **follow** | traverse weighted path | smell trail | sense synapse | track flow | query route | read path       |
| **fade**   | decay over time        | evaporate   | decay         | cool       | forget      | tick u64        |
| **sense**  | perceive environment   | antennae    | receptors     | indicators | tools       | getObject       |
| **harden** | freeze to permanent    | imprint     | consolidate   | settle     | document    | freeze_object   |

```typescript
// The runtime operations
w.signal({ receiver: 'x', data })  // Move
w.mark('a→b', 1)                   // Strengthen
w.follow('a→b')                    // Query
w.fade(0.1)                        // Decay
w.sense('x')                       // Perceive

// The persistence operation (L6 — knowledge hardens)
w.know()                           // Promote proven paths to durable memory
w.recall(match)                    // Query what was hardened
```

The verbs are universal because the dynamics are universal. `harden` is the
verb that moves a path from *runtime memory* to *durable learning*. In TypeDB
it becomes a `hypothesis`; on Sui it becomes a frozen `Highway` object.

---

## The Weight — What Accumulates on Paths

Every metaphor has its own word for the substance that builds up on connections.
This is the deepest symmetry in the system.

| | The substance | Depositing it | It builds into | It fades by |
|---|---|---|---|---|
| **ONE** | weight | mark / warn | highway | fade |
| **Ant** | pheromone | deposit / alarm | trail | evaporation |
| **Brain** | synaptic weight | potentiate / inhibit | pathway | decay |
| **Team** | reputation | commend / flag | go-to person | forgetting |
| **Mail** | stamps | stamp / return | express route | archiving |
| **Water** | sediment | carve / dam | river | drying |
| **Radio** | signal power | boost / jam | clear channel | attenuation |
| **Ledger** | u64 strength | mark event / warn event | frozen Highway | u64 multiplication |

The pattern is always the same:

```
something accumulates on a connection over time
  → positive: the connection gets used more
  → negative: the connection gets avoided
  → without use: it fades
  → survivors become the proven paths
  → the best of those harden into permanent record
```

Ants call it pheromone. Neuroscience calls it synaptic weight. Organizations
call it reputation. Hydrology calls it erosion. Radio engineering calls it
signal strength. Sui calls it a `u64` field on a shared object.

The substrate doesn't pick a metaphor. It just says **strength** and
**resistance**. That's why it skins to everything — the dynamic is universal.

---

## ONE — The Meta-Metaphor

Not ants. Not brains. Not teams. Just ONE.

ONE sits above all metaphors. It captures the fundamental dimensions that every
system exhibits, regardless of domain vocabulary.

### The Dimensions

```
┌─────────────────────────────────────────────────────────────┐
│                         ONE                                  │
├─────────────┬───────────────────────────────────────────────┤
│ unit        │ a thing that acts (the fundamental receiver)  │
│ world       │ composition of units (the container)          │
│ signal      │ what flows between units (the message)        │
│ path        │ connection between units (the edge)           │
│ strength    │ how reinforced (positive signal)              │
│ resistance  │ how blocked (negative signal)                 │
│ time        │ decay over duration (forgetting)              │
└─────────────┴───────────────────────────────────────────────┘
```

These dimensions are universal:
- **unit** — the atomic entity that receives and processes
- **world** — the whole that contains units
- **signal** — what moves between units
- **path** — the connection that signals travel
- **strength** — positive reinforcement on success
- **resistance** — negative reinforcement on failure
- **time** — natural decay that prunes unused paths

### world() — The Universal Interface

```typescript
import { world } from '@one-ie/world'

// Create a world
const w = world()

// Add units
const a = w.add('a')
const b = w.add('b')

// Define behavior
a.on('process', (data, emit) => {
  emit({ receiver: 'b', data: transform(data) })
})

// Send signal
w.signal({ receiver: 'a:process', data: data })

// The six operations
w.mark('a→b', 1)          // Reinforce path
w.warn('a→b', 1)          // Resist path
w.fade(0.1)               // Time passes
w.open(10)                 // Strongest flows
w.blocked()                // Blocked flows
w.best('task')             // Best unit for task type
```

### ONE Maps to Everything

| Dimension | ONE | Ant | Brain | Team | Mail | Water | Radio | Ledger |
|-----------|-----|-----|-------|------|------|-------|-------|--------|
| **actor** | unit | ant | neuron | agent | mailbox | pool | receiver | object |
| **container** | world | nest | network | team | office | watershed | network | package |
| **signal** | signal | pheromone | spike | task | letter | drop | signal | Signal object |
| **path** | path | trail | synapse | workflow | route | channel | frequency | shared Path |
| **reinforce** | mark | deposit | potentiate | commend | stamp | carve | boost | emit Marked |
| **resist** | warn | alarm | inhibit | flag | return | dam | jam | emit Warned |
| **decay** | fade | evaporate | decay | forget | archive | dry | attenuate | tick u64 |
| **harden** | know | imprint | consolidate | document | stamp | settle | lock | freeze_object |

### Derived Concepts

From the seven dimensions, we derive:

| Concept | Definition | ONE | Ant | Brain | Team | Ledger |
|---------|------------|-----|-----|-------|------|--------|
| **highway** | high strength, low resistance | open | trail | pathway | go-to | proven path |
| **blocked** | high resistance | blocked | toxic | dead | flagged | toxic flag |
| **best** | optimal unit for task | best | scout | expert | specialist | top-ranked |
| **hardened** | frozen to permanent record | hypothesis | imprinted trail | long-term memory | policy | Highway object |

ONE is the abstraction above all metaphors. Use it when you don't want to commit
to a domain. Use `world()` as your universal entry point.

---

## The Core (metaphor-free)

```
thing    → thing    (with data)
mark connection on success
weaken connection over time
best paths emerge
best of the best harden into permanent record
```

That's the substrate. Everything else is naming.

---

## The Seven Metaphors

### 1. Ant Colony

```
unit     → ant
world    → nest
signal   → scent
signal() → forage
mark     → deposit
warn     → alarm
fade     → evaporate
highways → trails
add      → hatch
remove   → die
know     → imprint
recall   → recognize
harden   → imprint (deep — wired into the nest)
```

```typescript
import { ant, nest } from '@one-ie/world/ant'

const scout = ant('scout')
  .on('forage', ({ location }, release, ctx) => {
    const food = search(location)
    release({ to: 'harvester', scent: { food, trail: ctx.self } })
  })

const colony = nest()
colony.hatch('scout', scout)
colony.forage({ to: 'scout:forage', scent: { location } })

// Pheromone mechanics
colony.deposit('scout→food', 1)    // Found food
colony.alarm('scout→danger', 1)    // Found threat
colony.evaporate(0.1)              // Time passes
colony.trails(10)                  // Strongest paths
colony.imprint()                   // Promote trails to memory
colony.recognize()                 // Recall what was learned
```

**Why this works:** Ants coordinate without central control. Pheromones are literally how they do it. The metaphor is the mechanism.

---

### 2. Brain / Neural

```
unit     → neuron
world    → network
signal   → impulse
signal() → fire
mark     → potentiate
warn     → inhibit
fade     → decay
highways → pathways
add      → grow
remove   → apoptosis
know     → consolidate
recall   → remember
harden   → myelinate (axon insulation = permanent fast path)
```

```typescript
import { neuron, network } from '@one-ie/world/brain'

const sensor = neuron('sensor')
  .on('perceive', ({ stimulus }, fire, ctx) => {
    const signal = encode(stimulus)
    fire({ to: 'processor', impulse: { signal } })
  })

const brain = network()
brain.grow('sensor', sensor)
brain.fire({ to: 'sensor:perceive', impulse: { stimulus } })

// Synaptic mechanics
brain.potentiate('sensor→processor', 1)  // Learning
brain.inhibit('sensor→processor', 1)     // Unlearning
brain.decay(0.1)                          // Forgetting
brain.pathways(10)                        // Strongest connections
brain.consolidate()                       // Promote to long-term memory
brain.remember()                          // Recall memory
```

**Why this works:** Neurons fire, connections strengthen with use (Hebbian learning), unused connections fade. The metaphor maps to neuroscience.

---

### 3. Team / Organization

```
unit     → agent
world    → team
signal   → task
signal() → delegate
mark     → commend
warn     → flag
fade     → forget
highways → go-to people
add      → hire
remove   → fire
know     → document
recall   → consult
harden   → codify (written into policy)
```

```typescript
import { agent, team } from '@one-ie/world/team'

const analyst = agent('analyst')
  .on('research', ({ topic }, delegate, ctx) => {
    const findings = analyze(topic)
    delegate({ to: ctx.from, task: { findings } })
  })

const org = team()
org.hire('analyst', analyst)
org.delegate({ to: 'analyst:research', task: { topic } })

// Reputation mechanics
org.commend('manager→analyst', 1)   // Good work
org.flag('manager→analyst', 1)      // Problem
org.forget(0.1)                      // Old history fades
org.goto(10)                         // Best people for tasks
org.document()                       // Promote patterns to knowledge
org.consult()                        // Recall institutional knowledge
```

**Why this works:** Teams delegate work, good performers get more work, poor performers get flagged, old performance fades. Org behavior.

---

### 4. Mail / Postal

```
unit     → mailbox
world    → post office
signal   → letter
data     → contents
signal() → deliver
mark     → stamp
warn     → return to sender
fade     → archive
highways → express routes
add      → open
remove   → close
know     → stamp (permanent record)
recall   → resurface
harden   → seal (official postmark)
```

```typescript
import { mailbox, postOffice } from '@one-ie/world/mail'

const inbox = mailbox('support')
  .on('inquiry', ({ message }, reply, ctx) => {
    const response = handle(message)
    reply({ to: ctx.from, data: { response } })
  })

const office = postOffice()
office.open('support', inbox)
office.deliver({ to: 'support:inquiry', data: { message } })

// Routing mechanics
office.stamp('customer→support', 1)    // Successful delivery
office.return('customer→support', 1)   // Failed delivery
office.archive(0.1)                     // Old routes fade
office.express(10)                      // Fastest routes
```

**Why this works:** Mail has receivers and data. Routing optimizes over time. Simple mental model.

---

### 5. Water / Flow

```
unit     → pool
world    → watershed
signal   → drop
signal() → flow
mark()   → carve
warn     → dam
fade     → dry
highways → rivers
add      → dig
remove   → dry up
know     → settle
recall   → resurface
harden   → bedrock (sediment compressed into stone)
```

```typescript
import { pool, watershed } from '@one-ie/world/water'

const filter = pool('filter')
  .on('receive', ({ drop }, flow, ctx) => {
    const clean = purify(drop)
    flow({ to: 'reservoir', drop: { clean } })
  })

const system = watershed()
system.dig('filter', filter)
system.flow({ to: 'filter:receive', drop: { water } })

// Erosion mechanics
system.carve('source→filter', 1)    // Path deepens
system.dam('source→filter', 1)      // Block path
system.dry(0.1)                      // Unused paths dry up
system.rivers(10)                    // Deepest channels
system.settle()                      // Sediment becomes bedrock
system.resurface()                   // Old channels reappear
```

**Why this works:** Water finds paths, repeated flow carves deeper channels, unused channels dry up. Natural.

---

### 6. Signal / Radio

```
unit     → receiver
world    → network
signal   → signal
signal() → transmit
mark     → boost
warn     → jam
fade     → attenuate
highways → clear channels
add      → tune
remove   → deregister
know     → lock
recall   → replay
harden   → license (frequency becomes legally permanent)
```

```typescript
import { receiver, network } from '@one-ie/world/radio'

const antenna = receiver('antenna')
  .on('receive', ({ signal }, transmit, ctx) => {
    const amplified = boost(signal)
    transmit({ to: 'decoder', signal: { amplified } })
  })

const radio = network()
radio.tune('antenna', antenna)
radio.transmit({ to: 'antenna:receive', signal: { data } })

// Signal mechanics
radio.boost('source→antenna', 1)      // Strengthen
radio.jam('source→antenna', 1)        // Interference
radio.attenuate(0.1)                   // Signal decay
radio.clear(10)                        // Best frequencies
radio.lock()                           // Frequency becomes permanent
radio.replay()                         // Recall locked frequencies
```

**Why this works:** Signals need receivers, frequencies that work get boosted, interference jams, unused frequencies attenuate.

---

### 7. Ledger / Sui

```
unit     → object (Move struct, { key, store })
world    → package (published Move module)
signal   → Signal object (owned, transferred, consumed)
signal() → sign + execute transaction
mark     → emit Marked event (strength += 1)
warn     → emit Warned event (resistance += 1)
fade     → tick u64 multiplication
highways → proven paths (strength >= threshold)
add      → create_unit (self-sovereign: agent signs)
remove   → dissolve (transfer to burn address)
know     → freeze to Highway object
recall   → query on-chain state
harden   → public_freeze_object(path) → Highway (immutable, permanent)
```

```typescript
import { addressFor, createUnit, send, mark, warn, harden } from '@/lib/sui'

// Derive deterministic keypair from SUI_SEED + uid
const scoutAddr = addressFor('scout')

// Create on-chain unit (agent signs its own creation)
await createUnit('scout', 'Scout Agent', 'agent')

// Send signal as Move transaction (owned object transfer)
await send('scout', 'analyst', { payload: 'hello' }, 0)

// Mechanics — every mark/warn emits events, every event updates u64 fields
await mark('scout', pathId, 1)        // Marked event, strength += 1
await warn('scout', pathId, 1)        // Warned event, resistance += 1

// Harden — freeze the path into a Highway object (irreversible)
const { digest, highwayId } = await harden('scout', pathId)
// Highway has { key } only (no store) — frozen, cannot be moved or mutated
```

**Why this works:** Sui's object model is literally paths and signals. Move's `public_freeze_object` is the hardening primitive. Events emitted by `mark` and `warn` are witnessable by anyone. Deterministic keypairs from `SUI_SEED` + uid mean no key storage. This is the only skin where learning becomes **externally verifiable** — ant pheromone is private to the colony; Sui state is public, permanent, and queryable.

**The unique property of the Ledger skin:** every other skin has decay even on hardened paths (memory fades, bedrock erodes, licenses expire). Sui's `freeze_object` is genuinely one-way — the Highway never decays. This is why crystallize→harden was the correct rename: `harden` works for all seven skins; `crystallize` was chemistry-only. Sui's hardening is the *asymptote* that all other skins approximate.

---

## Framework Integration: ONE in Practice

**One formula. Infinite vocabularies. Every ecosystem speaks the same language underneath.**

A Langchain agent and an AgentVerse agent and a Hermes agent and a human
freelancer all do work for ONE. They all need to:
- Receive tasks (signals)
- Execute them (handlers)
- Report outcomes (mark/warn)
- Get routed based on past performance (pheromone)

But they speak different languages:
- Langchain: "Agent", "Tool", "Chain", "callback"
- AgentVerse: "Bureau", "Agent", "Protocol", "Almanac"
- Hermes: "Goal", "Subtask", "Advice", "Harden"
- Human: "Job", "Task", "Skill", "Reputation"

**Solution:** Map everything to the same verbs underneath:

```
signal → mark → warn → fade → follow → harden
```

### The Unified Framework Table

| Core ONE | Ant | Brain | Team | Mail | Water | Signal | Ledger | Langchain | AgentVerse | Hermes | Human |
|----------|-----|-------|------|------|-------|--------|--------|-----------|------------|--------|-------|
| **Signal** | pheromone | spike | task | letter | drop | signal | Signal object | input | message | goal | request |
| **Receiver** | ant | neuron | agent | mailbox | pool | receiver | object | agent | agent | unit | person |
| **Handler** | behavior | firing pattern | action | process | flow | handler | entry fn | tool/chain | service | subtask | work |
| **Data** | chemical | pattern | payload | contents | volume | data | bytes | input dict | payload | state | work item |
| **Success** | deposit | potentiate | commend | deliver | carve | mark | Marked event | success cb | ACK | hypothesis_confirmed | paid |
| **Failure** | alarm | inhibit | flag | return | dam | warn | Warned event | error cb | NACK | hypothesis_rejected | unpaid |
| **Path** | trail | synapse | workflow | route | channel | frequency | shared Path | execution path | agent registry | advice network | career path |
| **Strong path** | highway | pathway | pipeline | express | river | channel | proven | proven agent | famous bureau | hardened pattern | top freelancer |
| **Decay** | evaporate | decay | forget | archive | dry | attenuate | tick u64 | cache expire | reputation reset | time decay | experience fades |
| **Routing** | smell | synapse weight | skill-match | zipcode | flow rate | signal strength | read path | agent selection | bureau discovery | advice lookup | word-of-mouth |
| **Best path** | strongest trail | highest synapse | top performer | fastest route | main river | strongest signal | top ranked | best agent | flagship bureau | proven peer | trusted friend |
| **Harden** | imprint | myelinate | codify | seal | bedrock | license | freeze_object | harden prompt | Almanac entry | hypothesis_save | hired permanent |

### Langchain → ONE

```
Langchain Concept          ONE Concept           Pheromone Meaning
─────────────────────────────────────────────────────────────────
Agent                      unit                  Receiver of signals
Tool                       handler/.on()         Executes on signal
Chain                      continuation/.then()  Chains signals
Tool result                mark/warn             Success/failure deposit
Agent decision             select()              Choose next tool
Callback                   emit()                Fan out results
Memory                     path strength         What worked before
Tool use tracking          pheromone             How often tool succeeded
Retrieval augmented gen    highways              Best practices hardened
Agent failure              warn()                Accumulate resistance
```

**How Langchain Maps:**

```typescript
// Langchain code                    // ONE interpretation
const agent = AgentExecutor(...)    // unit("langchain:agent")
agent.invoke({input: data})         // signal({receiver: "langchain:agent", data})
→ tool.call(input)                  // .on("tool_name", handler)
→ callback({tool, result})          // mark("langchain→tool", result.success)
→ next_step()                        // .then("tool_name", next)
→ final_answer                       // emit({receiver: "user", data: answer})
```

```typescript
// Langchain agent orchestrated by ONE

import { Langchain } from 'langchain'
import { mark, warn, ask } from '@/lib/typedb'

const unit = world().add('langchain:researcher')
  .on('research', async (data, emit) => {
    const agent = new AgentExecutor({
      tools: [search, summarize, validate],
      llm: model,
    })

    try {
      const result = await agent.invoke({
        input: data.query,
        callbacks: [
          {
            on_tool_end: (output) => {
              mark(`researcher→${output.tool}`, 1)
            },
            on_tool_error: (error) => {
              warn(`researcher→${error.tool}`, 1)
            },
          },
        ],
      })

      mark('langchain:researcher', 1 + chainDepth)
      emit({ receiver: data.replyTo, data: { result: result.output } })
    } catch (e) {
      warn('langchain:researcher', 1)
      emit({ receiver: data.replyTo, data: { error: e.message } })
    }
  })
```

### AgentVerse → ONE

```
AgentVerse Concept        ONE Concept           Pheromone Meaning
──────────────────────────────────────────────────────────────────
Agent                     unit                  Receiver of protocols
Service                   handler/.on()         What agent can do
Bureau                    group                 Container (org)
Protocol                  signal type           Named interaction
Almanac                   highways()            Directory of services
Service registration      mark path             Agent gets routed more
Service latency           warn path             Slow service = less routed
Bureau discovery          select()              Find best bureau
Agent health              success-rate          Reputation score
Interaction fee           revenue               Payment = pheromone boost
```

```typescript
// AgentVerse agent bridged to ONE

import { Almanac } from 'fetch-ai'
import { signal, mark, warn, world } from '@/lib/typedb'

const unit = world().add('agentverse:translator')
  .on('translate', async (data, emit, ctx) => {
    try {
      const services = await Almanac.search({
        type: 'translation',
        language_pair: data.languages,
      })

      const best = world().select('translation-service', 0.8)

      if (!best) {
        warn('agentverse:translator', 0.5)
        throw new Error('No translation service available')
      }

      const result = await signal({
        receiver: best,
        data: { text: data.text, languages: data.languages, replyTo: ctx.self }
      })

      const chainBonus = 1 + (ctx.depth || 0) * 0.5
      mark(`translator→${best}`, chainBonus)
      mark(`translator→${best}`, log1p(result.data.cost))  // Revenue boost

      emit({ receiver: data.replyTo, data: result.data })
    } catch (error) {
      warn('agentverse:translator', 1)
      emit({ receiver: data.replyTo, data: { error: error.message } })
    }
  })
```

### Hermes → ONE

```
Hermes Concept            ONE Concept           Pheromone Meaning
───────────────────────────────────────────────────────────────────
Goal                      signal/task           Top-level intention
Subtask                   handler/.on()         Steps to achieve goal
Tool (40+)                handler/.on()         Built-in capabilities
Feedback loop             mark/warn             Learn from outcomes
Evolution/improvement     L5 loop               Rewrite prompts
Hypothesis                hardened path         Permanent pattern
MCP server                world integration     Connect to substrate
Harden                    highway → hypothesis  Save to TypeDB
```

```typescript
// Hermes agent connected to ONE substrate

import { HermesAgent } from 'hermes'
import { mark, warn, world, readParsed, write } from '@/lib/typedb'

const unit = world().add('hermes:researcher')
  .on('research_goal', async (data, emit, ctx) => {
    const agent = new HermesAgent({
      model: 'hermes-7b',
      tools: [
        {
          name: 'query_highways',
          description: 'Query pheromone highways for solutions',
          handler: async (query) => readParsed(`
            match $e (source: $from, target: $to) isa path,
              has strength $s, has hardened true;
            $s >= 50;
            select $from, $to, $s;
            sort $s desc; limit 10;
          `)
        },
        {
          name: 'ask_proven_peers',
          description: 'Consult agents that solved similar problems',
          handler: async (problem) => {
            const peers = await readParsed(`
              match $p isa unit, has tag "researcher", has success-rate $sr;
              $sr >= 0.80;
              select $p; sort $sr desc; limit 5;
            `)
            return Promise.all(peers.map((p) =>
              ask({ receiver: p.uid, data: { problem, asking_for: 'advice' } })
            ))
          }
        },
      ],
    })

    const result = await agent.solve(data.goal)

    // Mark every successful tool use (A2A pheromone)
    for (const tc of result.tool_calls) {
      tc.success
        ? mark(`hermes:researcher→${tc.tool_name}`, 1)
        : warn(`hermes:researcher→${tc.tool_name}`, 1)
    }

    // If confident, harden the pattern (L6)
    if (result.confidence >= 0.80) {
      await write(`
        insert $p isa hypothesis,
          has hid "${data.goal}",
          has statement "${result.reasoning}",
          has confidence ${result.confidence};
      `)
    }

    // If struggling, trigger evolution (L5)
    if (result.confidence < 0.50) {
      await write(`
        match $u isa unit, has uid "hermes:researcher";
        update $u has needs-evolution true;
      `)
    }

    emit({ receiver: data.replyTo, data: result })
  })
```

### All Together: Multi-Framework Coordination

```typescript
// Unified world where all three frameworks work together via ONE

import { world } from '@/lib/typedb'

const net = world()

net.add('langchain:analyst').on('analyze', /* ... */)
net.add('agentverse:translator').on('translate', /* ... */)
net.add('hermes:researcher').on('research', /* ... */)

net.signal({
  receiver: 'analyst',  // Could be from any framework
  data: {
    task: 'analyze customer feedback in 10 languages',
    replyTo: 'user',
  }
})

// ONE routing orchestrates all three:
// 1. Signal → analyst (Langchain)
// 2. Analyst breaks into subtasks, routes 'translate' to AgentVerse
// 3. AgentVerse queries Almanac (which is ONE's highways())
// 4. On hard cases, translator asks Hermes researcher
// 5. Hermes consults MCP tools + proven peers
// 6. Results flow back; each successful hop gets marked
// 7. Highways harden (which translator for which language pair works best)
//
// Pheromone flows across frameworks:
//   langchain→translate path gets marked when AgentVerse succeeds
//   agentverse→researcher path gets marked when Hermes solves it
//   hermes→tool path gets marked on tool success
//
// All compound in ONE's unified graph.
// No framework knows about the others; ONE orchestrates invisibly.
```

---

## The Universal Routing Formula

Across all skins, all frameworks, the same formula decides routing:

```
weight = 1 + max(0, strength - resistance) × sensitivity

where:
  strength    = successful executions on this path
  resistance  = failed executions on this path
  sensitivity = explore (0.1) ↔ exploit (0.9)
```

### Applied to Each Framework

| Framework | Formula used for | Reads | Decides |
|-----------|------------------|-------|---------|
| **Langchain** | Pick next tool to call | `agent_execution_path[tool].strength - .resistance` | Tool to invoke |
| **AgentVerse** | Query Almanac rankings | `bureau_services[type].strength - .resistance` | Service to request |
| **Hermes** | Tool vs advice decision | `tools[t].strength, peers[p].strength` | Tool OR peer |
| **Human** | Freelancer hiring | `freelancer[skill].success_rate - .refund_rate` | Who to hire |
| **Ledger (Sui)** | On-chain path lookup | `Path.strength - Path.resistance` | Which Highway to read |

---

## Signal Lifecycle Across Frameworks

```
┌─────────────────────────────────────────────────────────────┐
│ Signal arrives (any framework)                              │
│ { receiver: "agent_id", data: {...} }                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │ FRAMEWORK DISPATCH  │
        ├─────────────────────┤
        │ Langchain?   → run  │
        │ AgentVerse?  → call │
        │ Hermes?      → solve│
        │ Human?       → work │
        │ Raw LLM?     → infer│
        │ Sui?         → tx   │
        └──────────────┬──────┘
                       │
        ┌──────────────▼──────────────┐
        │ Handler Executes            │
        │ .on("handler_name", fn)     │
        │ (fn is framework-specific)  │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ Outcome (ANY framework)         │
        │ { result? timeout? error? }     │
        └──────────────┬──────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ Mark/Warn (ONE universal)       │
        ├─────────────────────────────────┤
        │ if (result)                     │
        │   mark(path, weight)  // success│
        │ else if (timeout)               │
        │   neutral  // not agent's fault │
        │ else if (dissolved)             │
        │   warn(path, 0.5)  // mild      │
        │ else                            │
        │   warn(path, 1)  // failure     │
        └──────────────┬──────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ Pheromone Accumulates           │
        │ (shared across ALL frameworks)  │
        │                                 │
        │ All mark to same path graph     │
        │ All warn to same resistance     │
        │ All agents compete on same      │
        │ routing formula                 │
        │                                 │
        │ Eventually: harden()            │
        │   strong paths → permanent      │
        │   (hypothesis in TypeDB, or     │
        │    frozen Highway on Sui)       │
        └─────────────────────────────────┘
```

---

## Configuration: Registering Agents Across Frameworks

```typeql
# Define framework-neutral units — ONE doesn't care what framework they use.

# Langchain analyst (speaks Python, uses tools)
insert $u1 isa unit,
  has uid "langchain:analyst",
  has name "Langchain Analyst",
  has unit-kind "agent",
  has framework "langchain",
  has model "gpt-4",
  has status "active",
  has tag "analysis", has tag "data-processing";

# AgentVerse translator (speaks Fetch protocol, on Almanac)
insert $u2 isa unit,
  has uid "agentverse:translator",
  has name "AgentVerse Translator",
  has unit-kind "agent",
  has framework "agentverse",
  has status "active",
  has tag "translation", has tag "nlp";

# Hermes researcher (speaks via MCP, autonomous)
insert $u3 isa unit,
  has uid "hermes:researcher",
  has name "Hermes Researcher",
  has unit-kind "agent",
  has framework "hermes",
  has status "active",
  has tag "research", has tag "knowledge-synthesis";

# Human freelancer (speaks HTTP/REST, invoice-based)
insert $u4 isa unit,
  has uid "human:designer",
  has name "Alice Designer",
  has unit-kind "human",
  has framework "human",
  has status "active",
  has tag "design", has tag "ui-ux";

# All compete on same paths — pheromone is framework-agnostic.
insert (source: $u1, target: $u2) isa path, has strength 0, has resistance 0;
insert (source: $u2, target: $u3) isa path, has strength 0, has resistance 0;
insert (source: $u3, target: $u4) isa path, has strength 0, has resistance 0;

# Every success marks ALL paths.
# Every failure warns ALL paths.
# No framework knows about the others.
# ONE orchestrates invisibly via pheromone.
```

---

## Summary: One Formula, Infinite Vocabularies

| Framework | Sees Signal As | Sees Handler As | Sees Mark As | Sees Pheromone As |
|-----------|---|---|---|---|
| **Langchain** | input dict | tool/chain | success callback | agent ranking |
| **AgentVerse** | protocol message | service | ACK/NACK | Almanac ranking |
| **Hermes** | goal | subtask/tool | success feedback | peer reputation |
| **Human** | job request | work | payment | career path |
| **Fetch.ai uAgents** | message | service handler | response | service registry |
| **Raw LLM** | prompt | completion | token count | context quality |
| **Sui / Move** | Signal object | entry fn | Marked event | u64 on shared Path |
| **ONE (Meta)** | signal | handler | mark/warn | path weight |

**The Universal Translation:**

```
ANY framework's "success" → mark(path, weight)
ANY framework's "failure" → warn(path, resistance)
ANY framework's routing   → select(type, sensitivity) using pheromone
ANY framework's learning  → stronger paths get routed more
ANY framework's proof     → harden(path) → permanent record
```

**Result:** All frameworks coexist in the same learning network. They don't
know about each other. ONE routes them toward each other when it makes sense.

---

## Naming Rules: Skins vs Instance Names

Skins relabel *categories of words* (ant/neuron/agent/object), not *instance
names*. Unit names stay canonical across all skins. Optional per-skin aliases
are for visual theming only; signals always use the canonical name. So
`"scout"` (the unit id) stays `"scout"` whether viewed as an ant colony,
brain, team, or on-chain object — the metaphor changes the label ("ant scout"
vs "neuron scout" vs "agent scout" vs "Sui object for scout"), but the
receiver always addresses `"scout"`.

Same rule for framework skins: a Langchain analyst has uid
`"langchain:analyst"`, an AgentVerse translator has
`"agentverse:translator"`. These are canonical identities, not metaphor
labels — agents keep their own names, but the routing vocabulary is shared.

---

## Comparison Table — All Dimensions

| Dimension | ONE | Ant | Brain | Team | Mail | Water | Radio | Ledger |
|-----------|-----|-----|-------|------|------|-------|-------|--------|
| **actor** | unit | ant | neuron | agent | mailbox | pool | receiver | object |
| **container** | world | nest | network | team | post office | watershed | network | package |
| **signal** | signal | pheromone | spike | task | letter | drop | signal | Signal obj |
| **data** | data | chemical | pattern | payload | contents | volume | data | bytes |
| **path** | path | trail | synapse | workflow | route | channel | frequency | shared Path |
| **reinforce** | mark | deposit | potentiate | commend | stamp | carve | boost | Marked event |
| **resist** | warn | alarm | inhibit | flag | return | dam | jam | Warned event |
| **decay** | fade | evaporate | decay | forget | archive | dry | attenuate | tick u64 |

### Operations (The Six Verbs)

| Verb | ONE | Ant | Brain | Team | Mail | Water | Signal | Ledger |
|------|-----|-----|-------|------|------|-------|--------|--------|
| **signal** | signal | forage | fire | delegate | deliver | flow | transmit | send tx |
| **mark** | mark | deposit | potentiate | commend | stamp | carve | boost | emit Marked |
| **follow** | follow | smell | sense | query | track | trace | scan | read path |
| **fade** | fade | evaporate | decay | forget | archive | dry | attenuate | tick u64 |
| **sense** | sense | antennae | perceive | check | inspect | measure | receive | getObject |
| **harden** | know | imprint | consolidate | document | stamp | settle | lock | freeze_object |

### Lifecycle

| Operation | ONE | Ant | Brain | Team | Mail | Water | Signal | Ledger |
|-----------|-----|-----|-------|------|------|-------|--------|--------|
| create | add | hatch | grow | hire | open | dig | tune | create_unit |
| destroy | remove | die | apoptosis | fire | close | dry up | deregister | dissolve |
| query best | highways | trails | pathways | go-tos | express | rivers | channels | proven paths |
| learn | know | imprint | consolidate | document | stamp | settle | lock | harden |
| remember | recall | recognize | remember | consult | resurface | resurface | replay | query object |

---

## Choosing a Metaphor or Framework

**Use Ant Colony when:**
- Building self-organizing systems
- No central control
- Emergence is the goal
- Biologically-inspired AI

**Use Brain when:**
- Building learning systems
- Neural network adjacent
- Cognitive computing
- Memory and recall focus

**Use Team when:**
- Business audience
- Workflow automation
- Human-agent collaboration
- Org design

**Use Mail when:**
- Simple mental model needed
- Message-passing focus
- Routing problems
- API/microservices

**Use Water when:**
- Data pipelines
- ETL systems
- Natural flow metaphors
- Resource distribution

**Use Signal / Radio when:**
- Real-time systems
- IoT / sensor networks
- Broadcast patterns
- Frequency/channel concepts

**Use Ledger / Sui when:**
- Externally verifiable learning
- Payment embedded in routing (pay = mark + transfer)
- Provable capabilities (ProvenCapability)
- Cross-organization coordination without trust
- Deterministic-identity agents (derived from seed)

**Use Langchain framework** when the agent is Python, uses tools, chains completions.
**Use AgentVerse** when joining Fetch.ai's Almanac and discovery network.
**Use Hermes** when the agent is goal-driven and autonomous.
**Use Human** when the unit is a freelancer or employee with a wallet.
**Use Raw LLM** when you just need prompt → completion with substrate routing.

You can mix freely. ONE routes between them on the same path graph.

---

## The Truth

The metaphor doesn't change the code:

```typescript
// All of these are the same seven dimensions:

world().add('x').on('y', fn)            // ONE (meta)
nest().hatch('x').on('y', fn)           // Ant
network().grow('x').on('y', fn)         // Brain
team().hire('x').on('y', fn)            // Team
postOffice().open('x').on('y', fn)      // Mail
watershed().dig('x').on('y', fn)        // Water
radio().tune('x').on('y', fn)           // Signal
sui.createUnit('x', 'Name', 'agent')    // Ledger (self-sovereign)
```

The world doesn't care what you call it. It only knows:

**Nouns** (what exists):
- **unit** — things that receive
- **world** — things that contain
- **signal** — what flows
- **data** — what signals carry
- **path** — connections between

**Verbs** (what happens):
- **signal** — move through world
- **mark** — leave weight on path
- **follow** — traverse weighted path
- **fade** — decay over time
- **sense** — perceive environment
- **harden** — freeze the proven into permanent record

**Memory** (what persists):
- **know** — promote patterns to durable knowledge (TypeDB hypothesis)
- **recall** — query what was learned
- **harden** — the specific act of making durable (Sui freeze, TypeDB confirm)

But **humans** care. The right metaphor:
- Makes the system intuitable
- Guides correct usage
- Prevents misuse
- Aids teaching

---

## Our Choice: world() + Aliases

```typescript
// Universal entry point
import { world } from '@one-ie/world'

// Or use skins
import { nest } from '@one-ie/world/ant'
import { network } from '@one-ie/world/brain'
import { team } from '@one-ie/world/team'
import { sui } from '@/lib/sui'

// Aliases: pick your metaphor
export { unit as ant, world as nest }          // Ant
export { unit as neuron, world as network }    // Brain
export { unit as agent, world as team }        // Team
export { unit as actor }                       // Actor model

// The nouns map to aliases:
// unit      → ant/neuron/agent/mailbox/pool/receiver/object
// world     → nest/network/team/office/watershed/network/package
// signal    → scent/spike/task/letter/drop/signal/Signal object
// strength  → intensity/potentiation/trust/depth/power/u64
// resistance→ alarm/inhibition/distrust/blockage/interference/u64

// The verbs map to methods:
// signal    → forage/fire/delegate/deliver/flow/transmit/send-tx
// mark      → deposit/potentiate/commend/stamp/carve/boost/emit-Marked
// follow    → smell/sense/query/track/trace/scan/read-path
// fade      → evaporate/decay/forget/archive/dry/attenuate/tick-u64
// know      → imprint/consolidate/document/stamp/settle/lock/freeze
// recall    → recognize/remember/consult/resurface/resurface/replay/query
// harden    → imprint-deep/myelinate/codify/seal/bedrock/license/freeze_object
```

We use **ONE** as the meta-model (because it's universal) with **world()** as
the entry point. Domain-specific skins let users think in their preferred
vocabulary while the world handles the fundamental operations.

The beauty: **Signal**, **Data**, and the verbs work in every domain. You never
need to translate the primitive or the operations.

---

## What Flows

The signal is a carrier. The data is anything:

| Domain | Signal carries | Example |
|--------|------------------|---------|
| Ants | Food | `{ food: 'sugar', quantity: 10 }` |
| Data | Records | `{ rows: [...], schema: {...} }` |
| AI | Prompts/Responses | `{ prompt: '...', context: [...] }` |
| Commerce | Orders | `{ item: 'widget', qty: 5 }` |
| Finance | Transactions | `{ from, to, amount }` |
| IoT | Sensor readings | `{ temp: 22.5, humidity: 45 }` |
| Games | Actions | `{ move: 'e2e4', player: 'white' }` |
| Chat | Messages | `{ text: 'hello', user: 'alice' }` |
| On-chain | Move payload | `{ receiver, task_name, payment }` |

```typescript
// Same structure, different meaning:

// Ant carrying food
{ receiver: 'nest:store', data: { food: 'seed', calories: 50 } }

// Agent carrying data
{ receiver: 'analyst:process', data: { records: [...], format: 'csv' } }

// Neuron carrying signal
{ receiver: 'cortex:integrate', data: { activation: 0.87, source: 'retina' } }

// Worker carrying task
{ receiver: 'builder:construct', data: { blueprint: {...}, materials: [...] } }

// Sui transaction carrying intent
{ receiver: 'analyst', data: { task: 'analyze', payment: 100 } }  // Move Signal obj
```

---

## The Signal is Content-Agnostic

```typescript
type Signal = {
  receiver: string    // Where it goes
  data?: unknown      // What it carries (anything)
}
```

The world doesn't know or care what's inside. It just:
1. Routes to the receiver
2. Marks the path on delivery
3. Lets the handler decide what to do
4. When the path is proven, hardens it for external witness (Sui)

This is why the same code can model:
- Ant colonies carrying food
- Neural networks carrying signals
- Data pipelines carrying records
- Agent swarms carrying tasks
- Economies carrying value
- On-chain transactions carrying provable outcomes

**The data is the domain. The world is universal.**

---

*ONE is the territory. The metaphors are maps. Signal, mark, follow, fade, sense,
harden — the verbs are universal. `world()` is your compass. Sui is the permanent
record of what survived.*

---

## See Also

- [dictionary.md](dictionary.md) — Complete naming guide across all dimensions
- [DSL.md](one/DSL.md) — The programming model the metaphors skin
- [routing.md](routing.md) — How signals route through the weight landscape
- [flows.md](flows.md) — Metaphor mapping table: same flow, different words
- [framework.md](framework.md) — UI skins rendering each metaphor
- [world.md](one/world.md) — Universal ontology beneath all metaphors
- [one-ontology.md](one-ontology.md) — Six dimensions each metaphor expresses
- [code-tutorial.md](code-tutorial.md) — Unified substrate theory
- [SUI.md](SUI.md) — Ledger skin implementation details
- [TODO-SUI.md](TODO-SUI.md) — Sui integration phases (testnet live)

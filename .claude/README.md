# The Substrate

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   70 lines.  Two fields.  Concurrency safe.  AI agents.                     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   { receiver, payload }                                             │   │
│   │                                                                     │   │
│   │   That's all that flows.                                            │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Pattern

```
100 million years ago     →  Ants discovered it
500 million years ago     →  Brains discovered it
2017                      →  Transformers rediscovered it

Nodes that compute.
Edges that connect.
Weights that learn.
Signals that flow.
No controller.
```

---

## The API

```typescript
// ENVELOPE
{ receiver: string, payload?: unknown }

// UNIT
.on(name, (payload, emit, ctx) => result)    // define task
.then(name, result => envelope)               // define continuation
.role(name, task, context)                    // context-bound task

// COLONY
spawn(id)           // create unit
send(envelope)      // flow signal
mark(edge)          // strengthen
smell(edge)         // read weight
fade(rate)          // decay all
highways(n)         // top n edges

// CONTEXT
ctx.from            // who sent this
ctx.self            // who am I
emit(envelope)      // send more (carries my identity)
```

---

## Skills

```
┌──────────────┬────────────────────────────────────────────────┐
│ /astro       │ Pages, islands, SSR, client directives         │
├──────────────┼────────────────────────────────────────────────┤
│ /react19     │ Actions, use(), transitions, optimistic        │
├──────────────┼────────────────────────────────────────────────┤
│ /reactflow   │ Node graphs, custom nodes/edges, dark theme    │
├──────────────┼────────────────────────────────────────────────┤
│ /shadcn      │ Cards, badges, tabs, dark theme components     │
├──────────────┼────────────────────────────────────────────────┤
│ /typedb      │ TypeQL schema, inference, queries              │
└──────────────┴────────────────────────────────────────────────┘
```

---

## Architecture

```
src/engine/
├── substrate.ts          # 70 lines — THE FOUNDATION
├── unit.ts               # Legacy (compatible)
├── world.ts             # Legacy (compatible)
└── index.ts              # Exports

src/components/
├── graph/
│   ├── ColonyGraph.tsx   # Visualize
│   └── ColonyEditor.tsx  # Interactive (record, replay, AI mode, heat map)
├── panels/
│   └── HighwayPanel.tsx  # Strongest paths
└── AgentWorkspace.tsx    # Main workspace

docs/
└── code.md               # The substrate specification
```

---

## AI Agent Patterns

```typescript
// REQUEST / RESPONSE
.on('ask', ({ question }, emit, { self }) => {
  emit({ receiver: 'oracle', payload: { question, replyTo: self } })
})

// CLAIM TASK
.on('claim', ({ taskId }, emit, { from }) => {
  !claims[taskId] && (claims[taskId] = from,
    emit({ receiver: from, payload: { claimed: taskId } }))
})

// PAYMENT
.on('pay', ({ to, amount }, emit, { from }) => {
  balances[from] >= amount && (
    balances[from] -= amount,
    balances[to] += amount,
    emit({ receiver: to, payload: { received: amount, from } }))
})

// SWARM
.on('join', ({ capabilities }, emit, { from }) => {
  registry[from] = capabilities
  Object.keys(registry).forEach(id =>
    emit({ receiver: id, payload: { joined: from } }))
})

// STREAMING
.on('ingest', async ({ url }, emit) => {
  const stream = await connect(url)
  stream.on('frame', f => emit({ receiver: 'process', payload: f }))
})
```

---

## Rules

```
.claude/rules/
├── engine.md     # src/engine/*.ts — Zero returns, positive flow
├── react.md      # *.tsx — React 19 patterns
└── astro.md      # *.astro — Islands, directives
```

---

## Commands

```bash
bun dev           # localhost:4321
bun build         # Production
bun preview       # Preview build
```

---

## The Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   REINFORCE                         DECAY                       │
│   (learn)                           (forget)                    │
│                                                                 │
│   signal succeeds                   time passes                 │
│        │                                 │                      │
│        ▼                                 ▼                      │
│   edge strengthens                  edge weakens                │
│        │                                 │                      │
│        ▼                                 ▼                      │
│   more signals                      signals reroute             │
│        │                                 │                      │
│        ▼                                 ▼                      │
│   SUPERHIGHWAY                      edge gone                   │
│                                                                 │
│   Both loops. Always. That's intelligence.                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Insight

```
Ants don't talk to each other.
Neurons don't talk to each other.
They modify the connections between them.
Other signals read those modifications.

That's intelligence.
That's what this is.

70 lines.
Two fields.
Build everything.
```

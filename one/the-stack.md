# The Stack

**~600 lines. Two fires. One ontology.**

---

## Code

| Module          | Lines | What                        | Where     |
| --------------- | ----- | --------------------------- | --------- |
| `one.move`      | 250   | On-chain substrate          | Sui       |
| `one.ts`        | 70    | world() — 6 dimensions      | Runtime   |
| `substrate.ts`  | 70    | Unit + World + strength graph | Runtime   |
| `agentverse.ts` | 70    | 2M agents as colony         | Fetch.ai  |
| `asi.ts`        | 70    | Orchestrator                | Fetch.ai  |
| save.ts`        | 40    | TypeDB sync                 | Knowledge |
| `llm.ts`        | 30    | Any model as a unit         | Runtime   |

## Schema

| File | Lines | What |
|------|-------|------|
| `one.tql` | 330 | THE schema (6 dimensions + 6 lessons + commerce) |
| `sui.tql` | 250 | Move contracts as TypeQL |
| `skins.tql` | 150 | 6 metaphor skins |

## Two Fires

```
Move ACTS.          TypeDB REASONS.
Same ontology.      Same structures.
Two views.          One truth.
```

## Sui Objects

| Object | Type | Speed |
|--------|------|-------|
| Unit | Owned | Fast path (no consensus) |
| World | Shared | Consensus required |
| Signal | Transferred | Consumed on arrival |
| Path | Shared | Both endpoints modify |
| Highway | Frozen | Immutable forever |

## One Interface

```typescript
const w = world()
w.actor(id, type)                    // create
w.signal({ receiver, data })         // move through world
w.mark(from, to, n)                  // leave weight on path
w.fade(rate)                         // decay
w.follow(type)                       // traverse paths
w.know()                      // persist
```

---

*~600 lines. The whole stack.*

---

## See Also

- [flows.md](flows.md) — How signals flow through the stack layers
- [code.md](code.md) — TypeScript substrate implementation
- [Plan.md](Plan.md) — Strategic context for the stack
- [one-ontology.md](one-ontology.md) — Six dimensions the stack implements
- [typedb.md](typedb.md) — TypeDB schema layer
- [framework.md](framework.md) — UI rendering layer

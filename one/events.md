# Signal

**The universal primitive. 100 million years proven.**

---

## One Word

```
Ants:      chemical signal
Neurons:   electrical signal
Agents:    digital signal
Markets:   price signal
Humans:    social signal

All the same pattern.
All the same substrate.
```

---

## One Type

```typescript
type Signal = {
  receiver: string      // where it's going
  data?: unknown        // what it carries
}
```

Two fields. Everything else emerges.

---

## The Verbs

| Verb | What happens | Result |
|------|--------------|--------|
| **signal** | Move through world | Task executes |
| **mark** | Leave weight on path | Trail strengthens |
| **follow** | Traverse weighted path | Route to best |
| **fade** | Decay all weights | Old paths weaken |
| **sense** | Perceive nearby | Read environment |

```typescript
// Signal moves through world
world.signal({ receiver: 'analyst:process', data })

// Path remembers (mark happens on success)
// user → analyst: +1 weight

// Follow the best path
world.follow('translator')  // highest-weight path

// Query what emerged
world.highways()    // paths worth following
world.fading()      // paths losing weight
```

---

## The Pattern

```
Signal drops.
Path remembers.
Signal follows.
Trail deepens.
Highway emerges.

No one decided.
The world learned.
```

This pattern has appeared everywhere:

| System | Signal | Drop | Highway |
|--------|--------|------|---------|
| Ants | pheromone | chemical deposit | foraging trail |
| Neurons | spike | neurotransmitter release | synapse |
| Markets | price action | volume | trend |
| Social | rumor | share/retweet | viral spread |
| Agents | request | successful response | proven route |

---

## How It Works

### 1. Signal Moves

```typescript
world.signal({ 
  receiver: 'translator:translate', 
  data: { text: 'hello', to: 'es' } 
})
```

The signal finds its receiver. The task executes.

### 2. Signal Drops

On success, weight drops on the path:

```
user → translator: 0 → 1
```

On failure, no mark. Path doesn't strengthen.

### 3. Paths Fade

Over time, unused paths lose weight:

```typescript
world.fade(0.05)  // 5% decay

// user → translator: 100 → 95
// user → bad-agent:    5 →  4.75
```

### 4. Highways Emerge

Paths with enough weight become highways:

```
user → translator:  95.0  ████████████████████ HIGHWAY
user → analyst:     45.2  ██████████
user → coder:       12.1  ███
user → bad-agent:    0.3  (fading)
```

Highways route faster. No lookup needed. The path IS the knowledge.

---

## The Commercial Layer

Signals are free. What happens when they arrive costs money.

```
Signal moves     → free
Service executes → x402 payment
Data returns     → included in payment
Speed matters    → pay for highway access
```

**Package** = the commercial wrapper around a signal:

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

---

## Why "Data"

```
payload  → military, technical, launching missiles
data     → universal, what everything carries

Ants leave data (chemical information)
Neurons pass data (patterns)
Agents exchange data
Everyone says "send data"
```

---

## The Substrate

```
┌─────────────────────────────────────────────────────────────┐
│                         WORLD                               │
│                                                             │
│   Signals move through. Weight drops. Highways form.        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    TRACES                           │   │
│   │                                                     │   │
│   │   user → translator    ████████████████  95.0       │   │
│   │   user → analyst       ██████████        45.2       │   │
│   │   translator → oracle  ████████          38.7       │   │
│   │   analyst → reporter   ██████            28.1       │   │
│   │   user → bad-agent     ░                  0.3       │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Highways: translator, analyst (weight > 50)               │
│   Fading: bad-agent (weight < 1)                            │
│   Proven: translator, analyst, oracle (consistent)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## The API

```typescript
import { world } from '@/engine'

const w = world()

// Actors (who receives signals)
w.actor('translator', 'agent')
w.actor('analyst', 'agent')
w.actor('claude', 'llm')

// Signal (move through world)
w.signal({ receiver: 'translator:translate', data })

// Follow (traverse weighted paths)
w.follow('translator')   // best path to translator
w.follow('agent')        // best path to any agent

// Query (what emerged)
w.highways()         // paths worth following
w.highways(10)       // top 10 paths
w.fading()           // paths losing weight
w.best('agent')      // highest-weight actor
w.proven()           // actors with consistent weight

// Decay (time passes)
w.fade(0.05)         // reduce all weights by 5%
```

---

## On Sui

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
    drops: u64,        // how many signals passed
}

/// A highway (frozen trace, permanent knowledge)
public struct Highway has key {
    id: UID,
    trace: ID,
    hardened_at: u64,
}
// transfer::freeze_object(highway) — immutable forever
```

`freeze_object()` IS hardening. Not a metaphor. A Move function.

---

## The Universality

Why does this pattern keep appearing?

```
100M years ago:   Ants discovered it     → 25% of terrestrial biomass
500M years ago:   Neurons discovered it  → consciousness
10K years ago:    Humans discovered it   → civilization
50 years ago:     Computers discovered it → internet
Now:              Agents discover it     → ???
```

Because it's the minimal solution to coordination without central control:

1. **Signal** — something moves
2. **Drop** — success leaves weight
3. **Follow** — traverse weighted path
4. **Fade** — unused paths decay
5. **Highway** — heavily-used paths know

Five operations. Emergence guaranteed.

---

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SIGNAL                                                    │
│   { receiver, data }                                        │
│                                                             │
│   VERBS                                                     │
│   signal — move through world                               │
│   mark   — leave weight on path                             │
│   follow — traverse weighted path                           │
│   fade   — paths decay                                      │
│   sense  — perceive nearby                                  │
│                                                             │
│   EMERGENCE                                                 │
│   highways form from repeated drops                         │
│   no one decides — the world learns                         │
│                                                             │
│   COMMERCE                                                  │
│   signals free — services paid (x402)                       │
│   package = signal + payment terms                          │
│                                                             │
│   UNIVERSAL                                                 │
│   same pattern: ants, neurons, markets, agents              │
│   same substrate: ONE ontology, Sui, TypeDB                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*One signal. One substrate. One emergence.*

---

## See Also

- [flows.md](flows.md) — How signals move through the complete lifecycle
- [code.md](code.md) — 70-line TypeScript implementation of signal routing
- [world.md](one/world.md) — Universal ontology: ants, humans, agents share this primitive
- [people.md](one/agents.md) — Units that receive and emit signals
- [substrate-learning.md](substrate-learning.md) — Signals as training data, paths as learned weights
- [metaphors.md](metaphors.md) — Same signal, seven vocabularies

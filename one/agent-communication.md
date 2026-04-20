# Agent Communication

How signals flow through the ONE substrate. Deterministic routing, pheromone learning, closed loops.

---

## The Signal

```typescript
type Signal = {
  receiver: string      // "unit" or "unit:task"
  data?: string         // Payload (string only, NOT object)
  task?: string         // Optional: skill name for routing
  sender?: string       // Who initiated (required for API)
}
```

**Key:** `data` is a **string**, not an object. Convention is structured as JSON or plain text.

**Receiver format:**
- `"bob"` — route to bob's default handler (`.on('default', ...)`)
- `"bob:internal"` — route to bob's `internal` handler (`.on('internal', ...)`)
- `"bob:fetch"` — route to bob's `fetch` handler

---

## Unit Registration

Before a unit can receive signals, it must be registered in TypeDB.

### Via TypeQL (Raw)

```typeql
insert $u isa unit,
  has uid "bob",
  has name "Bob",
  has model "meta-llama/llama-4-maverick",
  has system-prompt "You are Bob. You help with X.",
  has tag "helper";
```

### Via API

```bash
curl -X POST http://localhost:4321/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "id": "bob",
    "name": "Bob",
    "model": "anthropic/claude-haiku-4-5",
    "systemPrompt": "You are Bob. You help with X.",
    "tags": ["helper", "retrieval"]
  }'
```

### Via Markdown + Sync

```markdown
---
name: bob
model: anthropic/claude-haiku-4-5
tags: [helper, retrieval]
---

You are Bob. You help with X.
```

Then:
```bash
curl -X POST http://localhost:4321/api/agents/sync \
  -H "Content-Type: application/json" \
  -d '{"markdown": "---\nname: bob\n..."}'
```

---

## Task Handlers

A unit can handle multiple tasks. Each task is an `.on()` handler in the runtime or a skill in TypeDB.

### Runtime (in-memory)

```typescript
import { world } from '@/engine/world'

const net = world()

const bob = net.add('bob')
  .on('default', (data, emit, ctx) => {
    console.log(`Bob received: ${data}`)
    return `Hello from Bob`
  })
  .on('internal', (data, emit, ctx) => {
    console.log(`Internal task: ${data}`)
    emit({ receiver: 'alice', data: 'Please help with ' + data })
    return `Processing internally`
  })
```

### TypeDB (Persistent)

```typeql
insert $u isa unit, has uid "bob";
insert $s isa skill, has skill-id "bob:internal", has name "internal", has tag "helper";
insert (provider: $u, offered: $s) isa capability, has price 0.0;
```

---

## Signal Flow (Closed Loop)

```
1. Signal enters
   POST /api/signal { sender: "user", receiver: "bob:internal", data: "..." }

2. TypeDB records it
   insert (sender: user, receiver: bob) isa signal, has data "...", has ts ...;

3. Route & execute
   a. Find bob in TypeDB
   b. Get model + system-prompt (if LLM-backed)
   c. Call OpenRouter (or run sync handler)
   d. Get response

4. Mark or warn path
   a. If success: mark(user→bob, chainDepth)
   b. If failure: warn(user→bob, 1.0)
   c. If dissolved: warn(user→bob, 0.5)

5. Return to client
   { ok: true, success: true, result: "...", latency: 123 }
```

**Four Outcomes:**

| Outcome | What happened | Action |
|---------|---------------|--------|
| `result` | Handler returned value | `mark()` — path strengthens |
| `timeout` | Handler was slow (>5s) | Neutral — not the unit's fault |
| `dissolved` | Unit/capability missing | `warn(0.5)` — mild penalty |
| `failure` | Handler threw or returned null | `warn(1.0)` — full penalty |

---

## API Endpoints

### POST /api/signal — Send a Signal

```bash
curl -X POST http://localhost:4321/api/signal \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "user",
    "receiver": "bob:internal",
    "data": "What is the capital of France?",
    "task": "qa"
  }'
```

**Response:**
```json
{
  "ok": true,
  "routed": "bob",
  "result": "The capital of France is Paris.",
  "latency": 1234,
  "success": true,
  "sui": null
}
```

**Fields:**
- `ok` — Signal was recorded to TypeDB
- `routed` — Which unit answered (if routing happened)
- `result` — LLM response (first 500 chars)
- `latency` — Total time (ms)
- `success` — Whether the path strengthened (mark) or weakened (warn)
- `sui` — Sui transaction digest (if mirrored to chain)

**Errors:**
- `400` — Missing sender/receiver or invalid format
- `500` — TypeDB error or OpenRouter failure

---

## Debugging Dissolution

Signal sent but **dissolved** (routed=null, success=false)?

### Checklist

1. **Does bob exist?**
   ```bash
   curl http://localhost:4321/api/agents | grep bob
   ```

2. **Is the receiver format correct?**
   ```
   ✓ "bob"         (default handler)
   ✓ "bob:internal" (internal handler)
   ✗ "bob-internal" (invalid — hyphens in task names need underscores)
   ✗ "bob:in-ternal" (hyphens not allowed)
   ```

3. **Does bob have model + system-prompt?**
   ```bash
   curl http://localhost:4321/api/query -d '{
     "query": "match $u isa unit, has uid \"bob\", has model $m, has system-prompt $sp; select $m, $sp;"
   }'
   ```

4. **Is the skill/task registered?**
   If sending to `"bob:internal"`, bob must have a handler at `.on('internal', ...)` or a capability offering the `internal` skill.

5. **Check TypeDB signal history**
   ```bash
   curl http://localhost:4321/api/signals?limit=10
   ```
   Look for your sender/receiver pair. If it's there but routed=null, the path dissolved at execution.

---

## Examples

### 1. Simple Unit-to-Unit

Register alice and bob:

```bash
curl -X POST http://localhost:4321/api/agents/register \
  -d '{"id": "alice", "name": "Alice", "model": "anthropic/claude-haiku-4-5", "systemPrompt": "You are Alice. You help with retrieval."}'

curl -X POST http://localhost:4321/api/agents/register \
  -d '{"id": "bob", "name": "Bob", "model": "anthropic/claude-haiku-4-5", "systemPrompt": "You are Bob. You help with synthesis."}'
```

Alice asks Bob a question:

```bash
curl -X POST http://localhost:4321/api/signal \
  -d '{
    "sender": "alice",
    "receiver": "bob",
    "data": "How do we combine retrieval and synthesis?"
  }'
```

**What happens:**
1. TypeDB records signal: alice → bob
2. Bob's system-prompt + data fed to LLM
3. LLM responds
4. Path `alice→bob` is marked (strengthened)
5. Next time alice needs bob, the path is stronger (preferred in routing)

---

### 2. Fan-Out (One-to-Many)

Bob receives a question, needs to gather context from multiple units.

```typescript
const bob = net.add('bob')
  .on('synthesis', async (data, emit, ctx) => {
    // Ask alice for retrieval
    emit({ receiver: 'alice:retrieve', data: data, replyTo: ctx.self })
    
    // Ask charlie for context
    emit({ receiver: 'charlie:context', data: data, replyTo: ctx.self })
    
    // Wait for both replies, then synthesize
    return `Synthesized from ${data}`
  })
```

---

### 3. Human-to-Agent Chat

Register yourself as a unit:

```bash
curl -X POST http://localhost:4321/api/agents/register \
  -d '{
    "id": "tony",
    "name": "Tony",
    "systemPrompt": "You are Tony, the human user."
  }'
```

Chat with bob:

```bash
curl -X POST http://localhost:4321/api/signal \
  -d '{
    "sender": "tony",
    "receiver": "bob:internal",
    "data": "What should we build next?"
  }'
```

The pheromone path `tony→bob:internal` strengthens. Over time, the substrate learns which agents tony prefers asking.

---

### 4. Skill-Based Routing

Register a skill and let multiple units offer it:

```typeql
insert $sk isa skill, has skill-id "marketing", has name "marketing", has tag "creative";

# Alice offers marketing
insert (provider: $alice, offered: $sk) isa capability, has price 0.05;

# Bob offers marketing
insert (provider: $bob, offered: $sk) isa capability, has price 0.03;
```

When you signal `bob:marketing`, the system:
1. Looks up the skill
2. Finds all providers (alice, bob)
3. Routes to the strongest path (lowest cost + highest success)

---

## Continuations (.then)

Chain tasks: when one completes, the next fires automatically.

```typescript
const bob = net.add('bob')
  .on('fetch', async (data, emit, ctx) => {
    // Fetch data
    return { items: [...] }
  })
  .then('fetch', (result) => ({
    receiver: 'bob:analyze',
    data: JSON.stringify(result)
  }))
  .on('analyze', async (data, emit, ctx) => {
    // Analyze the fetched data
    return `Analyzed: ${data}`
  })
```

Signal bob to fetch:
```bash
curl -X POST http://localhost:4321/api/signal \
  -d '{
    "sender": "user",
    "receiver": "bob:fetch",
    "data": "Get user data"
  }'
```

**Flow:**
1. bob:fetch executes → returns `{ items: [...] }`
2. `.then()` fires automatically → emits to bob:analyze
3. bob:analyze executes → returns analysis
4. Path `bob:fetch→bob:analyze` gets marked (continuation succeeded)

---

## Pheromone & Learning

Every signal strengthens or weakens the path it uses.

```typescript
// After successful signal
const strength = net.sense('alice→bob')  // 5.0

// Mark manually
net.mark('alice→bob', 10)  // Strengthen
net.warn('alice→bob', 1)   // Weaken

// Check path quality
const edge = net.sense('alice→bob')
const toxic = net.danger('alice→bob') > edge * 2  // Toxic if resistance > 2× strength
```

**Asymmetric decay:**
Every 5 minutes, pheromone fades:
- Strength decays at 0.05/tick (slow)
- Resistance decays at 0.10/tick (fast, forgives mistakes 2x quicker)

This means: good paths compound, bad paths fade fast.

---

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Signal routing | <5ms | TypeDB lookup + LLM call |
| Mark/warn | <1ms | Path update |
| Fade | <100ms | All paths decay |
| Highways query | <10ms | Top paths (cached in KV) |

**Constraint:** If latency > 5s, signal times out (neutral outcome, no warn).

---

## Common Patterns

### Pattern 1: Request-Reply

```bash
# alice asks bob
curl -X POST /api/signal -d '{
  "sender": "alice",
  "receiver": "bob",
  "data": "What time is it?"
}'

# Response: bob's LLM answer is returned in the response
```

### Pattern 2: Broadcast (Fan-Out)

```typescript
const bob = net.add('bob')
  .on('broadcast', (data, emit) => {
    emit({ receiver: 'alice', data })
    emit({ receiver: 'charlie', data })
    return 'Broadcast complete'
  })
```

### Pattern 3: Subscribe & Notify

```bash
# alice subscribes to "important" tags
curl -X POST /api/subscribe -d '{
  "unit": "alice",
  "tags": ["important", "urgent"]
}'

# bob emits a signal with "important" tag
curl -X POST /api/signal -d '{
  "sender": "bob",
  "receiver": "alice",
  "data": "{\"tags\": [\"important\"], \"content\": \"Action required\"}"
}'

# alice receives it automatically
```

---

## Troubleshooting

### Signal Dissolved

**Symptom:** `routed: null, success: false`

**Causes:**
- Unit doesn't exist → `register` it
- Task doesn't exist → add `.on('taskname', ...)` or skill
- Unit has no model → add `model` + `system-prompt`

**Fix:**
```bash
# Check unit exists
curl /api/agents | grep "bob"

# Check model is set
curl /api/query -d '{"query": "match $u isa unit, has uid \"bob\", has model $m; select $m;"}'

# Re-register if needed
curl -X POST /api/agents/register -d '{"id": "bob", "model": "..."}'
```

### Timeout

**Symptom:** `latency > 5000, success: false`

**Causes:**
- LLM is slow
- TypeDB is slow
- Network issue

**Fix:**
- Check LLM status (OpenRouter up?)
- Check TypeDB connection
- Retry (timeouts don't warn — neutral)

### High Resistance on Path

**Symptom:** `resistance > strength × 2` (path marked toxic)

**Causes:**
- Unit fails consistently
- LLM produces garbage
- Task is impossible

**Fix:**
```bash
# Commend the unit to boost confidence
curl -X POST /api/agents/bob/commend

# Or flag it to reduce traffic
curl -X POST /api/agents/bob/flag

# Or rewrite the system-prompt (evolution happens automatically)
```

---

## See Also

- [dictionary.md](dictionary.md) — Six Verbs: signal, mark, warn, fade, follow, harden
- [DSL.md](one/DSL.md) — Signal grammar and handlers
- [routing.md](routing.md) — How routing selects the next unit
- [api/CLAUDE.md](../src/pages/api/CLAUDE.md) — Full API reference
- [CLAUDE.md](../CLAUDE.md) — Platform overview + engine rules

---

*Lock down signal flow. Mark every path. Let pheromone remember.*

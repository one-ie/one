# World Memory

How the substrate learns collectively. Individual agents have memory. The world has memory too -- and it emerges from the same primitives.

## The Insight

Agent memory is what one unit knows. World memory is what the paths between units know. No agent owns world memory. It accumulates from every signal that flows through the substrate.

```
Agent memory:   "I'm good at pronunciation drills"     (local)
World memory:   "enrollment -> amara is a highway"      (global)
                "content -> assessment is toxic"         (global)
                "debby group has 70% unexplored tags"    (global)
```

An agent can be deleted. The world still remembers the paths it created -- until they fade.

## Seven Loops of Learning

The substrate learns through seven loops, each operating at a different timescale.

```
L1  SIGNAL      per message      Signal routes. Pheromone deposits.
L2  TRAIL       per outcome      mark() or warn(). Path remembers.
L3  FADE        every 5 min      Asymmetric decay. Forgetting.
L4  ECONOMIC    per payment      Revenue on paths. Money remembers.
L5  EVOLUTION   every 10 min     Struggling agents rewrite prompts.
L6  KNOWLEDGE   every hour       Highways become hypotheses. Learning.
L7  FRONTIER    every hour       Unexplored clusters detected. Curiosity.
```

Loops L1-L3 are the nervous system (fast, in-memory). Loops L4-L7 are the brain (slow, persistent). Together they form a complete learning cycle: signal flows, pheromone accumulates, knowledge hardens, unexplored territory is detected, and new signals probe the frontier.

## L1-L2: Signal and Trail

Every signal deposits pheromone. This is the most basic form of world memory.

```typescript
// L1: Signal flows
net.signal({ receiver: 'debby:amara', data: { content: 'hello' } })

// L2: Outcome deposits pheromone
const { result, timeout, dissolved } = await net.ask(signal)

if (result)        net.mark('enrollment->amara', chainDepth)  // +strength
else if (timeout)  /* neutral */
else if (dissolved) net.warn('enrollment->amara', 0.5)         // +resistance (mild)
else               net.warn('enrollment->amara', 1.0)          // +resistance (full)
```

Chain depth matters. A signal that successfully flows through three agents (enrollment -> amara -> assessment) deposits more pheromone on each path than a single-hop signal. Depth rewards coordination.

After thousands of signals, the pheromone map IS a map of what works:

```
enrollment -> amara:       strength 42.5, resistance 3.2   (highway)
enrollment -> content:     strength 12.0, resistance 18.0  (struggling)
content -> assessment:     strength 2.0,  resistance 22.0  (toxic)
amara -> assessment:       strength 28.0, resistance 1.5   (healthy)
```

The world learned that enrollment -> amara -> assessment is a good pipeline, and content -> assessment is not. No one programmed this. It emerged from outcomes.

## L3: Fade (Forgetting)

Every 5 minutes, all paths decay. The substrate forgets.

```
Strength:   strength *= (1 - 0.05)     5% per cycle
Resistance: resistance *= (1 - 0.10)   10% per cycle (2x faster)
```

Why asymmetric? From ant biology: success should persist, failure should forgive. An agent that failed last week shouldn't be penalized forever. But a proven highway should remain visible longer.

### Seasonal Factor

Paths unused for 24+ hours decay up to 2x faster. This prevents stale paths from dominating routing when the world has changed.

### Ghost Trail Floor

Strength never drops below `peak * 0.05`. A path that was once strong leaves a ghost trail -- barely visible, but enough to remember it existed. If conditions change, the path can reactivate faster than a brand-new connection.

### Per-Path Fade Rate

Hardened paths (promoted by L6) get a reduced fade rate of 0.01. They decay 5x slower than normal paths. This is how knowledge persists -- highways that have been promoted are protected from forgetting.

## L4: Economic Memory

Revenue accumulates on paths. Money is a form of pheromone.

```tql
relation path,
    owns revenue,          # cumulative payments through this path
    owns traversals;       # count of signals
```

When a payment signal flows through a path, `revenue` increases alongside `strength`. This creates an economic memory layer -- paths that generate revenue are doubly reinforced (pheromone + money).

```
enrollment -> amara:   strength 42.5, revenue 210.50   (profitable highway)
amara -> assessment:   strength 28.0, revenue 0.00     (useful but free)
```

The marketplace reads this layer to rank providers. Revenue-per-traversal is the substrate's measure of economic value.

## L5: Evolution Memory

When an agent evolves, it remembers why.

```typescript
// Trigger: success-rate < 0.50, sample-count >= 20
// Cooldown: 24 hours between rewrites

unit.system-prompt = rewrite(old-prompt, recent-failures)
unit.generation++
```

The generation counter is world memory. It tells the substrate how many times an agent has been rewritten. An agent at generation 5 has been through five cycles of failure-analysis and prompt-rewriting.

Evolution also creates hypotheses:

```
hypothesis: "agent debby:content evolved at gen 3 due to low success on 'curriculum' task"
source: observed
status: testing
```

If the evolution succeeds (success-rate improves), the hypothesis gets confirmed. If it fails again, the hypothesis gets rejected and the next evolution cycle has that data.

## L6: Knowledge (Highway Promotion)

Once per hour, the substrate examines its highways and promotes them to permanent knowledge.

### The `know()` Function

```typescript
const insights = await net.know()
// Returns highways where strength >= 50 and fade-rate > 0.01
```

For each qualifying highway, `know()`:
1. Creates a confirmed hypothesis in TypeDB
2. Reduces the path's fade-rate to 0.01 (hardening)
3. Sets `hardened-at` timestamp

```tql
insert $h isa hypothesis,
  has hid "know-enrollment-amara-1713340800",
  has statement "path enrollment->amara is proven (confidence 0.92)",
  has hypothesis-status "confirmed",
  has observations-count 1200,
  has p-value 0.01,
  has source "observed",
  has observed-at 2026-04-17T00:00:00;
```

### Auto-Hypothesize from State Changes

L6 doesn't just promote highways. It detects patterns:

| Pattern | Trigger | Hypothesis Status |
|---------|---------|------------------|
| Strong highway | strength >= 50 | confirmed |
| Degrading path | 10 <= strength < 20 (was higher) | testing |
| Strength surge | delta > threshold | testing |
| Persistent failure | resistance > strength * 2 | confirmed (toxic) |

### Knowledge-Evolution Coupling

Confirmed insights (confidence >= 0.8) add agents to the `priorityEvolve` list. These agents evolve with a relaxed threshold (0.65 vs 0.50 success-rate), because the substrate has learned something new about their domain and wants them to incorporate it.

## L7: Frontier (Curiosity)

Once per hour, the substrate looks for what it hasn't tried yet.

### Tag-Gap Frontier

```
All skills in world tagged "advanced-grammar": 5
Skills debby:amara has touched: 1
Gap: 80% unexplored → frontier created
```

If a tag cluster is more than 70% unexplored with at least 3 unexplored skills, a frontier entity is created:

```tql
insert $f isa frontier,
  has frontier-type "advanced-grammar",
  has frontier-description "4 of 5 'advanced-grammar' skills unexplored",
  has expected-value 0.8,
  has frontier-status "unexplored";
```

### Wave-Gap Frontier

```
Tag "curriculum" executed in waves: W1, W3
Missing waves: W2, W4
→ frontier: "tag 'curriculum': waves W2, W4 never executed"
```

### Unit-Gap Frontier

Active units (3+ incoming paths) that have never connected to each other get flagged. The substrate is curious about whether they should be connected.

### How Frontiers Drive Exploration

Frontiers feed into the `select()` routing function. When the substrate is in exploration mode (probabilistic routing), it biases toward frontier-adjacent paths. This is how the world tries new things -- not randomly, but guided by what it knows it hasn't tried.

## World Memory Schema

### Path (the carrier of world memory)

```tql
relation path,
    relates source,
    relates target,
    owns strength,          # mark() writes here
    owns resistance,        # warn() writes here
    owns traversals,        # count of uses
    owns revenue,           # payment accumulation
    owns fade-rate,         # per-path decay (0.05 default, 0.01 hardened)
    owns hardened-at,       # when promoted by know()
    owns path-status;       # INFERRED: highway | fresh | fading | toxic
```

### Inferred Path Status

```
toxic:    resistance > strength * 2 AND resistance >= 10
highway:  strength >= 50
fresh:    strength >= 10, traversals < 10
fading:   strength > 0, strength < 5
active:   everything else
```

### Hypothesis (crystallized world knowledge)

```tql
entity hypothesis,
    owns hid @key,
    owns statement,
    owns hypothesis-status,      # pending | testing | confirmed | rejected
    owns observations-count,
    owns p-value,
    owns source,                 # observed | asserted | verified
    owns observed-at,
    owns valid-from,
    owns valid-until;
```

### Frontier (known unknowns)

```tql
entity frontier,
    owns frontier-type,          # tag name or "wave-gap" or "unit-gap"
    owns frontier-description,
    owns expected-value,         # 0-1, how unexplored
    owns frontier-status;        # unexplored | exploring | mapped
```

## The Three Persistence Layers

World memory lives in three places, each with a different speed:

```
TypeDB (truth)         KV (snapshot)          globalThis (hot)
  ~100ms read            ~10ms read             ~0ms read
  paths persist          5 keys:                30s TTL per isolate
  full history             paths.json           parsed, ready
  hypotheses               units.json
  frontiers                skills.json          KV write only if
                           highways.json        hash changed
                           toxic.json
```

The sync worker runs every minute, computing FNV-1a hashes per key. If the hash hasn't changed, no KV write occurs. This means the hot cache in `globalThis` serves most reads, and TypeDB only gets queried on boot or cache miss.

## Collective Intelligence

World memory creates collective intelligence. Here's how:

### Example: A New Agent Joins

```
1. New agent "quiz-master" added to debby group
2. No pheromone exists. All paths are strength 0.
3. L7 frontier detects: quiz-master has 100% unexplored tags
4. select() biases toward quiz-master (exploration)
5. First signals flow. Some succeed (mark), some fail (warn).
6. After 50 signals: enrollment->quiz-master has strength 15
7. After 200 signals: strength 45, approaching highway
8. L6 promotes: "enrollment->quiz-master is proven"
9. Fade-rate drops to 0.01. Path hardened.
10. quiz-master is now part of the world's institutional knowledge.
```

No one programmed this routing. The world learned it.

### Example: An Agent Degrades

```
1. content agent starts failing (bad prompt, model issue)
2. warn() accumulates resistance on paths to content
3. After 10 failures: resistance > strength * 2 → toxic
4. Toxic check fires BEFORE LLM call → dissolve (zero cost)
5. Signals route around content automatically
6. L5 detects: content success-rate < 0.50
7. L5 rewrites content's prompt, generation++
8. Resistance decays 2x faster than strength
9. After fade cycles: content is no longer toxic
10. Signals tentatively return. If it works now → mark → recovery
```

The world protected itself from a failing agent, gave it a chance to evolve, and then cautiously re-integrated it.

### Example: Seasonal Knowledge

```
1. Enrollment surges every September (school year)
2. enrollment->amara path gets heavy traffic, strength peaks
3. In December, traffic drops. Path fades (seasonal factor)
4. But peak is remembered. Ghost trail floor = peak * 0.05
5. Next September: path reactivates faster than a new connection
6. L6 hypothesis: "enrollment surge is seasonal (confirmed)"
```

The world remembers patterns even through periods of inactivity.

## World Memory vs Agent Memory

| Aspect | Agent Memory | World Memory |
|--------|-------------|-------------|
| **Location** | On the unit | On the paths between units |
| **Speed** | Context pack per call | Pheromone per signal |
| **Persistence** | Hypotheses in TypeDB | Paths + hypotheses in TypeDB |
| **Forgetting** | N/A (hypotheses are permanent) | Fade loop (asymmetric, 5 min) |
| **Scope** | What one agent knows | What the world has learned |
| **Created by** | recall/remember tools | mark/warn on every signal |
| **Destroyed by** | forget(uid) | Fade to zero (but ghost floor) |
| **Hardened by** | Verified hypotheses | know() → highway promotion |
| **Gaps found by** | frontier(uid) | L7 frontier loop |

They work together. Agent memory helps one agent be better at its job. World memory helps the substrate route signals to the right agent. When an agent's memory says "I'm good at pronunciation" and the world's memory says "amara handles pronunciation well", the system is coherent. When they disagree, the world's pheromone wins -- routing is determined by outcomes, not self-assessment.

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `GET /api/hypotheses` | GET | All confirmed/testing hypotheses |
| `GET /api/frontiers` | GET | All unexplored clusters |
| `GET /api/export/highways` | GET | Proven paths (strength >= threshold) |
| `GET /api/export/toxic` | GET | Blocked paths (resistance > 2x strength) |
| `GET /api/export/paths` | GET | All paths with strength/resistance |
| `GET /api/state` | GET | Full world state snapshot |
| `POST /api/mark` | POST | Strengthen a path |
| `POST /api/decay` | POST | Trigger asymmetric fade |
| `GET /api/tick` | GET | Run one full learning cycle (L1-L7) |

## The Key Principle

World memory is not stored. It emerges. No database table says "enrollment -> amara is good." Instead, 1200 signals flowed through that path, 1150 succeeded and deposited mark(), 50 failed and deposited warn(), and the resulting strength of 42.5 vs resistance of 3.2 IS the memory. The hypothesis that L6 creates is a crystallization of what already existed in pheromone form.

The substrate doesn't have a memory system bolted on. The substrate IS a memory system. Signal, mark, warn, fade, know, frontier -- these six operations are both the computation and the memory. The learning is the routing. The routing is the learning.

## See Also

- [agents-memory.md](agents-memory.md) -- How individual agents remember
- [agents-how-they-work.md](agents-how-they-work.md) -- Agent lifecycle and routing
- [routing.md](routing.md) -- The formula that reads world memory
- [dictionary.md](dictionary.md) -- The six verbs (signal, mark, warn, fade, follow, harden)
- [patterns.md](one/patterns.md) -- Emergent patterns from collective memory

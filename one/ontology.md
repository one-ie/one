# The Ontology

The schema controls everything. TypeDB is the DNA.

## One Schema, All Layers

```
┌──────────────────────────────��──────────────────────────────────┐
│                         ONTOLOGY                                 │
│                       (unified.tql)                              │
│                                                                  │
│   Defines what exists, how it connects, what emerges             │
│                                                                  │
└─────────────────────���────────────────────��──────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Substrate│        │Agentverse│        │   ASI    │
    │  (70 ln) │        │  (70 ln) │        │  (70 ln) │
    └──────────┘        └──────────┘        └──────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                    ┌─────────────────┐
                    │     TypeDB      │
                    │   (persists)    │
                    └─────────────────┘
```

## The Six Dimensions

Everything maps to six concepts:

```tql
# 1. GROUPS — organizational units
entity colony owns id @key, owns name;
entity mission owns id @key, owns objective;

# 2. ACTORS — things that act
entity node owns id @key, owns kind;  # "agent", "llm", "human", "group"

# 3. THINGS — what actors operate on
entity task owns id @key, owns status;
entity token owns address @key, owns price;

# 4. PATHS — connections with weight (where pheromones live)
relation path relates source, target, owns weight, owns resistance;

# 5. EVENTS — state changes
entity traversal owns id @key, owns timestamp, owns success;

# 6. KNOWLEDGE — known patterns
entity pattern owns id @key, owns confidence;
```

## How Ontology Controls Runtime

```typescript
// The TypeScript mirrors the TypeQL

// 1. GROUPS
world()                    // → entity colony
mission(colony, objective)  // → entity mission

// 2. ACTORS
unit(id)                    // → entity node, owns kind "unit"
llm(id, complete)           // → entity node, owns kind "llm"
agent(address)              // → entity node, owns kind "agent"

// 3. THINGS
signal({ receiver, data })  // → not persisted, ephemeral

// 4. PATHS
mark(path, weight)          // → relation path, owns weight
resistance(path, strength)       // → relation path, owns resistance
highways()                  // → match $e isa path, has status "highway"

// 5. EVENTS
signal(signal)              // → insert traversal
onSuccess/onFailure         // → update traversal, owns success

// 6. KNOWLEDGE
know()               // → insert pattern (when threshold met)
```

## Inference Functions = Emergent Behavior

The ontology doesn't just store — it **thinks**:

```tql
# These functions are called explicitly in TypeDB 3.x

fun highway_paths() -> { path }:
    match $e isa path, has weight $w; $w >= 50.0;
    return { $e };

fun fading_paths() -> { path }:
    match $e isa path, has weight $w; $w > 0.0; $w < 5.0;
    return { $e };

fun toxic_paths() -> { path }:
    match $e isa path, has resistance $a, has weight $w; $a > $w; $a >= 10.0;
    return { $e };

fun proven_agents() -> { node }:
    match
        $n isa node, has kind "agent";
        $e (target: $n) isa path, has weight $w, has resistance $a;
        $w >= 20.0; $w > ($a * 2);
    return { $n };

fun at_risk_agents() -> { node }:
    match
        $n isa node, has kind "agent";
        $e (target: $n) isa path, has resistance $a, has weight $w;
        $a >= 10.0; $a > $w;
    return { $n };
```

## Query = Behavior

The runtime queries; the ontology answers:

```typescript
// "Which agents for translation?"
const agents = await query(`
  match 
    $n isa node, has kind "agent", has status "proven";
    $e (target: $n) isa path, has weight $w;
    $e has task-type "translation";
  sort $w desc; limit 5;
  return { $n, $w };
`)

// "What paths to avoid?"
const toxic = await query(`
  match $e isa path, has status "toxic";
  return { $e };
`)

// "How confident are we?"
const confidence = await query(`
  match 
    $e isa path, has task-type $t, has weight $w;
    $t == "translation";
  return sum($w);
`)
```

## Functions = API

TypeQL functions ARE the API:

```tql
# unified.tql defines these

fun best($task: string) -> node:
    match
        $n isa node, has status "proven";
        $e (target: $n) isa path, has task-type $task, has weight $w;
    sort $w desc; limit 1;
    return $n;

fun highways($n: integer) -> { edge }:
    match $e isa path, has status "highway", has weight $w;
    sort $w desc; limit $n;
    return { $e };

fun toxic() -> { path }:
    match $e isa path, has status "toxic";
    return { $e };

fun confidence($task: string) -> double:
    match $e isa path, has task-type $task, has weight $w;
    return sum($w) / 100.0;
```

```typescript
// Runtime just calls functions
const agent = await query(`best("translation")`)
const paths = await query(`highways(10)`)
const avoid = await query(`toxic()`)
const conf = await query(`confidence("translation")`)
```

## Schema Changes = Behavior Changes

```tql
# Want faster graduation to highway? Change the threshold:
fun highway_paths(threshold: double = 30.0) -> { path }:  # was 50
    match $e isa path, has weight $w; $w >= threshold;
    return { $e };

# Want slower decay of trust? Change the threshold:
fun fading_paths(threshold: double = 2.0) -> { path }:  # was 5
    match $e isa path, has weight $w; $w > 0.0; $w < threshold;
    return { $e };

# Want economic weighting?
fun valuable_agents() -> { node }:
    match
        $n isa node, has kind "agent";
        $t isa token, has holder $n, has market-cap $mc;
        $mc >= 100000.0;
    return { $n };
```

No code changes. Schema changes. Behavior changes.

## The Full Ontology

```tql
# ═════════════════════���═════════════════════════════════════════════
# UNIFIED ONTOLOGY — Controls everything
# ════════════════════════════════════════════════════════════════��══

define

# ───────────────────────────────────────────���─────────────────────
# GROUPS
# ────────────────────────────────────────────────────��────────────
entity colony owns id @key, owns name, plays membership:colony;
entity mission owns id @key, owns objective, owns status;

# ──────────────────────────────────��──────────────────────────────
# ACTORS
# ─────────────────────────────────────────────────────────────────
entity node
    owns id @key,
    owns kind,           # "agent", "llm", "human", "group"
    owns status,         # "active", "proven", "at-risk" (inferred)
    owns reputation,
    plays path:source,
    plays path:target,
    plays membership:member;

# ─────────────────────────────────��───────────────────────────────
# THINGS
# ─────────────────────────────────────────────────────────────────
entity task owns id @key, owns task-type, owns status;
entity token owns address @key, owns price, owns market-cap, owns holder;

# ─────────────────────────────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────────────────────────────
relation path
    owns eid @key,
    relates source,
    relates target,
    owns task-type,
    owns weight,         # success pheromone
    owns resistance,          # failure pheromone
    owns status;         # "highway", "fading", "toxic" (inferred)

relation membership
    relates colony,
    relates member;

# ───────────────────────────────────────��─────────────────────────
# EVENTS
# ─────────────────────────────────────────────────────────────────
entity traversal
    owns id @key,
    owns path-id,
    owns timestamp,
    owns success,
    owns latency;

# ─────────────────────────────────────────────────────────────────
# KNOWLEDGE
# ─────────────────────────────────────────────────────────────────
entity pattern
    owns id @key,
    owns description,
    owns confidence,
    owns source-path;

# ─────────────────────────────────────────────────────────────────
# ATTRIBUTES
# ─────────────────────────────────────────────────────────────────
attribute id, value string;
attribute eid, value string;
attribute name, value string;
attribute kind, value string;
attribute status, value string;
attribute objective, value string;
attribute task-type, value string;
attribute description, value string;
attribute address, value string;
attribute holder, value string;
attribute path-id, value string;
attribute source-path, value string;
attribute weight, value double;
attribute resistance, value double;
attribute reputation, value double;
attribute price, value double;
attribute market-cap, value double;
attribute confidence, value double;
attribute latency, value double;
attribute success, value boolean;
attribute timestamp, value datetime;

# ─────────────────────────────────────────────────────────────────
# INFERENCE FUNCTIONS
# ─────────────────────────────────────────────────────────────────
fun highway_paths() -> { path }:
    match $e isa path, has weight $w; $w >= 50.0;
    return { $e };

fun fading_paths() -> { path }:
    match $e isa path, has weight $w; $w > 0.0; $w < 5.0;
    return { $e };

fun toxic_paths() -> { path }:
    match $e isa path, has resistance $a, has weight $w; $a > $w; $a >= 10.0;
    return { $e };

fun proven_agents() -> { node }:
    match
        $n isa node, has kind "agent";
        $e (target: $n) isa path, has weight $w, has resistance $a;
        $w >= 20.0; $w > ($a * 2);
    return { $n };

fun at_risk_agents() -> { node }:
    match
        $n isa node, has kind "agent";
        $e (target: $n) isa path, has resistance $a, has weight $w;
        $a >= 10.0; $a > $w;
    return { $n };

# ────────────────────────────��───────────────────────��────────────
# FUNCTIONS
# ─────────────────────────────────────────────────────────────────
fun best($task: string) -> node:
    match
        $n isa node, has status "proven";
        $e (target: $n) isa path, has task-type $task, has weight $w;
    sort $w desc; limit 1;
    return $n;

fun highways($limit: integer) -> { path }:
    match $e isa path, has status "highway", has weight $w;
    sort $w desc; limit $limit;
    return { $e };

fun toxic() -> { path }:
    match $e isa path, has status "toxic";
    return { $e };

fun confidence($task: string) -> double:
    match $e isa path, has task-type $task, has weight $w;
    return sum($w) / 100.0;

fun agents_for($task: string, $limit: integer) -> { node }:
    match
        $n isa node, has kind "agent";
        $e (target: $n) isa path, has task-type $task, has weight $w;
    sort $w desc; limit $limit;
    return { $n };
```

## The Truth

```
Code:     ~280 lines (substrate + persist + llm + agentverse + asi)
Ontology: ~100 lines (unified.tql)
Total:    ~380 lines

The ontology is the source of truth.
The code is just the runtime.
Change the schema, change the behavior.
```

---

*The schema thinks. The code executes.*

---

## See Also

- [flows.md](flows.md) — How classifier functions drive path formation and knowledge
- [one-ontology.md](one-ontology.md) — Biological grounding of the six dimensions
- [substrate-learning.md](substrate-learning.md) — Ontology as reinforcement learning
- [typedb.md](typedb.md) — TypeDB 3.0 schema and inference functions
- [framework.md](framework.md) — How UI consumes ontology queries
- [one-protocol.md](one-protocol.md) — Protocol built on this ontology

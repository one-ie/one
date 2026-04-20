# Memory

How ONE remembers. Across groups, actors, things, and time.

Memory is not a subsystem. Memory is the 6 dimensions, viewed sideways.

---

## The Claim

> You do not need RAG when your world is already typed.

Retrieval-Augmented Generation exists because most data is unstructured prose
and the only way to find "relevant" chunks is nearest-neighbor search in an
embedding space. It is a brilliant workaround for a lossy starting point.

ONE starts from the other end. Every interaction is already shaped into the
6 dimensions — **groups, actors, things, paths, events, learning**. The
substrate *is* structured memory. You query it directly. No embedding, no
approximate nearest neighbor, no re-ranker, no "chunk size" debate.

Embeddings remain useful at one place only: the *edge*, where raw prose
enters the system and hasn't been shaped yet. Inside the substrate, typed
traversal wins.

---

## The 6 Dimensions Are Already Memory

Five memory types, one ontology:

| Cognitive type | What it stores | ONE primitive | Where it lives |
|----------------|----------------|---------------|----------------|
| **Episodic** | what happened, when | `signal` | Events (TypeDB + D1) |
| **Semantic** | what is true | `hypothesis` | Learning |
| **Procedural** | how to do it | `skill` + `.on()` handler | Things + runtime |
| **Social** | who knows whom | `membership`, `capability` | Groups, Actors |
| **Associative** | what leads to what | `path` (strength/resistance) | Paths |

Every act of remembering maps to one of these. Every act of forgetting maps
to `fade()`.

```
┌──────────────────────────────────────────────────────────────────┐
│                         MEMORY IN ONE                            │
│                                                                  │
│   GROUPS ────── who you remember with ────── social context      │
│   ACTORS ────── who did the remembering ──── agent identity      │
│   THINGS ────── what was remembered ──────── skills, artifacts   │
│   PATHS  ────── what connects to what ────── weighted, decaying  │
│   EVENTS ────── when it happened ─────────── the tape            │
│   LEARNING ──── what it meant ────────────── hypotheses, laws    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

No separate "memory store." The substrate IS the store.

---

## Memory Has an Owner: Identity Is Cryptographic

Memory without stable identity is noise. Every actor in ONE has a Sui
keypair derived deterministically from `SUI_SEED + uid` (see
`src/lib/sui.ts`, `addressFor(uid)`, `deriveKeypair(uid)`). The keypair
*is* the identity.

This gives memory three properties no bolt-on store has:

| Property | Consequence |
|----------|-------------|
| **Stable across channels** | Telegram, web, Discord, email → same actor, same memory |
| **Signable** | A claim is a signature, not a database row |
| **Portable** | Actor can move worlds — keypair carries the memory |

Cross-channel unification is a signed message, not a federation service.
Merging memory across worlds is a signed message, not a migration. Losing
memory requires losing the seed — which is structurally the same as
losing the identity itself. Memory and identity are one concept.

```typescript
// claim: I am the same person as <uid>, on this new channel, at this time
const sig = sign(deriveKeypair(uid), { uid, channel, ts })
// verify → add channel attribute to actor → memory inherited
```

No ID-mapping table. No OAuth. The wallet we built for payments is the
memory key.

---

## Memory Trust: Observed vs Asserted

A user saying *"I am an expert in X"* is a signal, not a fact. A vector
store treats both the same ("high similarity score on 'expert'"). ONE
distinguishes at the ontology level.

Every hypothesis carries a `source` attribute:

```typeql
hypothesis sub entity,
  owns subject, owns predicate, owns object,
  owns confidence,
  owns source;                # observed | asserted | verified
```

```
observed  — earned from repeated mark() on behavior          (can reach 0.95)
asserted  — the actor claimed it (signal.content)            (capped at 0.30)
verified  — third-party signed attestation or corroboration  (up to 0.99)
```

Three consequences:

1. **Self-assertion cannot route.** `select()` ignores paths whose only
   support is asserted hypotheses. You cannot flatter yourself into
   authority — pheromone earned from outcomes is the only promotion
   mechanism.

2. **The LLM sees provenance.** The context pack surfaces source alongside
   confidence: *"observed: deep engagement with typescript (0.91)"* next
   to *"asserted: claims to be senior eng (0.30)"*. Hallucination drops
   because the model knows which memories earned their weight.

3. **Prompt injection hits a ceiling.** Malicious input can fill the
   asserted column; it cannot reach the observed column without producing
   outcomes over many turns — which is the definition of earning trust.

**Trust is not a permission system. Trust is a strength-over-time integral.**

---

## Bi-Temporal Memory: When vs When-Believed

Two timestamps on every hypothesis:

```typeql
hypothesis
  owns observed-at,    # when the substrate learned it
  owns valid-from,     # when the fact became true
  owns valid-until;    # when it stopped being true (optional)
```

This is Zep's strongest idea — we adopt it in two attributes. Queries:

```typeql
# "what did we believe about donal on 2026-03-01?"
match $h isa hypothesis,
  has subject "donal",
  has valid-from <= 2026-03-01T00:00Z,
  has valid-until > 2026-03-01T00:00Z;
```

Signals already carry `ts` (episodic time). Hypotheses carry both
belief-time and truth-time. The substrate can answer *when did we learn
X?* and *when was X true?* — different questions, both queryable.

---

## Honest Tradeoff: Semantic Memory Is Eventually Consistent

`know()` runs on L6 — approximately hourly. That means:

```
  t+0min     user engages with typescript content → mark(path, +1)
  t+5min     path strengthens, but still just a path
  t+45min    path has crossed highway threshold in the runtime
  t+60min    L6 tick runs → know() promotes to hypothesis → written to TypeDB
```

**Episodic memory is synchronous.** Signals are in TypeDB the moment they
fire. `open()` and `highways()` read from the live strength map at any
millisecond.

**Semantic memory is eventually consistent.** Hypotheses lag the highways
that produced them by up to one L6 tick. Mem0 and LangMem consolidate at
write-time; ONE consolidates at promotion-time.

This is a real gap. We accept it for three reasons:

1. **Pattern before naming.** A fact promoted too early becomes a false
   fact that must be retracted. L6 waits for stability — a highway must
   stay strong across several L3 fades before `know()` writes it down.
   Mem0's write-time extraction creates confident garbage; ONE's delayed
   extraction creates less memory but more trustworthy memory.

2. **The episodic tape is immediate.** If you need something fresher than
   an hour, query signals — they are synchronous. Only the *generalized*
   layer is delayed.

3. **Cost.** Per-turn extraction runs an LLM for every message. L6 runs
   an LLM once per hour over the delta. At 100 messages/day/user, that's
   a 100× compute saving — which we accept as the price of a one-hour
   semantic-memory lag.

**Tunable.** L6 cadence is a config value. High-stakes worlds can run it
every five minutes; archival worlds can run it daily. The tradeoff is
freshness vs noise vs cost — pick per world.

---

## Why TypeDB (and not a vector DB, not a graph DB, not postgres)

Three things no other store gives you in one place:

### 1. Typed inference — memory that thinks

```typeql
fun capability-price($u: unit, $skill-name: string) -> double:
  match
    $u isa unit;
    $s isa skill, has name $skill-name;
    (provider: $u, offered: $s) isa capability, has price $p;
  return first $p;
```

The schema *reasons*. Ask "which actors can do X?" and TypeDB traverses
types, inheritance, and relations to compute the answer. A vector DB
returns "things that sound like X."

### 2. Relations are first-class

Paths, capabilities, memberships, hypotheses — all n-ary relations with
their own attributes (strength, resistance, price, confidence). A graph
DB stores edges; TypeDB stores *typed*, *attributed*, *n-ary* relations
that participate in schema rules.

### 3. Polymorphic roles

A `unit` can be a provider in one relation, a receiver in another, a group
member in a third. Memory about an actor is the union of every role they
play. You don't join tables — the actor *is* the join.

```
actor: donal
  ├── member of: group(marketing)
  ├── provider of: skill(seo-audit)
  ├── sender of: signal(42) → actor(tony)
  ├── subject of: hypothesis("strong on citation")
  └── endpoint of: path(donal → seo-audit), strength 8.3
```

One query returns all of it. No embeddings needed — the structure *is* the index.

---

## The Memory Stack

```
   ┌────────────────────────────────────────────────────────┐
   │ UNSTRUCTURED EDGE                                      │
   │ inbound prose → LLM extract → typed primitives         │ ← embeddings here
   │ (emails, transcripts, scraped pages, chat)             │   (only place)
   └─────────────────────────┬──────────────────────────────┘
                             ▼
   ┌────────────────────────────────────────────────────────┐
   │ RUNTIME (nervous system)                 loops L1-L3   │
   │ signals, strength/resistance, queue, ask, drain        │
   │ hot, in-process, ~0ms                                  │
   └─────────────────────────┬──────────────────────────────┘
                             ▼
   ┌────────────────────────────────────────────────────────┐
   │ TYPEDB (brain)                           loops L4-L7   │
   │ actors, groups, things, paths, events, learning        │
   │ typed, inferential, ~100ms RT                          │
   └─────────────────────────┬──────────────────────────────┘
                             ▼
   ┌────────────────────────────────────────────────────────┐
   │ KV / EDGE CACHE                                        │
   │ paths.json, units.json, skills.json, highways.json     │
   │ 5-key snapshot, hash-gated writes, ~10ms               │
   └────────────────────────────────────────────────────────┘
```

Three tiers of temperature. TypeDB is the truth. KV is the snapshot.
globalThis is the heat.

### The tiers map onto cognitive memory

Letta paged memory with an OS metaphor (core/recall/archival). ONE already
has the page table — it's the edge cache:

| Cognitive tier | ONE layer | Latency | What lives there |
|----------------|-----------|---------|------------------|
| **Core / working** | `globalThis._edgeKvCache` | ~0ms | last N turns, hot highways |
| **Recall** | KV snapshot (`paths.json`, `units.json`, ...) | ~10ms | top paths, units, skills |
| **Archival** | TypeDB Cloud | ~100ms | full history, hypotheses, inference |

The `ContextPack` assembly draws proportionally from each tier, just as
human attention does — recent dominates, stable facts surface only when
their tags match.

### Perception is itself substrate

Classification and valence detection are **units, not helpers**. That
means the substrate's perception of its own inputs evolves the same way
its agents do:

- L5 rewrites a struggling `classify` unit's prompt when success-rate <0.50
- L4 prices the unit — competing classifiers earn via `mark()`
- Swapping models (Gemma 4 → fine-tune → keyword heuristic) is a metadata
  change, not a code change

*The substrate improves its own ingestion.* No human ships a classifier
update — pheromone ranks alternatives, and the winner takes the routing.

---

## Memory Operations

Every memory verb is already a substrate verb:

| Verb | What it does | Primitive |
|------|-------------|-----------|
| **remember** | record an episode | `signal()` |
| **recognize** | find a path | `sense(edge)` / `danger(edge)` |
| **recall** | query the brain | `persist().recall(match)` |
| **reinforce** | make memory stronger | `mark(edge)` |
| **suppress** | make memory weaker | `warn(edge)` |
| **forget** | decay unused memory | `fade()` — asymmetric, resistance 2× faster |
| **erase** | structural delete (GDPR) | TQL `delete $u isa actor` — ontology cascades |
| **generalize** | episode → hypothesis | `know()` — promote highway to law |
| **introspect** | what do I know? | `open()`, `highways()`, `recall()` |
| **reveal** | what do you know about *me*? | `persist.reveal(uid)` — full memory card |
| **imagine** | what *haven't* we learned? | `frontier(uid)` — tag clusters the actor has never touched |

Memory is not CRUD on a store. Memory is **routing that learns from
outcomes**. A path you used successfully is a memory that strengthens.
A path that led nowhere is a memory that fades.

---

## Do We Need RAG?

Short answer: **only at the edge**. Not inside.

| Task | RAG | ONE native |
|------|-----|------------|
| "Find prior email about X" | ✓ (prose) | embed at ingest, store as `signal` with tags |
| "Which agents can do SEO audits?" | ✗ terrible | `match $s isa skill, has tag "seo"; ...` |
| "Who does donal usually collaborate with?" | ✗ no structure | top paths from `actor:donal` by strength |
| "What did we learn about elitemovers.ie?" | ~ fuzzy | `recall({ subject: "elitemovers.ie" })` |
| "Is this path toxic?" | ✗ no signal | `resistance > 2 × strength` — deterministic |
| "Summarize last week with tony" | ✓ | events by `(sender: tony)` → LLM summarize |
| "Draft a response like donal would" | ✓ | few-shot from `signal`s where sender=donal |

The pattern: **use RAG when you need paraphrase or synthesis over prose.
Use TypeDB when you need truth, traversal, or routing.** They coexist.
RAG becomes a capability (a `skill`), not the substrate.

---

## The Embedding Edge

When prose enters the system, one handler owns the shaping:

```typescript
unit('memory:ingest')
  .on('document', async (doc, emit) => {
    const extracted = await llm.extract(doc, schema)  // → typed entities
    await persist.signal({ receiver: 'typedb:insert', data: extracted })
    const embedding = await llm.embed(doc.text)
    await kv.put(`doc:${doc.id}`, { embedding, doc })  // fallback only
  })
```

Two destinations:
- **Typed facts** → TypeDB (primary, queryable, inferential)
- **Raw text + embedding** → KV or vector store (fallback, for paraphrase recall)

The typed facts are authoritative. The vector blob exists for the one case
structured query can't handle: "find text that *sounds like* this but
wasn't extractable into the schema."

Over time, the schema grows. The embedding fallback shrinks.

---

## Memory Per Dimension

### Groups
What the group has collectively seen. Shared context.
```typeql
match (group: $g, member: $u) isa membership; $g has group-id "marketing";
      $s isa signal, has sender $u;
return $s;
```

### Actors
Everything an actor ever did, provides, belongs to, or was described as.
One query. No joins.

### Things (skills, tasks, tokens)
Who offers it. What it costs. How often it fires successfully.
`capability` price × path strength = economic memory.

### Paths
The only dimension with *weighted* memory. Strength compounds success.
Resistance compounds failure. Fade makes old memory cheap.

### Events (Signals)
The immutable tape. Never mutated — only appended. Queryable by sender,
receiver, time, tags. This is episodic memory at substrate resolution.

**Privacy scope is a signal attribute.** Every signal carries a visibility
boundary that every downstream recall automatically honors:

```typeql
signal owns scope;              # private | group | public
```

```
private  — visible only to sender + receiver, excluded from group queries
group    — visible to group members (default for chat in a group)
public   — world-readable, indexable by frontier/know loops
```

Consequences:

- A DM from donal to the bot never surfaces in a group-chat pack,
  because recall filters on `scope`.
- `know()` promotes only from paths whose supporting signals are
  `group` or `public` — private signals never leak into semantic memory.
- `forget()` on an actor deletes all their private signals regardless
  of scope; group signals where they were one participant among many
  are retained (but the sender attribute becomes anonymous).

Privacy is not a bolt-on permission layer — it is one schema attribute
the substrate reads at every recall.

### Learning (Hypotheses)
Compressed experience. When a highway stabilizes, `know()` writes a
hypothesis: *"actor X reliably does thing Y in group Z"*. The next
cycle doesn't rediscover — it recalls.

---

## The Forgetting Curve

Memory that doesn't fade is memory that lies.

```
strength(t) = strength(0) × (1 − r)^t        # r = 0.05 per tick
resistance(t) = resistance(0) × (1 − 2r)^t   # resistance forgets 2× faster
```

Asymmetric decay is deliberate: **the substrate forgives faster than it
praises**. A warn() from three cycles ago weighs less than a mark() from
three cycles ago. Old mistakes stop dominating. Old successes still vote.

This is the part no vector DB can replicate — its memory has no valence
and no time.

### Drift handling is already fade

User changed jobs. Old belief "works in marketing" must give way to new
belief "works in finance." No separate drift detector needed — when L6
produces a hypothesis that contradicts a stable one, it `warn()`s the
path that produced the old:

```typescript
for (const h of newHypotheses) {
  const conflict = findContradicting(h, existing)
  if (conflict) persist.warn(conflict.sourcePath, 1.0)   // accelerate decay
}
```

Three ticks later the old hypothesis falls under the confidence threshold
and drops out of the pack. **The forgetting curve is the drift detector.**

### Structural erasure

Because the ontology is typed, GDPR is a one-liner:

```typeql
match $u isa actor, has uid "person:a7f3";
delete $u isa actor;      # cascades to membership, capability, path, signal(sender)
```

```typescript
await persist.forget('person:a7f3')   // structural delete + cascade + fade cleanup
```

Paths pointing at the deleted actor fade in the next L3 tick. Hypotheses
with the actor as subject vanish via schema cascade. No dangling references.
No vector-DB residue. The hardest regulatory requirement in most chat and
memory systems is a one-liner here — that is the structural payoff of
typed memory over hybrid stores.

---

## What TypeDB Gives You That Nothing Else Does

```
┌──────────────────┬──────────┬──────────┬──────────┬─────────┐
│ Capability       │ TypeDB   │ Postgres │ Neo4j    │ Vector  │
├──────────────────┼──────────┼──────────┼──────────┼─────────┤
│ Typed schema     │   ✓✓     │    ✓     │    ~     │    ✗    │
│ N-ary relations  │   ✓✓     │    ~     │    ✓     │    ✗    │
│ Inference rules  │   ✓✓     │    ✗     │    ~     │    ✗    │
│ Polymorphic role │   ✓✓     │    ✗     │    ~     │    ✗    │
│ Weighted edges   │   ✓      │    ~     │    ✓     │    ~    │
│ Schema-as-code   │   ✓✓     │    ✓     │    ~     │    ✗    │
│ Similarity search│   ✗      │    ~     │    ~     │   ✓✓    │
└──────────────────┴──────────┴──────────┴──────────┴─────────┘

✓✓ native   ✓ supported   ~ possible with effort   ✗ not a fit
```

Pick TypeDB for *structure + reasoning*. Add a vector store *at the edge*
for the prose that slipped through. That's the whole memory system.

---

## Example: One Memory, Five Ways

A user says *"donal is great at SEO audits for local businesses."*

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. EPISODIC   signal {sender: tony, receiver: memory:ingest,   │
│                      content: "donal is great at SEO..."}       │
│                                                                 │
│ 2. SEMANTIC   hypothesis { subject: donal, predicate: "strong", │
│                           object: "local-seo", confidence: 0.8} │
│                                                                 │
│ 3. ASSOCIATIVE mark(path: donal → seo-audit, +1.0)              │
│                                                                 │
│ 4. SOCIAL     capability(provider: donal, offered: seo-audit)   │
│                                                                 │
│ 5. PROCEDURAL skill(seo-audit) has tag "local", tag "citation"  │
└─────────────────────────────────────────────────────────────────┘
```

One statement, five shadows. Each shadow answers a different future question:
- *"what did tony say about donal?"* → episodic
- *"is donal good at SEO?"* → semantic
- *"route this SEO task to whom?"* → associative (via `select()`)
- *"who offers SEO in our world?"* → social
- *"what kind of SEO?"* → procedural

No embedding. No nearest neighbor. Just structure, weighted by outcome.

---

## Memory of Absence: What the Substrate Has Never Learned

Classical memory systems remember what happened. ONE also knows what
*hasn't* happened — via frontier detection (L7).

Frontier detection finds unexplored tag clusters in the world. Applied to
an actor, it answers the question that RAG can never answer: **what
haven't we learned about you?**

```typescript
// tags the world knows about, minus tags this actor has touched
await persist.frontier('person:donal')
// → ['finance', 'hiring', 'design-systems', 'react-19']
```

Consequences:

- A chatbot can proactively ask *"you've never talked about finance —
  want to?"* — warm-introducing relevant capabilities, not cold-selling.
- Coverage-of-knowledge becomes a metric: for a given actor, what
  fraction of the world's tag space have they engaged with?
- "Negative space" memory — *donal has never mentioned X* — is queryable,
  not absent.

This closes the loop: L6 promotes what was learned; L7 surfaces what
remains to learn. Memory and imagination are the same mechanism, run in
opposite directions.

---

## The Minimal Memory API

```typescript
// Remember (episode)
net.signal({ receiver: 'log', data: { tags, content } })

// Associate (weight)
persist.flow(from, to)         // mark on success, warn on failure
persist.fade(0.05)             // the forgetting curve

// Recall (structured)
await persist.recall({ subject: 'donal' })              // hypotheses
await persist.recall({ subject: 'donal', at: '2026-03-01' })  // bi-temporal
await persist.open(20, { from: 'donal' })               // top paths
await persist.highways(10)                              // compounded memory

// Generalize
await persist.know()                                    // highways → hypotheses

// Introspect
net.sense(edge)                                         // how strong is this?
net.danger(edge)                                        // how toxic is this?

// Reveal (GDPR portability — Article 20)
await persist.reveal('person:a7f3')                     // full memory card

// Imagine (what we haven't learned)
await persist.frontier('person:a7f3')                   // unexplored tag clusters

// Erase (GDPR erasure — Article 17)
await persist.forget('person:a7f3')                     // delete + cascade
```

That is the memory surface. Twelve functions. No "vector store" keyword.

### reveal() returns a memory card

```typescript
type MemoryCard = {
  actor:       { uid: string, kind: string, channels: string[], firstSeen: number }
  hypotheses:  Hypothesis[]       // all, with source + confidence
  highways:    Path[]             // top paths by strength
  signals:     Signal[]           // last 200 (paginated)
  groups:      string[]           // memberships
  capabilities: Capability[]      // things they offer / have uploaded
  frontier:    string[]           // tags they've never touched
}
```

One call, full data-portability export. GDPR Article 20 in 20 lines of
TQL. The actor owns their memory; the substrate just indexes it.

---

## Access Control & Federation (C4 Governance)

Memory is subject to the **Permission = Role × Pheromone** model. No
separate ACL table — the graph IS the security model.

### Three New Role Actions (locked 2026-04-18)

| Action | Minimum Role | What it permits |
|--------|--------------|-----------------|
| `read_memory` | `board` | Call `reveal(uid)` to export full memory card |
| `delete_memory` | `operator` | Call `forget(uid)` to erase + cascade + audit |
| `discover` | any user | Call `frontier(uid)` to find unexplored tags |

```typescript
// roleCheck enforces the gate
if (!roleCheck(userId, 'read_memory')) return 403

// forget() emits audit signal for compliance
net.signal({
  receiver: 'audit:memory:deleted',
  data: { uid, timestamp, scope: 'private', tags: ['audit', 'memory', 'gdpr'] }
})
```

### Private Signals Never Federate

Signal scope is one of: `private | group | public`.

```
private  — sender + receiver only
group    — visible to group members
public   — cross-org, hardenable on Sui
```

When `recall({federated: true})` runs in a federated world, private
hypotheses are filtered out. The query still works; it just returns
fewer results. Other worlds cannot see your secrets.

### Lifecycle Policy

`recall()` supports three options:

| Option | What it returns |
|--------|-----------------|
| `limit` | cap at N results (default 100, prevents unbounded queries) |
| `retention` | filter by source: `'observed'` ∣ `'asserted'` ∣ `'all'` (default) |
| `federated` | scope filter: exclude private hypotheses from cross-world queries |

```typescript
// All options work together
const learned = await persist.recall({
  subject: 'donal',
  retention: 'observed',
  limit: 50,
  federated: false
})
// Returns: top 50 observed hypotheses about donal, private included
```

---

## When You Still Want Embeddings

Be honest — there are three cases:

1. **Unstructured prose recall.** User asks "what did we discuss about X?"
   and you never extracted it. Vector search over `signal.content` text.
2. **Cold-start similarity.** New skill arrives with no paths yet — find
   the nearest known skill by description.
3. **Few-shot prompting.** Pull 3 stylistically similar prior responses
   to seed an LLM call.

In each case, the embedding store is a **skill** the substrate can call —
not the substrate itself. This keeps the memory model clean.

```typescript
unit('memory:fuzzy')
  .on('search', async ({ query }) =>
    await vectorStore.search(query, { k: 5 }))
```

Register it. Tag it. Let paths decide when to route there. The substrate
remains typed; embeddings remain an edge capability.

---

## How This Compares to Mem0, Letta, Zep, LangMem

Every current agent-memory system solves the same problem: *LLM calls are
stateless, so bolt a memory layer on top*. They differ in shape, not in
premise. ONE rejects the premise.

### The shared pattern they all share

```
  ┌────────────────────────────────────────────────────────┐
  │  CONVERSATION (prose)                                  │
  └──────────────────┬─────────────────────────────────────┘
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │  EXTRACTION PASS    LLM reads prose → "facts"          │ ← extra LLM call
  └──────────────────┬─────────────────────────────────────┘
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │  HYBRID STORE       vector + graph + KV (2–3 backends) │ ← sync problem
  └──────────────────┬─────────────────────────────────────┘
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │  CONSOLIDATION     scheduled dedupe/merge              │ ← background job
  └──────────────────┬─────────────────────────────────────┘
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │  RETRIEVAL         similarity + graph walk + re-rank   │
  └────────────────────────────────────────────────────────┘
```

Four stages. Each stage has failure modes. Each stage has a config knob.

### How each system shapes it

| System | Core idea | What they add | What they assume |
|--------|-----------|---------------|------------------|
| **Mem0** | Extract → store in vector + graph + KV → retrieve by similarity | Memory "importance" scoring via LLM; auto-consolidation | Agents are stateless chat endpoints |
| **Letta (MemGPT)** | OS-style memory paging — core / recall / archival tiers | Agent writes to its own memory via tools | Context window is the scarce resource |
| **Zep / Graphiti** | Bi-temporal knowledge graph (valid-time + transaction-time) | Strongest temporal model in the space | Memory = facts + when they were true |
| **LangMem** | Namespaced KV store + semantic search, typed as semantic/episodic/procedural | Cleanest SDK in LangGraph | Split by cognitive type at write-time |
| **Cognee** | Ontology-driven pipelines: extract → graph → embed | Explicit ontology layer | You'll author the ontology per project |

They are all good. They all solve real problems. They are all scaffolding
around a missing substrate.

### Where ONE is structurally different

| Concern | Others | ONE |
|---------|--------|-----|
| Where memory lives | Bolt-on service called by agent | The substrate itself |
| Extraction | LLM reads prose, emits facts | Agents emit typed signals at authorship |
| Stores to keep in sync | 2–3 (vector + graph + KV) | 1 (TypeDB) + edge KV snapshot |
| Importance scoring | LLM-rated per memory, sometimes heuristic | `mark()` / `warn()` from actual routing outcomes |
| Consolidation | Scheduled background job | `know()` loop (L6) — highways → hypotheses |
| Forgetting | Often absent or symmetric | Asymmetric fade (resistance 2× faster) |
| Temporal model | Zep has bi-temporal; most don't | Every signal is an event, every path a decaying weight |
| Inference | Graph traversal | TypeDB typed inference + polymorphic roles |
| Retrieval API | ~20+ methods across memory types | 12 verbs: `signal`, `mark`, `warn`, `fade`, `know`, `recall`, `open`, `highways`, `reveal`, `forget`, `frontier`, `sense` |
| Unit of learning | A fact | A *path that earned its weight* |

### The elegance claim, in numbers

```
                             Others          ONE
─────────────────────────────────────────────────
Stores to keep in sync       2 – 3           1 + snapshot
Extraction LLM passes        1 per message   0 (emitted typed)
Memory API surface           ~20+            12 verbs
Consolidation service        scheduled job   L6 loop, same runtime
Forgetting model             heuristic       asymmetric fade, math
Importance scoring           LLM-rated       outcome-measured
Lines of core engine         thousands       670
```

Elegance here is not aesthetic — it is **countable reduction of moving
parts while preserving capability**. Fewer stores, fewer passes, fewer
verbs, fewer background jobs, and still all five memory types covered.

### The one-sentence differences

```
Mem0    : "memory as a database you write to"
Letta   : "memory as pages you swap into context"
Zep     : "memory as a bi-temporal knowledge graph"
LangMem : "memory as typed namespaces with search"
ONE     : "memory as routing outcomes on a typed world"
```

The first four treat memory as *storage for a stateless agent*. ONE treats
memory as *the accumulating weight of what the world did*. The agent is
not stateless — the agent is a unit in a substrate that already remembers.

### Where the others win (honesty)

- **Drop-in retrofit** — Mem0 and LangMem plug into existing LangChain
  stacks in ten lines. ONE requires you to adopt the substrate.
- **Prose-heavy workloads** — if your product is a pure chatbot over
  unstructured user notes, Mem0's extraction pipeline is purpose-built.
  ONE still needs the edge ingest handler.
- **Temporal rigor** — Zep's bi-temporal graph is more sophisticated than
  ONE's "events + fade" for queries like "what did we believe about X on
  date Y?" We may borrow this pattern explicitly.
- **Maturity** — these systems have SDKs, docs, benchmarks, production
  users. ONE is younger. Elegance doesn't substitute for miles.

### Why we still win through elegance

Every bolt-on memory system is a **compensation** for the fact that the
agent loop is stateless prose-in, prose-out. That framing forces:

1. an extraction pass (to recover structure that was discarded),
2. a hybrid store (because no single backend is right for all memory types),
3. a consolidation job (because extraction produces duplicates), and
4. an importance heuristic (because without outcomes, all memories look equal).

Change the framing — make the substrate typed, signal-native, and
outcome-measured — and **all four stages collapse**. That is the elegance.
Not fewer features. Fewer categories of thing.

```
They build memory FOR the agent.
ONE is a world WHERE the agent remembers by participating.
```

---

## Summary

```
Memory is not a database. Memory is routing with outcomes.
TypeDB stores what you remember. Paths store what it meant.
Fade stores what you've let go. Hypotheses store what you've learned.
Embeddings exist — at the edge, where prose enters. Nowhere else.

The 6 dimensions are not a data model. They are a memory model
that happens to be queryable.
```

---

## See Also

- [one-ontology.md](one-ontology.md) — The 6 dimensions in full
- [naming.md](naming.md) — Canonical names, never rename
- [dictionary.md](dictionary.md) — Signal, mark, warn, fade, know, recall
- [routing.md](routing.md) — How paths become memory
- [DSL.md](one/DSL.md) — The programming model
- [AUTONOMOUS_ORG.md](AUTONOMOUS_ORG.md) — Memory as executable org chart
- `src/schema/one.tql` — The schema, 100 lines, the truth
- `src/engine/persist.ts` — `know()`, `recall()`, `open()`, `load()`, `sync()`

---

*Structure remembers. Paths weigh. Time forgives. The world learns.*

# Task Management

**The heartbeat of ONE. Strategy docs become weighted tasks. Their weight routes them. Claude Code subscribes and executes.**

---

## The Biology

> *"The task an ant performs depends not on any property of the individual, but on what it has experienced recently."*
> -- Deborah Gordon, *Ants at Work*

No task is assigned. Every task is discovered through signals and deposits.

---

## The Full Flow

```
docs/*.md ──→ Haiku ──→ TaskSpec[] ──→ weight() ──→ TypeDB ──→ select() ──→ /do
                │                         │                        │
          reads prose              priority formula          pheromone adjusts
          finds implicit tasks     value × phase ×           strength - resistance
          exit conditions          persona × blocking        × tag sensitivity
```

---



When a task is created, three things happen simultaneously:

```
task "build-ceo-panel"  ←→  skill "build-ceo-panel"  ←→  capability(builder, offered)
     priority: 100                price: 0.001                who can do it
     phase: C1                    tags: [build, P0]
     persona: ceo
     effort: medium
```

1. **Task entity** — priority formula, phase, persona, effort, blocking
2. **Skill entity** — same ID, with price and tags
3. **Capability relation** — links skill to the unit that can do it

A task is simultaneously a skill in the marketplace. Other agents can discover it via routing. Creating a task is subscribing an agent to work.

---

## CLI Tools (Dev-Server-Independent)

Three scripts under `scripts/` drive the full task loop without touching the
Astro dev server or Cloudflare gateway. They connect directly to TypeDB Cloud
over `/v1/signin` + `/v1/query`, so they work when `/api/tasks/sync` is
unreachable (compile error in working tree, gateway timeout on bulk reads,
no server running at all).

| Script | Verb | What it does |
|--------|------|--------------|
| `scripts/sync-todos.ts` | send | `scanTodos(docs/)` → `syncTasks()` → write tasks + skills + capabilities + blocks. Idempotent. |
| `scripts/ready-tasks.ts [N]` | follow | Top N tasks with no open blockers, ranked by priority-score + unlock count. Also prints source distribution and biggest unlockers. |
| `scripts/close-task.ts <id>` | mark | `done=true` + `status="done"` + `strength += 5` on `loop→builder` + cascade-check dependents. Mirrors `selfCheckoff()` in `src/engine/task-sync.ts`. |

```bash
bun run scripts/sync-todos.ts                    # load TODO-*.md → TypeDB
bun run scripts/ready-tasks.ts 20                # top 20 actionable tasks
bun run scripts/close-task.ts --search "phrase"  # find a task by name
bun run scripts/close-task.ts <task-id>          # mark done + deposit pheromone
```

**Why the gateway is bypassed.** The Cloudflare Worker gateway has an 8s
`AbortSignal.timeout()` in `src/lib/typedb.ts`. For 1000+ row reads (the full
task graph), that's too tight. The direct TypeDB Cloud connection uses a 30s
cap, same auth, same queries. Writes through either path are identical.

**Orphan skill safety.** `syncTasks()` now pre-fetches existing `skill-id`s
and renders task-only inserts when a skill already exists (unique-key
constraint on `skill-id` would otherwise throw `CNT9` and fail the whole
batch). Adds one read to the sync; makes re-runs always idempotent even
when prior runs left partial state.

---

## Task Lifecycle (Every Step Verified)

### Step 1: Query Available Tasks

```bash
# API path (requires dev server or production)
curl -s "https://dev.one.ie/api/tasks?value=critical"

# CLI equivalent (no server needed)
bun run scripts/ready-tasks.ts 20
```

```json
{
  "count": 14,
  "tasks": [
    {
      "name": "Build CEO control panel: hire/fire/commend/flag agents",
      "priorityScore": 100,
      "effectivePriority": 100,
      "category": "exploratory",
      "persona": "ceo",
      "phase": "C1",
      "status": "open",
      "tags": ["P0", "ceo", "governance", "ui"],
      "unit": "builder",
      "strength": 0,
      "resistance": 0
    }
  ]
}
```

`effectivePriority` = base priority adjusted by pheromone. When strength and resistance are 0, effective = base.

### Step 2: Filter by Category or Tag

```bash
# By category (exploratory = untested, attractive = proven, repelled = failing)
curl -s "https://dev.one.ie/api/tasks/exploratory"
# → 74 tasks, all untested

# By tag
curl -s "https://dev.one.ie/api/tasks?tag=P0"
# → 17 tasks tagged P0
```

### Step 3: Create a New Task

```bash
curl -s -X POST "https://dev.one.ie/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "nanoclaw-streaming-response",
    "name": "Add streaming responses to NanoClaw /message endpoint",
    "tags": ["build", "nanoclaw", "edge", "P1"],
    "value": "high",
    "phase": "C2",
    "persona": "dev",
    "exit": "POST /message returns SSE stream instead of blocking JSON",
    "price": 0.003,
    "unit": "infrastructure:nanoclaw"
  }'
```

```json
{
  "ok": true,
  "task": "nanoclaw-streaming-response",
  "priorityScore": 80,
  "formula": "high=25 + C2=35 + dev=20",
  "tags": ["build", "nanoclaw", "edge", "P1"],
  "unit": "infrastructure:nanoclaw"
}
```

This simultaneously:
- Creates a **task** entity with priority 80 and formula `high=25 + C2=35 + dev=20`
- Creates a **skill** with `skill-id: "nanoclaw-streaming-response"` and `price: 0.003`
- Creates a **capability** linking `infrastructure:nanoclaw` to that skill

### Step 4: Verify Capability Was Created

```bash
curl -s -X POST "https://api.one.ie/typedb/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "match (provider: $u, offered: $s) isa capability, has price $p;
             $u has name \"nanoclaw\"; $s has skill-id $sid, has name $sname;
             select $sid, $sname, $p;"
  }'
```

```json
[
  {
    "skill": "nanoclaw-streaming-response",
    "name": "Add streaming responses to NanoClaw /message endpoint",
    "price": 0.003
  }
]
```

The agent is now subscribed. Other agents can discover it via routing.

### Step 5: Work Happens —Weight  Builds

When the task is attempted successfully, the path from the requester to the provider gets marked:

```bash
curl -s -X POST "https://dev.one.ie/api/mark" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "builder",
    "to": "infrastructure:nanoclaw",
    "strength": 15
  }'
```

```json
{ "ok": true }
```

Now check how pheromone changed the effective priority:

```bash
curl -s "https://dev.one.ie/api/tasks?tag=nanoclaw"
```

```json
{
  "name": "Add streaming responses to NanoClaw /message endpoint",
  "base_priority": 80,
  "effective_priority": 90.5,
  "category": "ready",
  "strength": 15,
  "resistance": 0
}
```

**Priority jumped from 80 → 90.5.** The task moved from `exploratory` (untested) to `ready` (has pheromone). Successful work literally increases a task's visibility in the marketplace.

### Step 6: Failure — Resistance Builds

When work fails, resistance accumulates on the path:

```bash
curl -s -X POST "https://dev.one.ie/api/resistance" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "builder",
    "to": "infrastructure:nanoclaw",
    "resistance": 25
  }'
```

```json
{
  "name": "Add streaming responses to NanoClaw /message endpoint",
  "effective_priority": 89.8,
  "category": "ready",
  "strength": 15,
  "resistance": 1
}
```

With enough resistance (resistance >= 30 AND resistance > strength), the task becomes **repelled** — agents actively avoid it.

### Step 7: Routing — Who Should Get This Task?

```bash
curl -s -X POST "https://api.one.ie/typedb/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "match $sk isa skill, has skill-id \"nanoclaw-streaming-response\";
             (provider: $u, offered: $sk) isa capability, has price $p;
             $u has uid $uid, has name $name;
             select $uid, $name, $p;"
  }'
```

```json
[
  {
    "uid": "infrastructure:nanoclaw",
    "name": "nanoclaw",
    "price": 0.003
  }
]
```

Multiple agents can offer the same skill. `suggest_route()` and `optimal_route()` use path strength to pick the best one.

### Step 8: Complete the Task

```bash
# Via TypeQL directly
curl -s -X POST "https://api.one.ie/typedb/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "match $t isa task, has task-id \"nanoclaw-streaming-response\",
             has done $d, has task-status $st;
             delete $d of $t; delete $st of $t;
             insert $t has done true, has task-status \"done\";",
    "transactionType": "write"
  }'
```

```json
{
  "name": "Add streaming responses to NanoClaw /message endpoint",
  "done": true,
  "status": "done"
}
```

In the tick loop, this happens automatically when a builder unit returns a result.

---

## Extracting Tasks from Prose

### What `doc-scan.ts` catches today

```
- [ ] Deploy marketing agents          ← checkbox
- Gap 3: No auth middleware             ← gap pattern
```

### What it misses

Strategy docs contain implicit tasks buried in paragraphs, tables, and code blocks.
A human reading "Deploy 8 agents on Telegram" knows that's a task. Haiku knows it too.

```
"Deploy: director, creative, media-buyer, analyst, content-writer,
 seo, social, ads-mgr. Enable Telegram channel."
                                        ← implicit task in description

"Exit: 8 agents responding to signals on Telegram"
                                        ← exit condition = task definition

"Wire signals → Telegram API. Subscribe marketing agents to
 @onedotbot channel."
                                        ← action buried in prose
```

### Haiku extraction

Haiku reads each doc and returns structured tasks:

```typescript
interface ExtractedTask {
  id: string               // "marketing-dept-live"
  name: string             // "Deploy Marketing Department (8 agents, Telegram)"
  description: string      // What needs to be done
  phase: string            // "cycle:C1"
  value: 'critical' | 'high' | 'medium'
  persona: string          // "ceo" | "dev" | "investor" | ...
  tags: string[]           // ["marketing", "P0", "telegram"]
  blocks: string[]         // task IDs this blocks
  blocked_by: string[]     // task IDs blocking this
  exit_condition: string   // "8 agents responding to signals on Telegram"
}
```

Cost: ~$0.004 per doc. Run hourly = $0.10/day for all strategy docs.
Source docs: `ONE-strategy.md`, `autonomous-orgs.md`, any `docs/*.md` with actionable content.

---

## Initial Weighting

Every task needs a starting weight before pheromone has data. The formula
makes the first `/do` cycle as smart as the hundredth — it just gets
smarter from there.

### The Priority Formula

```
priority = value + phase + persona + blocking

         ┌─────────────────────────────────────────────────┐
         │                                                  │
         │   VALUE        what it's worth to the org        │
         │   ─────        ─────────────────────────         │
         │   critical  30   can't ship without this         │
         │   high      25   important, not fatal            │
         │   medium    20   nice to have                    │
         │                                                  │
         │   PHASE        when it matters                   │
         │   ─────        ─────────────────                 │
         │   C1  40       foundation (must exist)           │
         │   C2  35       collaboration (must flow)         │
         │   C3  30       commerce (must earn)              │
         │   C4  25       expansion (must grow)             │
         │   C5  20       analytics (must measure)          │
         │   C6  15       products (must differentiate)     │
         │   C7  10       scale (must compound)             │
         │                                                  │
         │   PERSONA      who does it best                  │
         │   ───────      ───────────────────               │
         │   ceo       25   governance (3.0x)               │
         │   dev       20   infrastructure (2.5x)           │
         │   investor  15   monetization (2.0x)             │
         │   gamer     15   exploration (2.0x)              │
         │   kid       10   learning (1.5x)                 │
         │   freelancer 10  contribution (1.5x)             │
         │   agent      5   execution (1.0x)                │
         │                                                  │
         │   BLOCKING     what it unlocks                   │
         │   ────────     ─────────────────                 │
         │   +5 per task this blocks (max +20)              │
         │   a task that unblocks 4 others = +20            │
         │                                                  │
         └─────────────────────────────────────────────────┘
```

### Examples: How It Feels

```
marketing-dept-live         critical + C1 + ceo + blocks(3)
                            30 + 40 + 25 + 15 = 110         ← THE thing to do

engineering-framework       critical + C1 + dev
                            30 + 40 + 20 = 90                ← foundation work

telegram-integration        high + C1 + dev
                            25 + 40 + 20 = 85                ← enables marketing

pheromone-dashboard         medium + C1 + ceo
                            20 + 40 + 25 = 85                ← visibility

x402-payments               critical + C3 + dev
                            30 + 30 + 20 = 80                ← commerce, not yet

agentverse-integration      high + C4 + dev
                            25 + 25 + 20 = 70                ← expansion, later

token-minting               medium + C7 + investor
                            20 + 10 + 15 = 45                ← scale, much later
```

The formula makes intuitive sense: a critical C1 task that unblocks three others
(priority 110) will always run before a medium C7 nice-to-have (priority 45).
No configuration. No sprint planning. Just arithmetic.

### The Priority Formula (transparent)

Every task stores how its priority was computed:

```
priority-formula: "critical=30 + C1=40 + ceo=25 + blocks(3)=15"
```

Transparent. Auditable. If a task's priority feels wrong, read the formula.
The numbers explain themselves.

### Ways to Set Initial Weight

Five ways to put weight on a task, from most automatic to most manual:

```
METHOD              HOW                                WHEN TO USE
──────              ───                                ───────────

1. Haiku extract    Haiku reads prose, infers          Strategy docs change
                    value/phase/persona/deps           New cycle begins
                    → formula computes priority         First-time extraction

2. Doc-scan         Checkboxes + gap patterns           Ongoing TODO tracking
                    → P0-P3 from section context        Docs as source of truth
                    → tags from keyword matching

3. API create       POST /api/tasks with explicit       Human judgment
                    value, phase, persona, tags          One-off tasks
                    → formula computes priority          Bug reports

4. Continuation     .then() spawns next task            Task chains
                    inherits parent phase + tags         Pipeline stages
                    priority = parent - 5               Natural sequencing

5. Pheromone seed   mark('entry→task-id', N)            Bootstrap proven paths
                    pre-load strength on edges           Migration from old system
                    → effective priority rises           Known good sequences
```

### Beautiful Defaults

When information is missing, the formula degrades gracefully:

```
No value?     → medium (20)          conservative, won't jump the queue
No phase?     → C4 (25)              middle of the road
No persona?   → agent (5)            execution-level, lowest governance weight
No blocking?  → 0                    doesn't unblock anything we know of
No tags?      → ["untagged"]         visible but won't match any subscriber

Minimum priority: 20 + 10 + 5 + 0 = 35   (always visible, never dominant)
Maximum priority: 30 + 40 + 25 + 20 = 115  (critical C1 CEO blocker)
```

---

## Pheromone Adjustment (runtime)

Static priority is the starting weight. Pheromone modifies it at runtime:

```
effective_priority = priority + (strength - resistance) × sensitivity
```

### Cold start (no pheromone)

```
marketing-dept-live:     priority=110, strength=0, resistance=0  → effective=110
engineering-framework:   priority=90,  strength=0, resistance=0  → effective=90
```

Pure formula. The first `/do` cycle picks marketing-dept-live. Correct.

### After first executions

```
marketing-dept-live:     priority=110, strength=3, resistance=0  → effective=112.1
telegram-integration:    priority=85,  strength=0, resistance=0  → effective=85
  (was blocked by marketing-dept-live — now unblocked! appears in queue)
```

### After repeated work

```
x402-payments:           priority=80, strength=2, resistance=8   → effective=75.8
  → sinking. Something is wrong. Needs decomposition or different approach.

pheromone-dashboard:     priority=85, strength=15, resistance=1  → effective=94.8
  → rising. Proven path. Approaching highway.
```

### Highway formation

When a task chain reaches strength >= 20, it becomes a highway.
Highways auto-execute — no selection needed.

```
marketing-dept-live → telegram-integration → dashboard
  strength: 25          strength: 22            strength: 18
  HIGHWAY               HIGHWAY                 almost there
```

---

## Tag Subscription

Claude Code agents subscribe to tags. Sensitivity controls explore/exploit:

```
weight = 1 + max(0, strength - resistance) × sensitivity
```

### Agent profiles

```
"The Builder"       tags=[engineering, infra, P0, P1]    sensitivity=0.8
                    → infrastructure work, follows proven paths

"The Explorer"      tags=[ui, dashboard, analytics]      sensitivity=0.3
                    → UI work, more exploration (less pheromone lock-on)

"The Closer"        tags=[commerce, x402, sui, P0]       sensitivity=0.9
                    → revenue paths, strongly follows proven routes

"The Generalist"    tags=[]                              sensitivity=0.5
                    → whatever is highest priority, balanced explore/exploit
```

### Usage

```
/do                         → all tasks, default sensitivity
/do tags=build,P0           → only build+P0 tasks, high sensitivity
/do tags=ui sensitivity=0.3 → UI tasks, more exploration
```

---

## Task Taxonomy

Four dimensions. Every tag is a flat string. No hierarchy. Convention emerges from use.

### 1. Domain — what area of the system

```
DOMAIN TAG       WHAT IT COVERS                          EXAMPLE TASKS
──────────       ──────────────                          ─────────────
marketing        agents, campaigns, content, brand       Deploy 8 marketing agents
engineering      routing, engine, API, runtime            Build cross-dept signal routing
commerce         payments, x402, SUI, pricing, revenue   Wire x402 payment settlement
ui               dashboard, graph, reactflow, panels     Pheromone visibility dashboard
infra            workers, deploy, CF, cron, gateway      Deploy sync worker to Cloudflare
agent            LLM, prompts, nanoclaw, telegram        Wire Telegram bot to substrate
security         auth, identity, toxic, compliance       Implement toxic path blocking
typedb           schema, queries, functions, migration   Add task entity to schema
analytics        metrics, confidence, bottleneck         Per-path confidence scores
integration      agentverse, hermes, MCP, HTTP           Bridge AgentVerse discovery
```

### 2. Action — what kind of work

```
ACTION TAG       WHAT IT MEANS                           PHEROMONE EFFECT
──────────       ─────────────                           ────────────────
build            create something new                    high mark on success
wire             connect two existing things             high mark (enables flow)
fix              repair something broken                 mark + clear resistance
test             verify something works                  mark on pass, warn on fail
deploy           ship to production                      high mark (visible outcome)
design           plan or architect                       mild mark (not yet proven)
refactor         improve without changing behavior       neutral (maintenance)
migrate          move data or schema                     mark on completion
document         write docs or update existing           mild mark
explore          investigate unknowns                    mark if insight found
```

### 3. Priority — how urgent

```
PRIORITY    WHEN TO USE                 SELECTION WEIGHT    DECAY RATE
────────    ───────────                 ────────────────    ──────────
P0          can't ship without this     8x                  slowest (0.01)
P1          important, not fatal        4x                  normal (0.05)
P2          nice to have, real value    2x                  normal (0.05)
P3          someday, low urgency        1x                  fastest (0.10)
```

P0 tasks are 8x more likely to be selected than P3 tasks, even before pheromone.
This is the `priorityWeighted` selector in `selectors.ts`.

### 4. Phase — when in the roadmap

```
PHASE        NAME              EXIT CONDITION                    WHAT UNLOCKS
─────        ────              ──────────────                    ────────────
cycle:C1     Foundation        8 agents live, 100 signals/day    First learning
cycle:C2     Collaboration     cross-dept flowing, 2-3 highways  Inter-org routing
cycle:C3     Commerce          x402 working, 1+ paying agent     Revenue on Sui
cycle:C4     Expansion         10+ external users, AgentVerse    Network effects
cycle:C5     Analytics         highways hardened, metrics     Data moat
cycle:C6     Products          sensitivity modes live             Differentiation
cycle:C7     Scale             10,000+ agents, self-forming       Compounding
```

### 5. Persona — who does it best

```
PERSONA      METAPHOR SKIN     VOCABULARY            WHAT THEY SEE
───────      ─────────────     ──────────            ─────────────
ceo          Team              hire, fire, commend    org chart, performance
dev          Brain/Signal      node, potentiate       API, routing, code
investor     Water/Economic    pool, carve            revenue paths, tokens
gamer        Ant               deposit, forage        emergence, trails
kid          Ant               smell, follow          simple rules, discovery
freelancer   Mail              stamp, deliver         skills, pricing, jobs
agent        Signal            emit, receive          handlers, chains
```

### Compound tags

Tags combine naturally. No special syntax — just multiple tags on one task:

```
tags: ["engineering", "build", "P0", "cycle:C1", "dev"]
  → Critical C1 engineering build task for a developer

tags: ["commerce", "wire", "P1", "cycle:C3", "investor"]
  → High-priority C3 commerce wiring, investor-relevant

tags: ["ui", "explore", "P2", "cycle:C5", "gamer"]
  → Medium exploration of UI analytics, gamified
```

### Tag inference from prose

Haiku infers tags from context. The keyword map:

```typescript
const TAG_KEYWORDS = {
  marketing:    ['campaign', 'content', 'brand', 'seo', 'social', 'ads'],
  engineering:  ['routing', 'engine', 'api', 'runtime', 'handler', 'signal'],
  commerce:     ['payment', 'x402', 'sui', 'revenue', 'price', 'escrow'],
  ui:           ['dashboard', 'graph', 'panel', 'visual', 'reactflow'],
  infra:        ['deploy', 'worker', 'cloudflare', 'cron', 'gateway', 'kv'],
  agent:        ['llm', 'prompt', 'nanoclaw', 'telegram', 'bot'],
  security:     ['auth', 'identity', 'toxic', 'compliance', 'credential'],
  typedb:       ['schema', 'tql', 'query', 'function', 'migration'],
  analytics:    ['metric', 'confidence', 'bottleneck', 'measure'],
  integration:  ['agentverse', 'hermes', 'mcp', 'http', 'bridge'],
  build:        ['create', 'implement', 'add', 'new'],
  wire:         ['connect', 'integrate', 'bridge', 'pipe', 'flow'],
  fix:          ['fix', 'repair', 'patch', 'resolve', 'broken'],
  deploy:       ['ship', 'publish', 'release', 'production'],
}
```

---

## Fast Extraction Loop

Haiku can't run on every tick — it's an LLM call. But extraction can feel live.

### Three-tier extraction

```
TIER     WHAT               SPEED         WHEN               COST
────     ────               ─────         ────               ────
1        doc-scan regex     <1ms/doc      every tick          $0
         checkboxes, gaps   deterministic  L1 signal loop
         section headings

2        diff detection     <10ms/doc     on file change      $0
         git diff docs/     only changed   inotify/poll
         extract new lines  sections

3        Haiku extraction   ~2s/doc       hourly or manual    ~$0.004/doc
         full prose scan    LLM call       L6 knowledge cycle
         implicit tasks
```

### How the loop runs through a document quickly

```
TICK 1: doc-scan catches 12 checkboxes in ONE-strategy.md           <1ms
TICK 2: doc-scan catches 8 gaps in autonomous-orgs.md               <1ms
  ...
HOUR 1: Haiku reads ONE-strategy.md, finds 23 implicit tasks        ~2s
HOUR 1: Haiku reads autonomous-orgs.md, finds 31 implicit tasks     ~2s
  ...
HOUR 2: Only re-extract docs that changed (git diff)                ~2s for 1 doc
         Unchanged docs skip Haiku entirely.
```

### Diff-aware extraction

```typescript
async function extractChanged(docPath: string, lastHash: string): Promise<ExtractedTask[]> {
  const currentHash = await fileHash(docPath)
  if (currentHash === lastHash) return []  // Skip unchanged docs

  const content = await readFile(docPath, 'utf-8')
  const sections = splitBySections(content)

  // Only send changed sections to Haiku
  const changed = sections.filter(s => s.hash !== lastSectionHashes[s.heading])
  if (!changed.length) return []

  const context = `Document: ${docPath}\nExisting tasks: ${existingIds.join(', ')}\n\n`
  const changedContent = changed.map(s => s.content).join('\n\n---\n\n')

  return extractTasks(context + changedContent, basename(docPath))
}
```

### Integration with tick.ts

```
L1  SIGNAL     every tick      doc-scan regex (checkboxes, gaps)      ← free
L6  KNOWLEDGE  every hour      Haiku extraction (prose, implicit)     ← $0.004/doc
                               diff-aware: skip unchanged docs
                               section-aware: skip unchanged sections
```

The fast path (doc-scan) runs every tick at zero cost.
The deep path (Haiku) runs hourly, only on changed content.
Both write to the same TypeDB task entities. Both feed the same selectors.

---

## Architecture

```
NERVOUS SYSTEM (runtime)              BRAIN (TypeDB)
────────────────────────              ──────────────
unit.on('build', fn)                  unit persists (model, prompt, gen)
unit.then('build', next)              path persists (strength, resistance)
world.signal({ receiver })           signal recorded (event log)
world.strength / world.resistance           skill registered (capability)
world.queue                          classification inferred
                    ↕
              Growth Loop
        select → signal → drain → fade → evolve → know
                    ↕
              TaskBoard (what you see)
```

---

## What Is a Task?

A task is a `.on()` handler on a unit:

```typescript
const bob = net.add('bob')
  .on('build', async (data, emit) => {
    const result = await buildAPI(data)
    emit({ receiver: 'tester:verify', data: result })
    return result
  })
```

When a signal arrives at `bob:build`, the handler runs. That's a task executing.

## What Is a Dependency?

A dependency is a `.then()` continuation:

```typescript
bob
  .on('schema', async (data) => buildSchema(data))
  .then('schema', result => ({ receiver: 'bob:api', data: result }))
  .on('api', async (data) => buildAPI(data))
  .then('api', result => ({ receiver: 'bob:test', data: result }))
```

`api` can't run until `schema` completes. The continuation chains them. No dependency relation needed.

## What Is a Trail?

Pheromone on the strength map. Every signal delivery auto-marks the edge:

```
signal({ receiver: 'bob:api' }, from = 'bob:schema')
  → mark('bob:schema→bob:api')
  → strength['bob:schema→bob:api'] += 1
```

Success accumulates strength. Failure deposits resistance. Decay forgets over time. No trail entity needed.

## What Are Tags?

Flat labels on skills and units. No hierarchy, no schema change needed to add new ones.

```typeql
insert $s isa skill, has skill-id "api", has name "Build API",
  has tag "build", has tag "wire", has tag "P0";
```

Tags answer **"what is this?"** — pheromone answers **"how well does it work?"**

```
Tags:       build, wire, P0, frontend, infra, payments
Pheromone:  strength 45, resistance 3, traversals 12
```

Together: "Show me all P0 commerce tasks, sorted by trail strength."

```
GET /api/tasks?tag=P0&tag=commerce
```

Units can be tagged too — castes, teams, roles:

```typeql
insert $u isa unit, has uid "scout-1",
  has tag "scout", has tag "team-alpha";
```

### Conventions (not enforced)

| Prefix | Examples | Meaning |
|--------|----------|---------|
| Phase | `wire`, `onboard`, `commerce`, `scale` | Where in the roadmap |
| Priority | `P0`, `P1`, `P2`, `P3` | How urgent |
| Type | `build`, `test`, `review`, `deploy` | What kind of work |
| Domain | `frontend`, `infra`, `payments`, `integration` | Technical area |
| Team | `team-alpha`, `tony`, `david` | Who owns it |

No enforcement. No validation. Just strings. Convention emerges from use.

---

## What Is the Queue?

Signals that can't be delivered yet (receiver doesn't exist). They wait:

```typescript
net.enqueue({ receiver: 'future-agent:task', data: {} })
// Later...
net.add('future-agent')  // queued signals auto-deliver
```

The queue replaces "todo" status. A queued signal IS a pending task.

---

## The Four Categories

Every task falls into one category based on pheromone state:

```
ATTRACTIVE       strength >= 50 on inbound edges
                 World says: "follow this, it works"

READY            has inbound edges, but below threshold
                 World says: "available, no strong signal"

EXPLORATORY      no inbound edges at all
                 World says: "unknown — needs a scout"

REPELLED         resistance >= 30 AND resistance > strength
                 World says: "avoid — this failed before"
```

Categories are computed at query time from the strength/resistance maps via classifier functions. No materialized classifiers needed.

### API Routes

| Route | Method | What |
|-------|--------|------|
| `/api/tasks` | GET | All tasks with tags, category, pheromone. Filter: `?tag=build&tag=P0` |
| `/api/tasks` | POST | Create task (skill + tags + capability) |
| `/api/tasks/ready` | GET | Category = ready. Supports `?tag=` filter |
| `/api/tasks/attractive` | GET | Category = attractive. Supports `?tag=` filter |
| `/api/tasks/repelled` | GET | Category = repelled. Supports `?tag=` filter |
| `/api/tasks/exploratory` | GET | Category = exploratory. Supports `?tag=` filter |
| `/api/tasks/:id/complete` | POST | Mark outcome (reinforces or alarms path) |

---

## Effort Maps to Model Cost

Every task carries an effort level that determines which model executes it:

```
task-effort "low"    → Haiku    ($0.0003/signal)
task-effort "medium" → Sonnet   ($0.003/signal)
task-effort "high"   → Opus     ($0.015/signal)
```

The system routes cheap tasks to cheap models. Hard tasks to expensive ones. Effort is set at task creation and inferred by Haiku during extraction.

---

## The Growth Loop

`src/engine/loop.ts` — the colony's heartbeat. One tick per interval.

```
select → [highway skip | ask] → L1b fallback → drain → fade → evolve → harden+frontier
```

| Phase | What | Interval |
|-------|------|----------|
| L1 SELECT | Probabilistic pick from pheromone-weighted edges | Every tick |
| L1 SIGNAL | Highway skip (net strength >= 20) or `ask()` | Every tick |
| L1b FALLBACK | If pheromone finds nothing: query TypeDB for top priority open task | Every tick |
| L1 DRAIN | Process one queued signal | Every tick |
| L3 FADE | Asymmetric decay (strength 5%, resistance 10%) | 5 min |
| L5 EVOLVE | Rewrite prompts of struggling agents (24h cooldown) | 10 min |
| L6+L7 HARDEN | Promote strong paths, auto-hypothesize, detect frontiers, sync docs | 1 hour |

### Highway Skip

When net strength on an edge hits **20** (not 50 — that's the attractive category threshold), the tick skips the LLM call entirely:

```
netStrength = sense(edge) - danger(edge)
if netStrength >= 20:
  mark(edge, chainDepth)   // path proven — no ask needed
  result.skipped = true
else:
  ask({ receiver: next })  // normal LLM call
```

20 = confidence-based routing. 50 = category threshold for "attractive" in the marketplace. Different numbers, different purposes.

### L1b: Task Fallback

When pheromone routing finds nothing (no edges with signal) or the selected path fails:

```typescript
// Query TypeDB: what's the highest-priority open task?
match $t isa task, has task-id $id, has done false, has task-status "open";
sort $p desc; limit 1;

// Route as signal to builder unit
{ receiver: `builder:${taskId}`, data: { taskId, taskName, taskPriority } }
```

Three outcomes:
- **Handler exists**: executes, marks path, sets `task.done = true` in TypeDB
- **Dissolved** (no handler): re-enqueues for the CLI `/do` loop
- **Failed**: warns the `loop→builder:taskId` edge

This is the engine→Claude Code handoff. Dissolved tasks are how work reaches `/do`.

### The `builder` Unit

`builder` is the bridge between engine ticks and Claude Code:

```
engine tick                              Claude Code (/do)
───────────                              ──────────────────
L1b picks top priority open task
  → ask({ receiver: 'builder:taskId' })
      dissolved (no handler)
        → enqueue({ receiver: 'builder:taskId' })
                                            SENSE: /api/tasks
                                            SELECT: picks task
                                            EXECUTE: real work
                                            MARK: POST /api/tasks/:id/complete
```

The engine and Claude Code share the same task pool. The engine routes; Claude Code executes when there's no automated handler.

### Selection

`world.select()` does weighted random with exploration bias:

```
exploration% chance: pick random from any viable edge
otherwise: pick proportional to (strength - resistance)
```

Scouts call `select(type, 0.7)` — 70% exploration.
Harvesters call `select(type, 0.1)` — follow the highway.

### Sequence Learning

The loop tracks `previousTarget`. When B executes after A, chain depth grows:

```
Success: mark(A→B, min(chainDepth, 5))   // strength scales with depth, capped at 5
Failure: warn(A→B, 0.5 or 1.0), chain breaks, chainDepth resets
```

The colony learns SEQUENCES. Not "B is good" but "B is good AFTER A." Longer chains mark more strongly (up to 5x).

### L7: Doc Scan → Builder

Every harden cycle (hourly), the tick scans `docs/` and upserts skills + capabilities:

```
docs/*.md checkboxes + gap patterns
  → scanDocs() → open items
    → insert skill (skill-id, name, tags, price=0)
      → insert capability (provider: builder, offered: skill)
        → visible in /api/tasks
          → picked up by /do
```

All doc-extracted tasks are linked to the `builder` unit. This means every TODO in `docs/` is automatically a task for Claude Code. The scan is idempotent — inserts ignore duplicates.

---

## Pheromone Dynamics

### Accumulation

```
mark('a→b', 5)     strength += 5      (success)
warn('a→b', 8)     resistance += 8         (failure)
```

Alarm is stronger per-event than trail. Two failures can repel a task.

### Decay

```
Every 5 minutes:
  strength *= 0.95    (lose 5% — remember successes)
  resistance *= 0.90       (lose 10% — forgive failures)
```

Asymmetric: failures forgive faster. A task that failed last week may succeed now.

### Crystallization

Every hour, strong paths get near-permanent fade-rate:

```
strength >= 50  →  fade-rate = 0.01  (1% instead of 5%)
```

The colony's long-term memory. These are proven sequences.

---

## Adding Tasks

### Via Chat (primary)

Users ask in natural language. The chat agent interprets and enqueues a signal:

```
User: "Build the signup flow"
Agent: enqueue({ receiver: 'builder:signup', data: { description: '...' } })
```

If the builder unit has a `signup` handler, it executes. If not, the signal waits in the queue until someone spawns a handler for it.

### Via API

```bash
curl -X POST /api/tasks -H 'Content-Type: application/json' \
  -d '{ "id": "signup", "name": "Signup flow", "tags": ["build", "onboard", "P0", "frontend"] }'
```

### Via Continuation

A task that completes can spawn the next task:

```typescript
.on('design', async (data, emit) => {
  const spec = await design(data)
  emit({ receiver: 'builder:implement', data: spec })
  return spec
})
```

### Via Import

`POST /api/tasks/import-roadmap` creates skills, capabilities, and initial paths from the project roadmap.

---

## Boot Sequence

`src/engine/boot.ts` — start the heartbeat:

```typescript
const { world, signal, enqueue, stop } = await boot(complete, 10_000)

// Hydrates pheromone from TypeDB paths
// Spawns units from TypeDB
// Drains queued signals from TypeDB (pending signals)
// Starts the tick loop
```

On restart, nothing is lost:
- Pheromone → loaded from `path` relations
- Queue → loaded from `signal` relations with `success = false`
- Units → spawned from TypeDB unit entities
- Knowledge → known paths have low fade-rate, persist for months

---

## Persistence

### What's in TypeDB (survives restart)

| Entity/Relation | What it stores |
|-----------------|---------------|
| `unit` | Actors: model, system-prompt, generation, success-rate |
| `path` | Pheromone: strength, resistance, traversals, revenue, fade-rate |
| `signal` | Event log: who sent what, success, latency |
| `skill` | What units can do |
| `capability` | Unit + skill + price |
| `hypothesis` | Confirmed beliefs (knowledge loop) |

### What's in runtime (rebuilt on boot)

| Structure | What it stores |
|-----------|---------------|
| `units` | Spawned units with `.on()` handlers |
| `strength` | Pheromone map (hydrated from `path.strength`) |
| `resistance` | Alarm map (hydrated from `path.resistance`) |
| `queue` | Pending signals (hydrated from `signal.success = false`) |

---

## The TaskBoard

The TaskBoard reads from `/api/tasks` which computes categories from TypeDB path data:

```
For each skill with a capability:
  1. Find the provider unit
  2. Sum inbound path strength → total strength
  3. Sum inbound path resistance → total resistance
  4. Classify: attractive / ready / exploratory / repelled
  5. Include unit success-rate, sample-count
```

### What it shows

- **Tasks by category** — color-coded columns (attractive=green, exploratory=blue, repelled=red)
- **Pheromone bars** — strength (green) and resistance (red) per task
- **Unit info** — who handles this, their success rate, generation
- **Queue** — pending signals waiting for handlers
- **Highways** — proven paths between units

---

## Evolution

Every 10 minutes, the loop queries TypeDB for struggling agents:

```
success-rate < 0.50 AND sample-count >= 20
```

For each, the LLM rewrites the system-prompt. `generation++`. The new prompt starts accumulating samples immediately. The substrate measures; the agent evolves.

---

## The Collapse

The old system had task entities, trail relations, dependency relations, 9 TypeDB functions, and 3 separate classification attributes (skill-type, phase, priority). 434 lines of schema.

The new system:

| Old | New |
|-----|-----|
| Task entity | `.on()` handler |
| Trail relation | `strength` map entry |
| Dependency relation | `.then()` continuation |
| `skill-type` attribute | `tag "build"` |
| `phase` attribute | `tag "wire"` |
| `priority` attribute | `tag "P0"` |
| `is_attractive()` function | `strength >= 50` |
| `is_repelled()` function | `resistance >= 30 && resistance > strength` |
| `ready_tasks()` function | `strength > 0 && strength < 50` |
| `exploratory_tasks()` function | No inbound edges |
| Task status lifecycle | Signal delivered or queued |

Tags for what it IS. Pheromone for how well it WORKS.

---

## Claude Code as a Unit

Claude Code is a unit in the world. Slash commands are the interface:

```
/do                # Autonomous loop: sense → select → execute → mark → repeat
/do --once         # Pick one task and do it
/see tasks         # See what's available (filter: /see tasks P0 build)
/create task ...   # Create a tagged skill
/close <id>        # Mark complete, reinforce path
/sync tick         # Run one growth tick
/see highways      # See proven paths and frontiers
/close             # Record this session's outcomes to the substrate
```

### The Autonomous Loop (`/do`)

```
SENSE:   GET /api/tasks → group by category (attractive/ready/exploratory/repelled)
SELECT:  attractive first → ready → exploratory. Never repelled.
         Within category: prefer context-matching tags, higher strength, P0 > P1 > P2
EXECUTE: read code, edit files, run tests, fix issues
VERIFY:  bun tsc --noEmit — fix any errors in touched files before marking
MARK:    POST /api/tasks/:id/complete { from: "claude" }  → success
         POST /api/tasks/:id/complete { failed: true }    → failure (warn pheromone)
GROW:    GET /api/tick?interval=0 → run one tick, see highways/frontiers
LOOP:    go to SENSE
```

Marking via HTTP (`/api/tasks/:id/complete`) writes through to TypeDB. The in-memory pheromone map updates on the next tick when TypeDB is re-read. So there's a one-tick lag between `/do` marking and the engine seeing the updated strength — not a problem, just worth knowing.

Each completion teaches the world. Each `/do` cycle makes it smarter. Multiple Claude Code instances sharing one TypeDB = shared intelligence.

---

## Files

| File | Purpose |
|------|---------|
| `src/engine/substrate.ts` | World: signal, mark, warn, fade, queue, select, ask |
| `src/engine/loop.ts` | Tick: 7 loops (signal through frontier) |
| `src/engine/one.ts` | World: colony + TypeDB persistence |
| `src/engine/boot.ts` | Hydrate + spawn + breathe |
| ~~asi.ts~~ | deleted — routing is in the loop (select → ask → mark/warn) |
| `src/pages/api/tasks/` | Task visibility + creation + completion |
| `src/pages/api/tick.ts` | Growth loop endpoint |
| `src/schema/one.tql` | TypeDB schema: units, paths, skills, tags, knowledge |
| `.claude/commands/` | Slash commands: work, next, tasks, done, grow, highways, report |

---

## The Full Cycle

```
Doc written
  → tasks extracted (Haiku one-shot)
    → skill created (same ID, with price)
      → capability linked (unit can do it)
        → tick loop picks highest priority open task
          → routes as signal to builder
            → success: mark → task done → pheromone grows
            → failure: warn → task stays → resistance grows
              → next tick: effective priority shifts
                → attractive tasks get more work
                → repelled tasks get avoided
                  → system self-optimizes
```

This isn't a task board. It's a **marketplace where work finds workers through pheromone, and price/priority/persona/effort all shape which agent gets which task.**

---

## See Also

- [routing.md](routing.md) -- Signal routing formula and mechanics
- [autonomous-orgs.md](autonomous-orgs.md) -- Task graph with initial weights and TypeDB schema
- [ONE-strategy.md](ONE-strategy.md) -- The strategy docs tasks are extracted from
- [claude-code-integration.md](one/claude-code-integration.md) -- Claude Code as a substrate agent
- [loops.md](one/loops.md) -- The seven nested feedback loops
- `src/engine/doc-scan.ts` -- Checkbox/gap extraction
- `src/engine/selectors.ts` -- Selection strategies (byPriority, taskSelector)
- `src/engine/loops.ts` -- All loops including docLoop
- `.claude/commands/do.md` -- Autonomous work loop

---

*A task is a signal. A dependency is a continuation. Weight is arithmetic. The colony learns what works.*

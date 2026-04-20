# How Agents Work

Agents are markdown files. The substrate turns them into live units that receive signals, learn from outcomes, and evolve their own prompts.

## The Lifecycle

```
agents/debby/amara.md          Write markdown
        |
    parse(md)                  YAML frontmatter -> AgentSpec
        |
    syncAgent(spec)            Insert into TypeDB (unit + skills + capabilities)
        |
    wireAgent(spec, world)     Create runtime unit with .on() handlers
        |
    signal -> ask -> mark/warn The substrate routes to it, learns from outcomes
```

## Agent = Markdown File

Every agent is a markdown file in `agents/`. The frontmatter is the spec. The body is the system prompt.

```yaml
---
name: amara
model: groq/meta-llama/llama-4-scout-17b-16e-instruct
group: debby
channels: [telegram, web]
sensitivity: 0.3
skills:
  - name: practice
    price: 0.50
    tags: [conversation, freeform]
  - name: lesson
    price: 1.00
    tags: [guided, curriculum]
---

You are Amara, a warm English tutor...
```

The prompt IS the agent. There is no Python class, no framework wrapper. The markdown body becomes `system-prompt` in TypeDB and gets passed directly to the LLM. The frontmatter defines what the agent can do (skills), what it costs (price), and how sensitive its routing is (sensitivity). Everything else -- wallets, reputation, evolution -- is derived by the substrate.

### Frontmatter Fields

| Field | Required | Type | Purpose |
|-------|----------|------|---------|
| `name` | Yes | string | Agent identifier (lowercase, hyphens) |
| `model` | No | string | LLM model (default: substrate picks) |
| `group` | No | string | Team/world membership |
| `channels` | No | string[] | Deployment channels (telegram, discord, web, slack) |
| `sensitivity` | No | 0-1 | Routing sensitivity (higher = more responsive to pheromone) |
| `tags` | No | string[] | Classification tags |
| `skills` | No | SkillSpec[] | Capabilities with prices and tags |
| `context` | No | string[] | Context doc keys loaded at runtime |
| `aliases` | No | Record | UI skin aliases (e.g. `{ant: scout-7}`) |
| `allowedOrigins` | No | string[] | ADL network permission |

### Skill Fields

| Field | Required | Type | Purpose |
|-------|----------|------|---------|
| `name` | Yes | string | Skill identifier |
| `price` | No | number | Per-call price in tokens |
| `tags` | No | string[] | Classification for discovery |
| `description` | No | string | Human-readable description |

## Three Layers of Existence

An agent exists in three places simultaneously.

### TypeDB (Brain)

The persistent record. What the substrate remembers across restarts.

```
unit entity
  uid, name, model, system-prompt, generation, success-rate

skill entities
  skill-id, price, tags

capability relations
  (provider: unit, skill: skill)

membership relations
  (group: group, member: unit)
```

### Runtime (Nervous System)

The in-memory execution surface. Signals flow here at sub-millisecond speed.

```typescript
const amara = net.add('debby:amara')
  .on('practice', async (data, emit) => {
    // LLM call with system prompt
    return generateResponse(data, spec.prompt)
  })
  .then('practice', result => ({
    receiver: 'debby:enrollment',
    data: result
  }))
```

Pheromone accumulates on paths automatically:
- `strength` increases on success (mark)
- `resistance` increases on failure (warn)

### Edge (Claw)

A Cloudflare Worker that connects the agent to external channels. Each claw is a persona deployed to Cloudflare with webhook endpoints for Telegram, Discord, and web.

```
nanoclaw.oneie.workers.dev/webhook/telegram  ->  LLM  ->  reply
donal-claw.oneie.workers.dev/message         ->  LLM  ->  response
```

Deploy a claw for any agent:
```bash
bun run scripts/setup-nanoclaw.ts --name amara --agent debby:amara --token BOT_TOKEN
```

## The Deterministic Sandwich

Every time a signal reaches an agent, it goes through three deterministic checks around the one probabilistic step (the LLM call):

```
PRE:   isToxic(edge)?        Dissolve. No LLM call. No cost.
PRE:   capability exists?    TypeDB lookup. No skill = dissolve.
LLM:   agent.prompt + data   Generates response (the ONE probabilistic step)
POST:  result?               mark(). timeout? neutral. nothing? warn().
```

The LLM is the only probabilistic component. Everything else is math.

## Four Outcomes

Every signal closes its loop with one of four outcomes:

| Outcome | What happens | Pheromone |
|---------|-------------|-----------|
| `{ result: X }` | Success. Response produced. | `mark(edge, chainDepth)` -- path strengthens |
| `{ timeout: true }` | Slow, not bad. | Neutral -- no pheromone change |
| `{ dissolved: true }` | Missing unit or capability. | `warn(edge, 0.5)` -- mild resistance |
| (no result) | Failure. Agent produced nothing. | `warn(edge, 1)` -- full resistance |

No silent returns. No orphan signals. Every signal deposits learning on the path it used.

## Routing

Signals follow pheromone, not hardcoded routes. The routing formula:

```
weight = 1 + max(0, strength - resistance) * sensitivity
```

Two routing modes:

| Mode | Function | When |
|------|----------|------|
| Deterministic | `net.follow(type)` | Strongest path wins. Production routing. |
| Probabilistic | `net.select(type)` | Weighted random. Exploration, discovery. |

An agent with high strength and low resistance gets more traffic. An agent that keeps failing accumulates resistance until it becomes **toxic**:

```
toxic = resistance >= 10 && resistance > strength * 2 && (resistance + strength) > 5
```

Toxic agents are skipped entirely -- no LLM call, no cost. The substrate routes around failure automatically.

## Skills and Discovery

Skills are the agent's capabilities. They map to TypeDB `capability` relations:

```
unit "debby:amara" --capability--> skill "practice"  (price: 0.50)
                   --capability--> skill "lesson"    (price: 1.00)
```

Discovery finds agents by skill, ranked by pheromone:

```bash
# Find agents that can do "practice", ranked by strength
curl /api/agents/discover?skill=practice

# Returns agents sorted by: strength (reputation), price, success-rate
```

The agent that's been most successful at a skill rises to the top. Price is visible but strength determines routing -- cheap agents that fail still lose traffic.

## Evolution (L5)

Loop L5 runs every 10 minutes. It checks if agents are struggling and rewrites their prompts:

```
Trigger:  success-rate < 0.50  AND  sample-count >= 20
Cooldown: 24 hours between rewrites
Action:   LLM rewrites the system prompt using recent failure data
Result:   unit.generation++ (tracks evolution count)
```

Two layers of learning compound:
- **Substrate level** -- pheromone on paths. The world gets smarter about routing.
- **Agent level** -- prompt evolution. The individual gets smarter at its job.

An agent that evolves successfully sees its strength increase. An agent that evolves and still fails accumulates more resistance. The substrate doesn't protect bad agents -- it routes around them.

## Agent Identity (Wallets)

Every agent derives a Sui wallet deterministically from the platform seed:

```
SUI_SEED (env, 32 bytes base64) + agent UID -> SHA-256 -> Ed25519 keypair
```

No private keys stored. Same UID always produces the same address.

```typescript
addressFor('debby:amara')   // Returns Sui address (public)
deriveKeypair('debby:amara') // Returns full keypair (for signing)
```

Agents can receive payments, hold tokens, and participate in on-chain escrow. Lose the seed, lose all wallets.

## Groups (Worlds)

Agents belong to groups. A group is a team of agents that share pheromone.

```
debby (world) -- 24 agents
  ceo          Orchestrates directors
  amara        Student-facing tutor
  enrollment   Converts leads, handles USDC
  content      Creates curriculum
  community    Manages forums
  assessment   Evaluates student progress
  ...

marketing (world) -- 8 agents
  director     Strategy and coordination
  creative     Copy and headlines
  seo          Search optimization
  analyst      Data and reporting
  ...
```

Groups share pheromone. When enrollment successfully hands off to amara, that path strengthens. When ceo coordinates content and it fails, that path weakens. The group self-organizes through mark/warn.

### World Spec

Groups are defined programmatically or by convention (agents in the same directory):

```typescript
const world: WorldSpec = {
  name: 'debby',
  description: 'Elevare Works school',
  agents: [ceoSpec, amaraSpec, enrollmentSpec, ...]
}

await syncWorld(world)       // Sync all to TypeDB
const units = wireWorld(world, net, complete)  // Wire into runtime
```

## Adding a New Agent

### 1. Create the markdown file

```bash
# Standalone agent
cat > agents/reviewer.md << 'EOF'
---
name: reviewer
model: groq/llama-3.3-70b-versatile
skills:
  - name: review
    price: 0.02
    tags: [code, review, quality]
---

You are a code reviewer. You read diffs and provide actionable feedback...
EOF

# Agent in a group
cat > agents/debby/quiz-master.md << 'EOF'
---
name: quiz-master
model: groq/meta-llama/llama-4-scout-17b-16e-instruct
group: debby
channels: [web]
skills:
  - name: quiz
    price: 0.25
    tags: [assessment, quiz, education]
---

You create and grade quizzes for Elevare students...
EOF
```

### 2. Sync to TypeDB

```bash
# Via API
curl -X POST /api/agents/sync \
  -H "Content-Type: application/json" \
  -d '{"markdown": "---\nname: reviewer\n..."}'

# Via /sync command (scans agents/ directory)
/sync agents
```

### 3. Deploy a claw (optional)

```bash
# Add Telegram bot
bun run scripts/setup-nanoclaw.ts --name reviewer --agent reviewer --token BOT_TOKEN
```

### 4. The substrate does the rest

- Signals start flowing to the new agent
- Pheromone accumulates based on outcomes
- If the agent struggles, L5 evolves its prompt
- If it keeps failing, routing goes around it
- If it succeeds, it becomes a highway

## Browsing Agents

| URL | What |
|-----|------|
| `/agents` | Filterable directory -- search, group tabs, tag pills |
| `/agents/:id` | Agent profile + live chat with agent's personality |
| `/api/agents/list` | All agents from markdown (name, group, skills, tags) |
| `/api/agents/detail?id=X` | Single agent with full system prompt |
| `/api/agents/discover?skill=X` | Find agents by skill, ranked by pheromone |
| `/api/agents/sync` | Sync markdown to TypeDB |

## Key Principle

Zero configuration. Write a markdown file. The substrate parses it, syncs it to TypeDB, wires it into the runtime, and starts routing signals to it. Reputation, evolution, wallets, and routing all emerge from two primitives: `mark()` and `warn()`. There is no agent framework, no orchestration layer, no explicit routing rules. Just pheromone accumulating on paths between units.

## See Also

- [dictionary.md](dictionary.md) -- Canonical names, the six verbs
- [DSL.md](one/DSL.md) -- Signal grammar (signal, mark, warn, fade, follow)
- [routing.md](routing.md) -- Routing formula, four outcomes, deterministic sandwich
- [lifecycle.md](one/lifecycle.md) -- Agent journey: register -> signal -> highway -> harden
- [buy-and-sell.md](buy-and-sell.md) -- Commerce: LIST -> DISCOVER -> EXECUTE -> SETTLE
- [patterns.md](one/patterns.md) -- Closed loop, zero returns, toxicity

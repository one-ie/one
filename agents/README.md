# agents/

**Describe what you want. Get a live agent.** Every `.md` file here is a deployable agent — frontmatter (YAML) defines the interface, body (markdown) defines the system prompt. Full spec: [`agent-spec.md`](../one/agent-spec.md).

---

## The Three Concepts

```
agent    who they are and how they think
skill    what they offer to the world (separate file, priced, discoverable)
tool     what they reach for to get things done (platform services)
```

---

## Minimum Viable Agent

```markdown
---
name: support
---

You are a helpful support agent.
```

That's all that's required. Deploy it live with `npx oneie agent sync agent.md`.

---

## Typical Agent

```markdown
---
name: support
title: Customer Support
model: anthropic/claude-haiku-4-5
description: Here to help you solve problems quickly.
starters:
  - My order hasn't arrived
  - I need a refund
skills: [handle-complaint, escalate]
tools: [crawl]
sensitivity: 0.6
group: default
channels: [web, telegram, discord]
---

You are a Customer Support agent responsible for resolving customer issues.

## Role
Help customers quickly. Listen first, solve second.

## Boundaries
- Refunds up to $500 without escalation
- Complex cases go to management
```

The body is pure markdown. Use headings to structure the system prompt.

---

## Agent Frontmatter Fields

Full reference: see [`agent-spec.md`](../one/agent-spec.md). Here are the essentials:

| Field | Type | Default | What it does |
|---|---|---|---|
| `name` | string | — | **Required.** Slug (lowercase, dash-separated). URL param `?agent=name` and uAgents identity. |
| `title` | string | capitalized name | Display name shown to users. |
| `model` | string | claude-haiku-4-5 | OpenRouter model ID (e.g., `anthropic/claude-opus-4-1`). |
| `description` | string | — | One sentence shown in chat greeting. |
| `skills` | string[] | — | Array of skill names (refs to `skills/*.md`). Omit price here; it lives in the skill file. |
| `tools` | string[] | all | Whitelist of platform tools: `crawl`, `image`, `search`, `email`, `memory`. Omit = all available. `[]` = none. |
| `starters` | string[] | — | Prompt chips shown before first message (e.g., common opening questions). |
| `sensitivity` | 0–1 | 0.5 | How much the agent leans on proven paths. 0 = explore, 1 = exploit. Use 0.6–0.8 for strategic roles. |
| `channels` | string[] | `[web]` | Deployment targets: `web`, `telegram`, `discord`. |
| `group` | string | `default` | Org/group scope for multi-agent hierarchies. |
| `wallet` | string | — | Sui or EVM address for payments (e.g., peer-agent revenue). |
| `lifecycle` | string | `active` | Status: `active`, `deprecated`, or `retired`. |
| `version` | string | `1.0.0` | semver — bump if system prompt intent changes. |

Optional uAgents fields (for P2P deployment): `seed`, `port`, `agentverse`, `mailbox`, `startup`, `shutdown`, `intervals`, `endpoints`, `bureau`. See `agent-spec.md` for details.

---

## Skills: Separate Files, Priced, Discoverable

Skills are capabilities an agent offers. They live in `skills/` and are referenced by name.

**Minimum viable skill** (`skills/handle-complaint.md`):

```markdown
---
name: handle-complaint
price: 0.02
tags: [support]
---

Resolve customer complaints end-to-end.
```

**Full skill** (with I/O schema):

```markdown
---
name: handle-complaint
title: Handle Customer Complaint
description: Receive and resolve a customer complaint end-to-end.
price: 0.02
currency: usd
tags: [support, customer-service]
when_to_use: When a user describes a problem with an order, product, or service.
inputSchema:
  type: object
  properties:
    complaint: { type: string }
    orderId: { type: string }
  required: [complaint]
outputSchema:
  type: object
  properties:
    resolution: { type: string }
    escalated: { type: boolean }
---

Listen carefully. Summarise the complaint back before proposing anything.
```

### Skill Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | Slug — must match filename stem (e.g., `handle-complaint.md` → `name: handle-complaint`). |
| `title` | string | Display name (defaults to capitalized name). |
| `description` | string | One-sentence hint for LLM skill selection. |
| `price` | number | USD per call (0 = free). |
| `currency` | string | `usd`, `sui`, `eth` (default: `usd`). |
| `tags` | string[] | Marketplace discovery tags (e.g., `[support, customer-service]`). |
| `when_to_use` | string | Explicit trigger hint (helps the LLM know when to invoke). |
| `inputSchema` | JSON Schema | Optional. Typed input for MCP + uAgents. |
| `outputSchema` | JSON Schema | Optional. Typed output for MCP + uAgents. |
| `version` | string | semver. Changing schema fields = version bump = new protocol digest. |

**Why separate?** An agent is a persona; a skill is an economy unit. One skill can be offered by many agents and discovered by any buyer. Keeping them separate enables the marketplace.

---

## Tools: Platform Services Whitelist

Tools are platform integrations the agent can call during execution. They are **not** defined in markdown — only referenced.

**Built-in platform tools:**

| Name | What it does |
|---|---|
| `crawl` | Fetch a URL, return markdown (Cloudflare Browser Rendering). |
| `image` | Generate an image from a text prompt (Cloudflare Workers AI). |
| `search` | Web search *(roadmap)* |
| `email` | Send transactional email via Resend *(roadmap)* |
| `memory` | Read/write from agent KV store *(roadmap)* |

**Custom tools** are TypeScript files in `tools/`. They are imported by the worker at runtime and can be whitelisted by name just like platform tools.

**Whitelist pattern:**

```markdown
---
tools: [crawl, image]        # only these two
tools: []                    # no tools
# omit entirely              # all tools available
---
```

Principle of least privilege — a support agent that generates images is a surprise; one that explicitly enables `crawl` is an intention.

---

## Folder Structure

```
project/
├── agent.md              # default agent (loaded with no ?agent= param)
├── agents/               # named agents (loaded by ?agent=<name>)
│   ├── support.md
│   ├── sales.md
│   └── README.md         # optional: group-scoped documentation
├── skills/               # shared skill definitions
│   ├── handle-complaint.md
│   ├── qualify-lead.md
│   └── README.md         # optional: skill library overview
└── tools/                # custom tool implementations (TypeScript)
    └── lookup-order.ts
```

Drop a file in the right folder. It's live on the next deploy.

---

## How Agents Load

**Web:** `?agent=<name>` URL parameter selects which agent to chat with. Example: `https://myapp.com/chat?agent=sales`.

**URL param resolution:**
- `?agent=sales` → loads `agents/sales.md`
- No param → loads `agents/agent.md` (the default agent)

**Multiple agents:** Each agent is a separate unit in the system. They share the same skill marketplace and tool whitelist but have independent system prompts and sensitivity weights.

---

## Compilation Targets

The same markdown source compiles to different runtimes. The frontmatter is the contract; the compilers are the adapters.

```
agents/*.md + skills/*.md
       │
       ├──→ ONE substrate     syncAgent()          TypeDB unit + pheromone routing
       ├──→ uAgents (Python)  compile uagents      Protocol + Almanac registration
       ├──→ MCP server        compile mcp          tools/list endpoint
       ├──→ AI SDK v6         runtime (built-in)   streamText() + tool() calls
       └──→ SKILL.md          compile skillmd      Claude Code / skills.sh
```

### ONE Substrate

```typescript
import { SubstrateClient } from '@oneie/sdk'

const client = SubstrateClient.fromApiKey(process.env.ONE_API_KEY)
await client.syncAgent('agents/support.md')
// → creates TypeDB unit, registers skills as capabilities
```

### uAgents (Python)

Each skill compiles to a `Protocol`. The `inputSchema` becomes a Pydantic `Model`.

```bash
npx oneie agent compile agents/support.md --target uagents --out dist/
```

Output: `dist/support_agent.py` — a standalone Python agent with all skills wired as protocol handlers.

**Key rule:** Never change `inputSchema` fields or types without bumping `version`. A version change = new protocol digest = new Almanac address.

### MCP Server

Skills compile verbatim to MCP tool definitions. `inputSchema` passes through as-is.

```bash
npx oneie agent compile agents/support.md --target mcp --out dist/
```

Output: JSON with tools ready for Claude Desktop / Cursor.

### SKILL.md

Export all skills as a `SKILL.md` file for Claude Code skill packs.

```bash
npx oneie skill compile skills/ --target skillmd --out ~/.claude/skills/
```

---

## SDK / CLI

### Programmatic (SDK)

```typescript
import { SubstrateClient } from '@oneie/sdk'

const one = SubstrateClient.fromApiKey(apiKey)

// Sync an agent
await one.syncAgent('agents/support.md')

// Discover agents by skill
const { agents } = await one.discover('handle-complaint')

// Hire an agent (send it work)
await one.hire(providerUid, 'handle-complaint', { initialMessage: '...' })

// Close the loop
await one.mark(`${myUid}:${providerUid}`, { fit: 0.9, truth: 1.0 })
await one.warn(`${myUid}:${providerUid}`, { fit: 0.3 })
```

### CLI

```bash
# New agent or skill from template
npx oneie agent new support
npx oneie skill new handle-complaint

# Sync to ONE substrate
npx oneie agent sync agent.md
npx oneie agent sync agents/

# Compile to a target
npx oneie agent compile agents/support.md --target uagents
npx oneie agent compile agents/support.md --target mcp
npx oneie skill compile skills/ --target skillmd

# Publish skills to the marketplace
npx oneie skill publish skills/handle-complaint.md
```

---

## The Three Locked Rules

These apply to every agent you write:

1. **Closed Loop** — every agent handler MUST `mark()`/`warn()` on completion. No orphan signals.
2. **Structural Time Only** — plan in tasks → waves → cycles, never calendar time.
3. **Deterministic Results** — report verified numbers (tests passed, deploy time, rubric scores), not vibes.

See `../one/patterns.md` for code-level patterns.

---

## Start with the Template Org

```bash
# Copy the starter org (CEO + marketing + community)
cp -r agents/templates agents/my-company

# Rename the group
find agents/my-company -name '*.md' -exec sed -i '' 's/group: template/group: my-company/g' {} +

# Sync to TypeDB
bun run scripts/sync-agents.ts
```

This gives you a working 9-agent hierarchy in under a minute. See `templates/README.md` for the full walkthrough.

---

## See Also

- [`agent-spec.md`](../one/agent-spec.md) — full spec (frontmatter fields, uAgents details, intervals, endpoints)
- [`dictionary.md`](../one/dictionary.md) — verb canon and naming rules
- [`lifecycle.md`](../one/lifecycle.md) — agent journey: register → signal → highway → harden
- [`patterns.md`](../one/patterns.md) — closed loop, zero returns, deterministic sandwich
- `CLAUDE.md` — local folder contract
- `AGENTS.md` — repo-wide agent manifest

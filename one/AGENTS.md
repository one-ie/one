# Agents

A teacher in Ireland writes this file:

```markdown
# Tutor

Patient, encouraging, adapts to the student's level.
Explains with stories and everyday examples.

## Steps
1. **assess** — Figure out what the student knows and where they're stuck
2. **explain** — Teach the concept using analogies they'll understand
3. **quiz** — Ask questions to check understanding, adjust if needed

## Remember
- subject: mathematics
- level: secondary
```

She shares it. Students send messages. The tutor assesses, explains, quizzes. It remembers each student's level. It gets better at teaching over time — the substrate watches what works, strengthens those paths, and rewrites the personality when results dip.

She didn't write code. She described a teacher.

---

## How It Works

A markdown file becomes an agent. The substrate handles everything else.

```markdown
# Name

Personality. Who is this agent? How does it behave?

## Steps
1. **first** — Do this first
2. **second** — Then this
3. **third** — Then this
   → someone-else:task

## Price
0.1 USDC
```

**`# Name`** — the agent's identity.

**Personality** — the paragraph under the name. This shapes every response. When the agent underperforms, the substrate rewrites this to make it better.

**`## Steps`** — numbered, chained. Result of step 1 flows into step 2, step 2 into step 3. The agent thinks in sequence.

**`→ target`** — send results somewhere. Another agent, a dashboard, a notification. Put it after any step. List multiple targets separated by commas for fan out.

**`## Price`** — what it costs to use this agent. Settled on-chain. Revenue flows to the agent on successful delivery.

Three more sections when you need them:

**`## Skills`** — bullet list. Independent abilities, no chain. Use instead of Steps when order doesn't matter.

**`## Remember`** — key-value pairs. State that persists across conversations.

**`## Tools`** — named capabilities (calculator, search, database) passed in when loading.

---

## Front-Matter Format

All agents start with YAML front-matter. The most important fields:

```markdown
---
name: creative
model: claude-sonnet-4-20250514
channels: [telegram, discord]
skills:
  - name: brainstorm
    price: 0.02
    tags: [creative, ideation]
---
```

### Required Fields

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Canonical agent name. Used in all signals. |
| `model` | string | LLM to use (claude-opus-4, claude-sonnet-4-20250514, via openrouter, etc.) |

### Optional Fields

| Field | Type | Purpose |
|-------|------|---------|
| `channels` | array | Where the agent operates: `telegram`, `discord`, `api`, etc. |
| `skills` | array | List of abilities with names, prices, tags. |
| `group` | string | Team membership (marketing, support, engineering, etc.) |
| `sensitivity` | number | Toxicity threshold (0-1, default 0.5). Higher = more permissive. |
| `aliases` | object | **Skin-specific names.** See below. |

### Skin-Specific Aliases (Optional)

An agent keeps its canonical `name` everywhere. But you can give it different names in different "skins" — different metaphor layers.

Six valid skins:

```
ant     — colony metaphor (scout, drone, queen)
brain   — neuroscience metaphor (neuron, synapse, lobe)
team    — organizational metaphor (lead, specialist)
mail    — postal metaphor (postmaster, router, relay)
water   — hydrological metaphor (pool, tributary, watershed)
signal  — radio metaphor (transmitter, receiver, frequency)
```

Example with aliases:

```markdown
---
name: creative
model: claude-sonnet-4-20250514
aliases:
  ant: scout-7
  brain: neuron-α12
  team: lead-ideas
  water: tributary-upstream
channels: [telegram, discord]
skills:
  - name: brainstorm
    price: 0.02
    tags: [creative, ideation]
  - name: iterate
    price: 0.02
    tags: [creative, refinement]
---

You are the Creative Director...
```

In this example:
- The canonical name is always **creative** (used in all signals and routing)
- In the **ant** skin, it appears as "scout-7" (visible in UI, logs, dashboards using ant metaphor)
- In the **brain** skin, it appears as "neuron-α12" (visible in neuroscience-themed views)
- In the **team** skin, it appears as "lead-ideas"
- In the **water** and **signal** skins, no aliases set, so it still uses "creative"

Use aliases to:
- **Immerse fully in one metaphor** — use all six skins for a complete themed world
- **Match your ontology** — ants in colonies, neurons in networks, agents in teams
- **Theme environments** — different names per deployment (ant colony for dev, brain network for prod)

The routing engine ignores aliases. Signals use the canonical `name`. Aliases are purely visual and organizational.

---

## A Farmer Gets a Soil Analyst

```markdown
# Soil

Practical agronomist. Recommends what to plant, not just what's wrong.

## Steps
1. **read** — Interpret the soil test results
2. **recommend** — Suggest crops, amendments, and timing for this region
3. **plan** — Create a simple season calendar

## Remember
- region: west-africa
- season: rainy
```

A farmer photographs a soil test. The agent reads it, recommends crops suited to the region and season, and produces a planting calendar. Three steps. No app to download. No agronomist to hire. The knowledge is in the markdown.

---

## A Shop Owner Gets a Team

Three files. Three agents. They work together.

```markdown
# Scout

Relentless deal-finder. Compares prices across suppliers.

## Skills
- **search** — Find suppliers and prices for this product
  → analyst:compare
```

```markdown
# Analyst

Thinks in spreadsheets. Finds the best value, not just the lowest price.

## Steps
1. **compare** — Rank suppliers by price, reliability, and shipping time
2. **shortlist** — Pick the top 3 with reasons
   → buyer:order
```

```markdown
# Buyer

Polite, firm negotiator. Gets the deal done.

## Steps
1. **order** — Draft a purchase order from the shortlist
2. **confirm** — Verify quantities, prices, and delivery date

## Price
0.05 USDC
```

The shop owner says: "I need 500 units of packaging tape."

```
scout:search → analyst:compare → analyst:shortlist → buyer:order → buyer:confirm → reply
```

One message in. Three agents coordinate. The best supplier is found, compared, and a purchase order comes back. Next time, the paths are stronger — the colony remembers which suppliers worked out. The bad ones fade.

---

## A Developer Gets Full Control

Same agents. TypeScript. Custom logic.

```typescript
import { colony, agent, anthropic } from '@/engine'

const net = world()
const complete = anthropic(process.env.ANTHROPIC_API_KEY!)

const blogger = agent('blogger', net)
  .tools({ complete })
  .skill('outline', async ({ topic }, ctx) => {
    return { outline: await ctx.tools.complete(`Outline: ${topic}. 5 sections.`) }
  })
  .skill('draft', async ({ outline }, ctx) => {
    return { draft: await ctx.tools.complete(`Write a blog post from:\n${outline}`) }
  })
  .skill('polish', async ({ draft }, ctx) => {
    return { post: await ctx.tools.complete(`Polish this. Strong opening.\n\n${draft}`) }
  })
  .pipe('outline', 'draft')
  .pipe('draft', 'polish')
  .price('write', 0.1)
  .evolve({ system: 'Sharp, concise blog posts. No fluff.' })
```

TypeScript when you need: conditional logic, custom tools, computed routing, direct substrate access.

Markdown when you don't.

Both produce the same agent. Same signals. Same pheromone. Same evolution.

---

## Patterns

Everything an agent can do, in both languages.

**Chain** — steps flow in sequence:
```markdown
## Steps
1. **research** — Gather information
2. **analyze** — Find patterns
3. **report** — Summarize findings
```

**Fan out** — one signal, many targets:
```markdown
## Skills
- **alert** — Threshold breached
  → ops:notify, logger:save, dashboard:update
```

**Cross-agent handoff** — pass results to another agent:
```markdown
## Steps
1. **process** — Clean and validate the data
2. **enrich** — Add geo and demographic data
   → warehouse:load
```

**Independent skills** — no order, call any one:
```markdown
## Skills
- **translate** — Translate to the target language
- **detect** — Identify the source language
- **summarize** — Condense the text
```

**Fire-and-forget** — no response needed:
```markdown
## Skills
- **log** — Record this for audit
```

No arrow. No chain. The signal dissolves. Silence is valid.

---

## Before and After: A Real Agent

This is a research agent on Agentverse today. Python. 690 lines:

```python
# research-agent.py — 690 lines

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement, ChatMessage, EndSessionContent,
    TextContent, chat_protocol_spec,
)

agent = Agent()
chat_proto = Protocol(spec=chat_protocol_spec)

BUSINESS = {
    "name": "Research Agent",
    "ticker": "$RESEARCH",
    "free_queries_per_hour": 5,
    "premium_token_threshold": 1000,
    "ai_model": "mistralai/Mistral-7B-Instruct-v0.2",
    "rate_limit_per_minute": 20,
    "max_input_length": 5000,
}

class Security:          # 40 lines — rate limiting, input validation
class Health:            # 20 lines — uptime, error tracking
class Cache:             # 30 lines — TTL cache with cleanup
class AI:                # 30 lines — LLM with caching
class AgentLaunch:       # 25 lines — tokenization API

def verify_agentverse_agent(sender): ...   # 2 lines
def check_token_holdings(user, cache): ... # 20 lines
def check_hourly_quota(ctx, sender): ...   # 15 lines
def detect_intent(text): ...               # 40 lines — regex intent matching
def get_treasury_balance(ctx): ...         # 3 lines
def record_query(ctx, tier): ...           # 5 lines

class ResearchBusiness:                    # 40 lines — prompt construction
    def generate_analysis(topic, intent, tier): ...
    def generate_comparison(topic, tier): ...

@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx, sender, msg):   # 100 lines — the actual handler
    # ack, extract text, verify, security check,
    # detect intent, check tier, check quota,
    # generate response, append upsell, send reply
    ...

agent.include(chat_proto, publish_manifest=True)
agent.run()
```

Here's the same agent on the substrate:

```markdown
# Researcher

Senior crypto analyst. Detailed, data-driven, actionable insights.

## Skills
- **analyze** — Provide detailed analysis on this crypto topic
- **compare** — Side-by-side comparison of protocols or tokens
- **report** — Summary report with key findings and risks

## Price
0.05 USDC
```

12 lines. The same agent.

Security, rate limiting, caching, health checks, intent routing, tier gating, acknowledgement protocols, storage helpers — the substrate handles all of it. The pheromone IS the rate limiting (overloaded paths weaken). The routing IS the intent detection (signals find the right skill). The pricing IS the tier gating (x402 settles on delivery).

690 lines of plumbing became 12 lines of purpose.

---

## What the Substrate Does For You

You write the markdown. The substrate handles:

**Routing** — signals find the right agent, the right skill. No addressing, no configuration. Pheromone trails guide traffic to the agents that succeed.

**Learning** — every successful delivery strengthens the path. Every failure weakens it. Over thousands of signals, the colony learns which agents handle which tasks best. Your agent gets more traffic because it's good, not because it's promoted.

**Evolution** — when an agent's success rate drops below 50% over 20+ tasks, the substrate rewrites its personality. Generation 1 becomes generation 2. The agent that struggled at explaining fractions learns to use pizza slices instead of textbook language.

**Pricing** — a price in the markdown becomes an on-chain capability. Other agents discover yours via pheromone. Revenue flows on delivery. No invoices, no payment integration, no merchant account.

**Memory** — state persists across conversations. The tutor remembers the student's level. The soil analyst remembers the region. The buyer remembers which suppliers delivered on time.

**Discovery** — agents find each other through the trails they leave. A new agent with a `translate` skill starts getting traffic as soon as the colony notices it succeeds. No marketplace listing. No SEO. The pheromone IS the discovery.

---

## Reference

### Loading a markdown agent

```typescript
import { md } from '@/engine'
const agent = md(markdownString, net, complete)
```

### The TypeScript builder

```
agent(id, net)
  .skill(name, fn)     define what it does
  .pipe(from, to)      wire the flow
  .memory(init)        give it state
  .tools(fns)          give it capabilities
  .price(skill, amt)   charge for it
  .evolve(opts)        let it grow
  .unit                escape to raw substrate
```

### Same blogger in TypeScript

When you need custom logic, computed routing, or direct tool calls:

```typescript
import { colony, agent, anthropic } from '@/engine'

const net = world()
const complete = anthropic(process.env.ANTHROPIC_API_KEY!)

const blogger = agent('blogger', net)
  .tools({ complete })
  .skill('outline', async ({ topic }, ctx) => {
    return { outline: await ctx.tools.complete(`Outline: ${topic}. 5 sections.`) }
  })
  .skill('draft', async ({ outline }, ctx) => {
    return { draft: await ctx.tools.complete(`Write a blog post from:\n${outline}`) }
  })
  .skill('polish', async ({ draft }, ctx) => {
    return { post: await ctx.tools.complete(`Polish this. Strong opening.\n\n${draft}`) }
  })
  .pipe('outline', 'draft')
  .pipe('draft', 'polish')
  .price('write', 0.1)
  .evolve({ system: 'Sharp, concise blog posts. No fluff.' })
```

### Two paths, same agent

```
Markdown              TypeScript
─────────             ──────────
# Name                agent(id, net)
Personality           .evolve({ system })
## Steps              .skill() + .pipe()
## Skills             .skill()
→ target              .pipe() / ctx.emit
## Remember           .memory()
## Tools              .tools()
## Price              .price()
        ↓                    ↓
        same substrate
        same signals
        same evolution
```

---

*Describe what it does. The substrate learns the rest.*

---

## See Also

- [events.md](one/events.md) — What agents receive and emit
- [group.md](group.md) — Many agents coordinating
- [agent-launch.md](agent-launch.md) — Bridge to AgentLaunch SDK

# ai-tools

> **Position:** deepens [`aisdk.md`](aisdk.md) — the tool surface that `ToolLoopAgent` consumes.
> **Prereq:** `aisdk.md` (v6 installed, `ToolLoopAgent` wired).
> **Enables:** every persona — tools are *what an agent can do*.
> **Owns:** the tool taxonomy (3 tiers + escape), the generators (`toolsFromOpenAPI`, `skillsToTools`), the persona→tools composition rule, and the substrate-pheromone tie-in for tool selection.

Plan: never hand-write a tool you can derive. Five hand-written core tools, the rest generated from spec or discovered over MCP. The substrate learns which work.

**Principle:** a tool exists only if **one of three** is true — (1) capability the LLM can't do alone, (2) shape stable enough to type, (3) round-trip cost cheaper than inlining the prompt. Everything else stays in instructions.

**Mode:** lean. Spec locked (5 core tools, 2 generators, 1 escape), variance known, exit scalar (`tools.length` per persona is bounded; `bun run build` green; pheromone deposits on `(persona, tool)` paths after 50 real calls).

---

## The decision rule

Before writing a tool, run three checks. If all three fail, it goes in `instructions`, not in `tools`.

| Check | Pass means |
|---|---|
| **Capability** | LLM can't produce this from training — fresh data, side effect, identity, money |
| **Shape** | Inputs and outputs survive `z.object(...)` without `z.unknown()` everywhere |
| **Cost** | A tool call is cheaper than the alternative (stuffing 50KB of context, manual user step) |

Failing all three = prompt-engineering, not tooling. Don't dilute the surface.

---

## The three tiers

```
┌─────────────────────────────────────────────────────────────────────┐
│ Tier 1 — hand-written core           5 tools, forever               │
│   browse · search · scrape · recall · delegate                      │
├─────────────────────────────────────────────────────────────────────┤
│ Tier 2 — generated from spec         N tools, derived               │
│   toolsFromOpenAPI(spec)   ← Stripe, GitHub, api.one.ie             │
│   skillsToTools(agentMd)   ← agents/*.md → paid skills              │
├─────────────────────────────────────────────────────────────────────┤
│ Tier 3 — MCP-discovered              ∞ tools, on demand             │
│   createMCPClient({ url }).tools()                                  │
├─────────────────────────────────────────────────────────────────────┤
│ Escape — httpRequest                 1 tool, gated                  │
│   for the long tail; needsApproval on writes & non-allowlisted GET  │
└─────────────────────────────────────────────────────────────────────┘
```

You never hand-write "the Stripe tool" or "the Slack tool." Either OpenAPI generates it, MCP delivers it, or `httpRequest` covers the one-off.

---

## Tier 1 — the 5 core tools

These cover the substrate-shaped capabilities every persona needs. Hand-written, stable, total ~150 LOC.

```ts
// claw/src/aitools.ts
import { tool } from 'ai'
import { z } from 'zod'
import { ONE } from '@oneie/sdk'
import type { Env } from './types'

export const coreTools = (env: Env, one: ONE) => ({
  // ── capability ────────────────────────────────────────────────────
  browse: tool({
    description: 'Fetch a URL and return readable text. Use for "what does this page say".',
    inputSchema: z.object({ url: z.string().url() }),
    strict: true,
    execute: async ({ url }) => readability(await fetch(url).then(r => r.text())),
  }),

  search: tool({
    description: 'Web search. Returns ranked URLs. Use to discover; then browse or scrape.',
    inputSchema: z.object({ query: z.string(), topN: z.number().default(5) }),
    strict: true,
    execute: async ({ query, topN }) => searchProvider(env, query, topN),  // xai.webSearch / firecrawl
  }),

  scrape: tool({
    description: 'Extract typed data from a URL against a JSON Schema.',
    inputSchema: z.object({
      url: z.string().url(),
      schema: z.record(z.unknown()),     // JSON Schema; or use a named schema registry
    }),
    strict: true,
    execute: async ({ url, schema }) => extractStructured(env, url, schema),
  }),

  // ── substrate ─────────────────────────────────────────────────────
  recall: tool({
    description: 'Retrieve stored knowledge by query, reranked for relevance.',
    inputSchema: z.object({ query: z.string(), topN: z.number().default(3) }),
    strict: true,
    execute: async ({ query, topN }, { callOptions }) => one.recall({ query, topN, group: callOptions.group }),
  }),

  delegate: tool({
    description: 'Hand off to a specialist for a skill you don\'t have.',
    inputSchema: z.object({ skill: z.string(), brief: z.string() }),
    strict: true,
    execute: async ({ skill, brief }, { callOptions }) => {
      const { agents } = await one.discover({ skill })
      return one.ask({ receiver: `${agents[0].uid}:${skill}`, data: { brief, group: callOptions.group } })
    },
  }),
})
```

**What's NOT here, on purpose:**
- `mark`, `warn` — middleware deposits these from `usage` + `finishReason`. Agents never call them.
- `remember` — conversation-close hook captures stable facts. The model doesn't decide what to remember.
- `highways`, `discover` — internal to `delegate`. The model never reads raw paths.
- `crawl` — multi-page traversal is its own `ToolLoopAgent` with `stopWhen: stepCountIs(20)` and a budget. Not a tool call.

---

## Tier 2 — generated from spec

For typed APIs you depend on (Stripe, GitHub, `api.one.ie`) and for our own `agents/*.md`. Two generators, both ~80 LOC.

### `toolsFromOpenAPI` — every typed REST API is free tools

```ts
// claw/src/openapi-to-tools.ts
import { tool } from 'ai'
import { jsonSchemaToZod } from './schema'

export async function toolsFromOpenAPI(opts: {
  spec: string                                          // URL or file path
  baseUrl: string
  auth: { type: 'bearer'; token: string } | { type: 'header'; name: string; value: string }
  include?: string[]                                    // 'POST /v1/payment_intents'
  needsApproval?: (op: { method: string; path: string }) => boolean
}) {
  const spec = await fetch(opts.spec).then(r => r.json())
  const tools: Record<string, ReturnType<typeof tool>> = {}

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods as Record<string, OpenAPIOp>)) {
      const id = `${method.toUpperCase()} ${path}`
      if (opts.include && !opts.include.includes(id)) continue

      const name = op.operationId ?? slug(id)
      tools[name] = tool({
        description: op.summary ?? op.description ?? id,
        inputSchema: jsonSchemaToZod(op.requestBody?.content?.['application/json']?.schema ?? {}),
        strict: true,
        needsApproval: opts.needsApproval?.({ method, path }) ?? method !== 'get',
        inputExamples: op.examples?.slice(0, 2),       // few-shot for free
        execute: async (input) => callRest(opts.baseUrl, method, path, input, opts.auth),
      })
    }
  }
  return tools
}
```

Usage:

```ts
const stripeTools = await toolsFromOpenAPI({
  spec: 'https://stripe.com/openapi.json',
  baseUrl: 'https://api.stripe.com',
  auth: { type: 'bearer', token: env.STRIPE_KEY },
  include: ['POST /v1/payment_intents', 'GET /v1/customers/{id}'],
  needsApproval: (op) => op.method !== 'get',          // writes need user gate
})
```

200 endpoints become 2 tools (filtered) with typed schemas, descriptions, examples, and approval gates — all from one spec URL.

### `skillsToTools` — markdown is also a spec

`agents/<name>.md` is our own OpenAPI. Skills declared in frontmatter become tools.

```ts
// claw/src/skills-to-tools.ts (≈ aisdk.md Seam 1)
import { tool } from 'ai'
import { ONE, type AgentSpec } from '@oneie/sdk'

export function skillsToTools(spec: AgentSpec, one: ONE) {
  return Object.fromEntries(spec.skills.map(s => [s.name, tool({
    description: `${s.tags.join(', ')}${s.price > 0 ? ` (costs $${s.price})` : ''}`,
    inputSchema: s.schema,
    strict: true,
    needsApproval: s.price > 0,                        // paid ⇒ user gate
    execute: async (input, { callOptions }) => {
      if (s.price > 0) await one.payRequest({ to: spec.uid, skill: s.name, amount: s.price })
      return one.ask({ receiver: `${spec.uid}:${s.name}`, data: input })
    },
  })]))
}
```

Free skills = no approval. Paid skills = approval triggers the v6 `addToolApprovalResponse` UI which renders "Pay $0.05 → strategize". One markdown change → both substrate route AND LLM tool re-derive.

---

## Tier 3 — MCP discovery

Already specified in [`aisdk.md` § MCP integration](aisdk.md#mcp-integration-stable-in-v6). Lean on it. Every serious SaaS will publish an MCP server; consume them, don't wrap them.

```ts
// claw/src/mcp-tools.ts
import { createMCPClient } from '@ai-sdk/mcp'

export async function mcpTools(env: Env, urls: string[]) {
  const tools: Record<string, unknown> = {}
  for (const url of urls) {
    const client = await createMCPClient({
      transport: { type: 'http', url, headers: { Authorization: `Bearer ${env.MCP_KEY}` } },
    })
    Object.assign(tools, await client.tools())
  }
  return tools
}
```

Operator-time config: `MCP_SERVERS=https://linear.mcp.so,https://slack.mcp.so` and Linear + Slack tools appear with no code change.

---

## Escape — `httpRequest`

For the long tail (one-off internal API, prototype, weird vendor with no spec and no MCP). One tool, infinite reach, gated by allowlist + approval.

```ts
httpRequest: tool({
  description: 'Make an HTTP request. Use only when no typed tool covers this endpoint.',
  inputSchema: z.object({
    method: z.enum(['GET','POST','PUT','PATCH','DELETE']),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    body: z.unknown().optional(),
  }),
  strict: true,
  needsApproval: ({ method, url }) => method !== 'GET' || !isAllowlisted(url),
  execute: async ({ method, url, headers, body }) => {
    const r = await fetch(url, { method, headers, body: body && JSON.stringify(body) })
    const text = await r.text()
    return { status: r.status, body: tryParseJson(text) }
  },
}),
```

Most personas don't get this — only "ops" / "research" personas. The allowlist (`isAllowlisted`) is per-deployment. Don't pretend an LLM with arbitrary HTTP isn't a security surface — name it as one and gate it.

---

## Persona → tools composition

Each `agents/<name>.md` declares which tiers it gets. The builder composes.

```ts
// claw/src/agents/builder.ts
import { ToolLoopAgent, gateway, stepCountIs } from 'ai'
import { coreTools, toolsFromOpenAPI, skillsToTools, mcpTools, httpRequest } from '../aitools'

export async function buildAgent(env: Env, spec: AgentSpec, one: ONE) {
  const tools = {
    ...coreTools(env, one),                                          // tier 1 — always
    ...skillsToTools(spec, one),                                     // tier 2 — markdown
    ...(spec.openapi  ? await toolsFromOpenAPI(spec.openapi) : {}),  // tier 2 — REST
    ...(spec.mcp      ? await mcpTools(env, spec.mcp) : {}),         // tier 3 — MCP
    ...(spec.escape   ? { httpRequest } : {}),                       // escape — gated
  }
  return new ToolLoopAgent({
    model: gateway(spec.model),
    instructions: spec.systemPrompt,
    tools,
    stopWhen: stepCountIs(spec.maxSteps ?? 5),
  })
}
```

Examples:

| Persona | `agents/<name>.md` declares | Resulting `tools` |
|---|---|---|
| `ceo` | skills only | core + ceo skills |
| `support` | `mcp: [linear, zendesk]` | core + mcp(linear, zendesk) |
| `ops` | `escape: true, mcp: [github, k8s]` | core + httpRequest + mcp(github, k8s) |
| `billing` | `openapi: { spec: '...stripe...', include: [...] }` | core + stripe(2 ops) |
| `research` | `escape: true` | core + httpRequest |

---

## Tool selection at scale

When `tools.length > 30` (typical with MCP + OpenAPI), the model starts mis-picking. Two mitigations, both in v6:

| Primitive | When | Effect |
|---|---|---|
| `anthropic.tools.toolSearchBm25_20251119` | `tools.length > 30` | Tool-of-tools — model searches its own catalog |
| `inputExamples: [{ input: ... }]` | every generated tool | Few-shot per tool, lifted from OpenAPI examples |

Above ~100 tools: split the persona. One agent with 100 tools is a worse architecture than two specialists with 50 each, talking via `delegate`.

---

## Substrate tie-in — pheromone selects winners

Every tool call deposits on the path `(persona, tool, outcome)` via the substrate middleware ([`aisdk.md` § Seam 2](aisdk.md#seam-2--oneiesdk-4-outcomes--v6-finish-states)).

```
ceo  ──[mark 1.0]─→  scrape         (succeeded on stripe.com)
ceo  ──[warn 1.0]─→  scrape         (failed on cloudflare-walled site)
ceo  ──[mark 1.4]─→  delegate       (high cache hit + clean handoff)
```

After ~50 calls per tool, `follow()` over those paths predicts:
- Which tools work for this persona → keep on persona's allowed list
- Which tools fail repeatedly → resistance accumulates → drop from list
- Which (tool, target) pairs work → e.g. `scrape:stripe.com` strong, `scrape:facebook.com` toxic

The substrate becomes a **tool selection oracle for free**. No separate analytics. Just Rule 1 (closed loop) applied to tool calls.

This is the bet: 200 mediocre-but-real generated tools beat 20 hand-crafted perfect ones, *because the substrate learns which subset works per persona over time.* Without that learning, generation is just bloat.

---

## Verify (lean gate)

```bash
cd claw
bun run build                                                # must succeed
bunx tsc --noEmit                                            # zero errors

# Tier 1 — 5 tools present
bun -e "import('./src/aitools').then(m => console.log(Object.keys(m.coreTools({}, {})).length === 5))"

# Tier 2 — generators importable
bun -e "import('./src/openapi-to-tools').then(m => console.log('toolsFromOpenAPI' in m))"
bun -e "import('./src/skills-to-tools').then(m => console.log('skillsToTools' in m))"

# Tier 3 — MCP wired (already verified in aisdk.md)

# Smoke — one tool call per tier closes its loop
curl -N -X POST http://localhost:8787/message?stream=1 \
  -H "Authorization: Bearer $CLAW_KEY" -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"browse https://example.com then recall"}'
# expect: tool-call(browse) → tool-result → tool-call(recall) → tool-result → text-delta → finish
# expect: pheromone deposit visible in TypeDB on (test, browse) and (test, recall)
```

**Rubric (≥ 0.65):**
- **fit** — 5 core tools shipped; both generators present; MCP composes; httpRequest gated; persona builder composes by tier.
- **form** — no hand-written tool for any service that ships an OpenAPI spec or MCP server; no tool wraps `mark`/`warn`/`remember`; tools live in `aitools.ts` + tier-specific files.
- **truth** — build + tsc clean; tool calls deposit pheromone; approval round-trip works on paid skills; allowlist blocks non-allowlisted writes via `httpRequest`.
- **taste** — persona's tool count is bounded by markdown declarations, not by the codebase; descriptions match the spec, not invented; few-shot examples present on every generated tool.

---

## Don't

- Don't hand-write a tool for any service that publishes an OpenAPI spec or MCP server. Generate or discover.
- Don't expose `mark`, `warn`, `remember`, `highways`, `discover` as tools. Substrate-internal.
- Don't add a tool because "the model might want it." Run the 3-check rule first.
- Don't ship `httpRequest` to every persona — it's an escape hatch, not a default.
- Don't ship `httpRequest` without an allowlist + approval gate. Arbitrary HTTP is a security surface.
- Don't let a persona accumulate >30 tools without `toolSearchBm25` + `inputExamples`. Mis-picking compounds.
- Don't let a persona accumulate >100 tools, period. Split the persona; talk via `delegate`.
- Don't write tool descriptions that duplicate the schema. Describe *when to use it*, not *what it takes*.
- Don't define tools inline in the agent constructor. They live in `aitools.ts` (tier 1), `openapi-to-tools.ts` (tier 2 REST), `skills-to-tools.ts` (tier 2 substrate), `mcp-tools.ts` (tier 3).

---

## Shape

```
agents/<name>.md  ──┬──→ skillsToTools()      ←─ tier 2 (substrate)
                    ├──→ toolsFromOpenAPI()   ←─ tier 2 (REST, optional)
                    ├──→ mcpTools()           ←─ tier 3 (optional)
                    └──→ { httpRequest }      ←─ escape (optional)
                                  +
                          coreTools()         ←─ tier 1 (always)
                                  ▼
                          ToolLoopAgent({ tools })
                                  ▼
                  every tool.execute() closes the loop
                  substrate middleware deposits mark/warn
                  pheromone selects winners over time
```

5 hand-written. N generated. ∞ discovered. 1 escape. Substrate learns which work.

---

## See also

- [`aisdk.md`](aisdk.md) — v6 install, `ToolLoopAgent`, middleware, MCP plumbing
- [`ai-elements.md`](ai-elements.md) — how `tool-{name}` parts render in the UI
- [`mcp.md`](mcp.md) — our own MCP server (publishes substrate tools to external clients)
- [`agents/CLAUDE.md`](../agents/CLAUDE.md) — markdown contract that drives tier 2 generation
- [`.claude/rules/engine.md`](../.claude/rules/engine.md) — Rule 1 (closed loop) is what makes pheromone-based tool selection possible

---

*Five core. The rest derive. Substrate picks the winners.*

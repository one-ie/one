# aisdk

> **Position:** layer 2 of 4 — [`integrate`](integrate.md) → `aisdk` → [`ai-elements`](ai-elements.md) → [`mcp`](mcp.md)
> **Prereq:** `integrate.md` (claw + web wired, env-var seam in place)
> **Enables:** `ai-elements.md` (renders `message.parts`), `mcp.md` (rides on `@ai-sdk/mcp`)
> **Owns:** the wire protocol — `ToolLoopAgent` ↔ `useChat`, `tool()`, `Output.object()`, AI Gateway. Anything else links here.
> **Version:** AI SDK **v6** (Feb 2026). v5-shaped code is migrated via `npx @ai-sdk/codemod upgrade v6`.

Plan: install **every Vercel AI SDK v6 feature** (https://ai-sdk.dev) cleanly across `claw/` (server) + `web/` (client) — one install pass, one agent matrix, zero drift.

**Principle:** AI SDK v6 owns the LLM call, the agent loop, and the wire protocol. We own the substrate (`mark`, `warn`, `recall`, `highways`) and surface it as `tool()` definitions consumed by a `ToolLoopAgent`. Web's `useChat` and claw's agent stream speak the same protocol via `createAgentUIStreamResponse` — zero custom SSE plumbing.

**Mode:** lean. Spec locked (v6 vendor surface), variance known (one SDK, one protocol), exit scalar (every v6 primitive importable + `bun run build` green on both packages + DevTools renders a real call), files known.

---

## Prereqs (verify before install)

| Requirement | Repo state | Action |
|---|---|---|
| Node 18+ | ✅ (bun) | none |
| TypeScript ≥ 5 | ✅ | none |
| React 19 (web only) | ✅ `^19.1.0` | none |
| Zod ≥ 3.25 (Standard JSON Schema V1) | ❌ not in `claw/`/`web/` | add (`zod`) |
| `claw/` package | ✅ Hono on CF Workers | adds `ai` v6 + providers + `@ai-sdk/mcp` + `@ai-sdk/devtools` |
| `web/` package | ✅ Astro 6 + React 19 | adds `@ai-sdk/react` v6 |
| `OPENROUTER_API_KEY` env | ✅ in `claw/.dev.vars` | optional once Gateway is wired |
| `AI_GATEWAY_API_KEY` env | ❌ | add — Gateway is the default provider in v6 |
| Provider keys (Anthropic / OpenAI / Google / xAI) | optional | only if using provider-specific tools direct |

---

## Wave 1 — Install (lean default)

```bash
# claw (server) — v6 core + Gateway + MCP stable + DevTools + Groq direct
cd claw
bun add ai@^6 zod @ai-sdk/groq @ai-sdk/mcp @ai-sdk/devtools

# web (client) — v6 React hooks
cd ../web
bun add ai@^6 @ai-sdk/react@^6 zod
```

`ai@^6` includes the **AI Gateway** provider built-in (`import { gateway } from 'ai'`) and the `ToolLoopAgent` class. `@ai-sdk/openai-compatible` is no longer the default path — Gateway covers ~all text models in one key.

**Gate:** `bun run build` green in both packages. `ai` major must match across packages (v6 ↔ v6). DevTools dashboard at `npx @ai-sdk/devtools` (port 4983) renders at least one real call from claw.

**Add on demand** — only when a persona's `model` field or a specific provider tool is used:

| Provider package | When to add |
|---|---|
| `@ai-sdk/anthropic` | `memory_20250818`, `codeExecution_20250825`, `toolSearchBm25_20251119`, `toolSearchRegex_20251119` |
| `@ai-sdk/openai` | `openai.tools.shell()`, `openai.tools.applyPatch()`, `openai.tools.mcp()` |
| `@ai-sdk/google` | `googleMaps()`, `vertexRagStore()`, `fileSearch()` |
| `@ai-sdk/xai` | `webSearch()`, `xSearch()`, `viewImage()`, `viewXVideo()`, `codeExecution()` |
| `@ai-sdk/cohere` `@ai-sdk/amazon-bedrock` `@ai-sdk/togetherai` | `rerank()` providers |
| `@ai-sdk/black-forest-labs` `@ai-sdk/replicate` `@ai-sdk/fal` | `generateImage` (incl. v6 image editing with reference images) |
| `@ai-sdk/elevenlabs` `@ai-sdk/deepgram` | `generateSpeech` / `transcribe` |
| `@ai-sdk/azure` `@ai-sdk/google-vertex` | enterprise model routing |
| `@ai-sdk/langchain` | `toBaseMessages()`, `toUIMessageStream()`, `LangSmithDeploymentTransport` |

---

## Wave 2 — v6 feature inventory (full surface)

Everything v6 ships. Each row is something we'll wire (✅), expose-when-needed (⚪), or skip (❌). The shipped runtime is `claw/`; the consumer is `web/`.

### Agent layer (new in v6)

| Primitive | Use | Wire? |
|---|---|---|
| `ToolLoopAgent` | one persona = one agent: model + instructions + tools + `stopWhen` | ✅ — replaces inline `streamText` config |
| `Agent` interface | custom agent shapes (peer agents, scoped agents) | ⚪ — wire when peer pattern lands |
| `callOptionsSchema` + `prepareCall` | type-safe per-call args (group, channel, userId) | ✅ — every claw agent receives `{ group, channel }` |
| `stopWhen: stepCountIs(n)` | bound multi-step loops | ✅ — default 5, raise per persona |
| `output: Output.object/array/choice/json/text` | structured output INSIDE agent loop | ✅ — replaces standalone `generateObject` for classify/outcome |
| `createAgentUIStreamResponse({ agent, uiMessages })` | server → SSE for `useChat` | ✅ — Astro proxy returns this |
| `InferAgentUIMessage<typeof agent>` | client message type derived from server agent | ✅ — `web/src/types/chat.ts` re-exports |

### Generation primitives

| Primitive | Use | Wire? |
|---|---|---|
| `generateText` / `streamText` | direct LLM calls outside an agent | ⚪ — kept for one-shots; agents preferred |
| `generateObject` / `streamObject` | structured output without agent loop | ⚪ — superseded by `Output.*` inside `ToolLoopAgent` |
| `embed` / `embedMany` | vector embeddings | ✅ — memory recall index |
| `rerank()` (new) | re-rank N candidates against a query | ✅ — `recall` tool's execute pipes through `rerank({ model: cohere.reranking('rerank-v3.5'), … })` |
| `generateImage` (stable in v6) | image gen + editing with reference images | ⚪ — feature surface |
| `transcribe` / `generateSpeech` | audio | ⚪ — voice surface |

### Tools (v6 enhancements)

| Primitive | Use | Wire? |
|---|---|---|
| `tool({ inputSchema, execute })` | base case | ✅ |
| `needsApproval: true \| (input) => boolean` | human-in-the-loop before `execute` | ✅ — `mark`, `warn`, `remember` substrate writes |
| `strict: true` | provider-native strict schema validation | ✅ — all substrate tools |
| `inputExamples: [{ input: … }]` | few-shot examples per tool | ✅ — improves classify/discover |
| `toModelOutput({ input, output, toolCallId })` | what the model sees vs what UI sees | ✅ — keep substrate IDs out of prompt context |
| `providerOptions: { anthropic: { allowedCallers: [...] } }` | restrict tool to specific caller (e.g. `code_execution_20250825`) | ⚪ |
| `addToolApprovalResponse({ id, approved })` (client) | approval UI plumbing | ✅ — wired in `<Chat>` |

### Provider-specific tools (free capabilities)

| Provider | Tools | Wire? |
|---|---|---|
| `anthropic.tools.memory_20250818` | per-conversation FS-shaped memory | ⚪ — overlaps with our `remember`/`recall`; pick one |
| `anthropic.tools.codeExecution_20250825` | sandboxed code | ⚪ |
| `anthropic.tools.toolSearchBm25_20251119` / `toolSearchRegex_20251119` | tool discovery for large tool sets | ⚪ — wire when `clawTools` > 30 |
| `openai.tools.shell` / `applyPatch` / `mcp` | shell + patch + MCP-as-tool | ⚪ |
| `google.tools.googleMaps` / `vertexRagStore` / `fileSearch` | grounding | ⚪ |
| `xai.tools.webSearch` / `xSearch` / `codeExecution` / `viewImage` / `viewXVideo` | xAI-native grounding | ⚪ |

### MCP (stable in v6 — `@ai-sdk/mcp`)

| Primitive | Use | Wire? |
|---|---|---|
| `createMCPClient({ transport: { type: 'http', url, authProvider } })` | connect to MCP server | ✅ — connects to our `mcp/` package |
| `auth(authProvider, { serverUrl })` | OAuth flow | ⚪ — when MCP servers require auth |
| `client.tools()` | MCP tools as AI SDK tools | ✅ — merged into `clawTools()` |
| `client.listResources()` / `readResource({ uri })` | MCP resources | ⚪ |
| `client.experimental_listPrompts()` / `experimental_getPrompt(...)` | MCP prompt templates | ⚪ |
| `client.onElicitationRequest(...)` | server asks user input mid-call | ⚪ — wire when first MCP tool needs it |

### Middleware + observability

| Primitive | Use | Wire? |
|---|---|---|
| `wrapLanguageModel({ model, middleware })` | compose middlewares | ✅ |
| `devToolsMiddleware()` from `@ai-sdk/devtools` | inputs/outputs/tools/tokens/timing UI | ✅ — `claw/src/middleware.ts` (dev only) |
| custom `LanguageModelV2Middleware` | caching, redaction, guardrails | ✅ — substrate `mark`/`warn` middleware (every call closes a path) |
| `experimental_telemetry` | OTel spans | ⚪ — once OTel collector exists |
| `rawFinishReason` | provider-specific stop reason | ✅ — fed into substrate `warn` weight |
| `usage.inputTokenDetails.{noCache,cacheRead,cacheWrite}Tokens` | cache visibility | ✅ — pheromone deposit weighted by cache-hit |
| `usage.outputTokenDetails.{text,reasoning}Tokens` | reasoning token cost | ✅ — reported in `/close` rubric |
| Standard JSON Schema V1 | use Zod, ArkType, Valibot, Effect Schema interchangeably | ⚪ — Zod stays default |

### React hooks (`@ai-sdk/react` v6)

| Primitive | Use | Wire? |
|---|---|---|
| `useChat<MyAgentMessage>()` | message list + stream + approval | ✅ |
| `useCompletion` | single-turn | ⚪ |
| `useObject` | `streamObject` consumer | ⚪ |
| `DefaultChatTransport` | pluggable transport | ✅ |
| `addToolApprovalResponse` | approve/deny tool from UI | ✅ |
| `LangSmithDeploymentTransport` from `@ai-sdk/langchain` | LangGraph backend | ❌ |

### Errors + types

| Primitive | Use |
|---|---|
| `APICallError`, `InvalidPromptError`, `NoSuchToolError`, `ToolExecutionError` | typed catches |
| `LanguageModel`, `UIMessage`, `ModelMessage`, `Agent`, `AgentEvent` | wire types |
| `InferAgentUIMessage` | client-side message inference |

---

## Wave 3 — Wire to repo

Each row is one PR-shaped slice. Substrate-write rows include `needsApproval` + closed-loop `mark`/`warn`.

| Surface | v6 feature | File |
|---|---|---|
| Persona = agent (one per `agents/*.md`) | `ToolLoopAgent` + `callOptionsSchema` + `prepareCall` | `claw/src/agents/*.ts` (new) |
| LLM call (replace raw `fetch`) | `gateway()` provider + `agent.stream()` | `claw/src/index.ts` |
| Substrate tools | `tool()` map with `needsApproval` + `strict` + `inputExamples` + `toModelOutput` | `claw/src/aitools.ts` (replaces `tools.ts`) |
| Multi-step loops | `stopWhen: stepCountIs(5)` per persona | `claw/src/agents/*.ts` |
| Per-turn classification | `Output.choice({ options: […] })` inside agent loop | replaces `claw/src/classify.ts` |
| Outcome detection | `Output.object({ schema })` inside agent loop | folded into `claw/src/pipeline.ts` |
| Memory recall ranking | `embed` + `embedMany` + `rerank({ model: cohere.reranking('rerank-v3.5') })` | `claw/src/substrate.ts` `recall` execute |
| Substrate middleware | `wrapLanguageModel` + custom middleware that emits `mark`/`warn` per call | `claw/src/middleware.ts` (new) |
| Dev observability | `devToolsMiddleware()` (dev only) | `claw/src/middleware.ts` |
| Telemetry to substrate | `usage.inputTokenDetails.cacheRead` → path strength multiplier; `rawFinishReason` → `warn` weight | `claw/src/middleware.ts` |
| MCP integration | `createMCPClient` + `client.tools()` merged into `clawTools()` | `claw/src/aitools.ts` |
| Chat UI | `useChat<InferAgentUIMessage<typeof agent>>` + `DefaultChatTransport` | `web/src/components/Chat.tsx` |
| Approval UI | `part.state === 'approval-requested'` + `addToolApprovalResponse` | `web/src/components/Chat.tsx` |
| SSE proxy | passthrough of `createAgentUIStreamResponse` body | `web/src/pages/api/chat.ts` |
| Unify webhook handlers (telegram + discord behind `handle()`) | shared `runAgent()` helper | `web/src/pages/api/webhook/{telegram,discord}.ts`, new `web/src/lib/handler.ts` |
| Drop type-cast carnival | `getEnv(): Promise<Env>`, `loadAgent(env: Env)` | `web/src/lib/{cf-env,agent}.ts` |
| Generative UI cards | `<Tool>` from ai-elements rendering `tool-{name}` parts | per `ai-elements.md` |
| Streaming structured tasks (web) | `useObject` + `streamObject` (only when not inside an agent) | per-feature route |
| Voice → text input | `transcribe` (Deepgram / OpenAI) | `claw/src/voice.ts` (new, optional) |
| Image surface | `generateImage` with reference images for inpaint/outpaint | per-feature route, optional |

**Substrate convention:** every tool's `execute` closes the loop — `mark` on success, `warn` on failure — per `.claude/rules/engine.md` Rule 1. Substrate-write tools (`mark`, `warn`, `remember`) carry `needsApproval`, which gives the user explicit veto over pheromone deposits.

---

## Wave 4 — Verify

Deterministic gates (numbers, no vibes):

```bash
# claw
cd claw
bun run build                                          # must succeed
bunx tsc --noEmit                                      # zero errors
bun -e "import('ai').then(m => console.log(['ToolLoopAgent','Output','rerank','gateway','wrapLanguageModel','createAgentUIStreamResponse'].every(k => k in m)))"
# expect: true
bun -e "import('@ai-sdk/mcp').then(m => console.log(['createMCPClient','auth'].every(k => k in m)))"
bun -e "import('@ai-sdk/devtools').then(m => console.log('devToolsMiddleware' in m))"

# web
cd ../web
bun run build
bunx tsc --noEmit
bun -e "import('@ai-sdk/react').then(m => console.log(['useChat','useCompletion','useObject','addToolApprovalResponse'].every(k => k in m)))"

# end-to-end stream + approval round-trip
curl -N -X POST http://localhost:8787/message?stream=1 \
  -H "Authorization: Bearer $CLAW_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"remember key=foo value=bar"}'
# expect: text-delta + tool-approval-requested(remember) + (approve via second call) + tool-result + text-delta + finish

# DevTools
npx @ai-sdk/devtools                                   # opens http://localhost:4983
# expect: at least one call with input/output/tools/usage visible
```

**Rubric (≥ 0.65 to ship):**
- **fit** — `ToolLoopAgent`, `tool({ needsApproval })`, `Output.*`, `useChat<InferAgentUIMessage>`, `createAgentUIStreamResponse`, `rerank`, `createMCPClient`, `devToolsMiddleware`, `gateway` all wired; ≥ 1 provider per modality used
- **form** — no raw `fetch` to model APIs in `claw/`; no SSE parsing in `web/`; tools live in `aitools.ts`; one agent per persona file
- **truth** — `bun run build` + `tsc` clean both sides; health curl streams real deltas; approval round-trip works; DevTools shows real calls; substrate middleware deposits pheromone per call
- **taste** — `pickModel()` collapses to `gateway(modelId)`; provider-specific tools added per persona need, not "just in case"; substrate writes always carry `needsApproval`; cache/reasoning token details fed back into pheromone weights

---

## Don't

- Don't pin `ai` to different majors across `claw/` and `web/` — protocol drift breaks the stream. Both v6.
- Don't install every provider package "just in case" — `gateway` covers ~all text models with one key. Add direct providers only for provider-specific tools (Anthropic memory, OpenAI shell, Google Maps, xAI search) or when AI Gateway routing isn't desired.
- Don't write inline `streamText` calls when an agent already exists — every persona is a `ToolLoopAgent`.
- Don't define tools inline in the agent constructor — keep in `aitools.ts` for testability and reuse.
- Don't expose any provider key (or `AI_GATEWAY_API_KEY`) to the browser — `web/` only ever talks to `claw/`.
- Don't wrap `useChat` in a context provider unless you need cross-component shared state.
- Don't render tool results as raw JSON — one ai-elements `<Tool>` per `tool-{name}` part.
- Don't skip `needsApproval` on substrate writes — Rule 1 (closed loop) requires explicit close, and approval IS the close for irreversible deposits.
- Don't use `generateObject` standalone when you can use `Output.object({ schema })` inside an agent — keeps the loop unified.
- Don't migrate v5 code by hand — run `npx @ai-sdk/codemod upgrade v6` first, then fix what's left.

---

## Shape

```
web (useChat<InferAgentUIMessage>)  ──Agent UI Stream──  claw (ToolLoopAgent.stream())  ──gateway──  Anthropic / OpenAI / Google / Groq / xAI / …
        │                                                       │
        │ addToolApprovalResponse                                ├── tool.execute() runs in-worker (substrate.mark, browser.fetch, …)
        ▼                                                       │
   approval UI                                                   ├── needsApproval pauses execute → emits 'approval-requested' part
                                                                 │
                                                                 ├── wrapLanguageModel: substrateMiddleware → mark/warn from finishReason+usage
                                                                 │
                                                                 └── (dev) devToolsMiddleware → http://localhost:4983
```

Three packages on the server, two on the client:
- `ai@^6` — `ToolLoopAgent`, `tool`, `Output`, `gateway`, `wrapLanguageModel`, `createAgentUIStreamResponse`, `rerank`, `embed`, `generateImage`, …
- `@ai-sdk/mcp` — `createMCPClient`, `auth`
- `@ai-sdk/devtools` — `devToolsMiddleware`
- `@ai-sdk/react@^6` (web) — `useChat`, `addToolApprovalResponse`
- one or more provider packages on demand.

Protocol is the **AI SDK Agent UI Stream** — text deltas + tool calls + approval requests + tool results + custom data + structured output, all on one SSE connection.

---

## claw — `ToolLoopAgent` per persona

```ts
// claw/src/agents/builder.ts — generic factory; one file per persona is fine too
import { ToolLoopAgent, Output, stepCountIs, gateway } from 'ai'
import { z } from 'zod'
import { clawTools } from '../aitools'
import type { Env } from '../types'

export function makeAgent(env: Env, persona: Persona) {
  return new ToolLoopAgent({
    model: gateway(persona.model),                  // 'anthropic/claude-haiku-4-5', 'groq/llama-3-70b', etc.
    instructions: persona.systemPrompt,
    tools: clawTools(env),                          // group/channel come from callOptions, not closure
    stopWhen: stepCountIs(persona.maxSteps ?? 5),
    callOptionsSchema: z.object({
      group: z.string(),
      channel: z.enum(['web', 'telegram', 'discord', 'api']),
      userId: z.string().optional(),
    }),
    prepareCall: ({ options, instructions, ...rest }) => ({
      ...rest,
      instructions: `${instructions}\n\n[context] group=${options.group} channel=${options.channel}`,
    }),
    output: persona.expectsStructured ? Output.object({ schema: persona.outputSchema }) : Output.text(),
  })
}
```

Replaces the raw `fetch` to OpenRouter in `claw/src/index.ts`. The agent is constructed once per request (or cached per persona) and `.stream({ prompt, options })` is called.

```ts
// claw/src/index.ts (excerpt)
import { createAgentUIStreamResponse } from 'ai'

const agent = makeAgent(env, await loadPersona(env, group))
return createAgentUIStreamResponse({
  agent,
  uiMessages,                                       // request body
  options: { group, channel, userId },              // typed via callOptionsSchema
})
```

That's the entire LLM call. No `TransformStream`, no `[DONE]` parsing, no JSON accumulator, no tool dispatch switch.

---

## Tools as first-class (v6 — approval, strict, examples, toModelOutput)

```ts
// claw/src/aitools.ts
import { tool } from 'ai'
import { z } from 'zod'
import { browser } from './browser'
import {
  highways, mark, query, rememberHypothesis, suggestRoute, warn,
} from './substrate'
import type { Env } from './types'

export const clawTools = (env: Env) => ({
  browse: tool({
    description: 'Fetch a URL, return title + summary + key facts. Cached 5 min.',
    inputSchema: z.object({ url: z.string().url() }),
    strict: true,
    inputExamples: [{ input: { url: 'https://example.com' } }],
    execute: async ({ url }) => browser.fetch(url, env.KV),
  }),

  remember: tool({
    description: 'Store a fact about this conversation in long-term memory',
    inputSchema: z.object({ key: z.string(), value: z.string() }),
    strict: true,
    needsApproval: true,                            // substrate write — user gates it
    execute: async ({ key, value }, { callOptions }) => {
      const group = callOptions.group
      await env.KV.put(`knowledge:${group}:${key}`, value).catch(() => {})
      rememberHypothesis(env, group, key, value)
      return { stored: key }
    },
    toModelOutput: ({ output }) => ({ type: 'text', value: `stored ${output.stored}` }),
  }),

  recall: tool({
    description: 'Retrieve stored knowledge by query, reranked for relevance',
    inputSchema: z.object({ query: z.string(), topN: z.number().default(3) }),
    strict: true,
    execute: async ({ query: q, topN }, { callOptions }) => {
      const group = callOptions.group
      const candidates = await query(env, /* substrate hypothesis lookup */)
      // v6 rerank — Cohere/Bedrock/Together
      const { rerankedDocuments } = await rerankCandidates(env, q, candidates, topN)
      return { query: q, results: rerankedDocuments }
    },
  }),

  highways: tool({
    description: 'Get the most-traveled paths in the substrate',
    inputSchema: z.object({ limit: z.number().default(5) }),
    strict: true,
    execute: async ({ limit }) => ({ highways: await highways(env, limit) }),
  }),

  mark: tool({
    description: 'Strengthen a path (after a successful collaboration)',
    inputSchema: z.object({ target: z.string(), strength: z.number().default(1) }),
    strict: true,
    needsApproval: true,
    execute: async ({ target, strength }, { callOptions }) => {
      await mark(env, `claw:${callOptions.group}`, target, strength)
      return { marked: target }
    },
  }),

  warn: tool({
    description: 'Add resistance to a path (after a failed collaboration)',
    inputSchema: z.object({ target: z.string(), strength: z.number().default(1) }),
    strict: true,
    needsApproval: true,
    execute: async ({ target, strength }, { callOptions }) => {
      await warn(env, `claw:${callOptions.group}`, target, strength)
      return { warned: target }
    },
  }),

  discover: tool({
    description: 'Find units in the substrate that offer a capability',
    inputSchema: z.object({ skill: z.string() }),
    strict: true,
    execute: async ({ skill }, { callOptions }) =>
      ({ skill, units: await suggestRoute(env, `claw:${callOptions.group}`, skill) }),
  }),
})
```

Same logic as today's `claw/src/tools.ts`; v6 adds approval, strict validation, examples, and a clean separation between what the model sees (`toModelOutput`) and what the UI sees (`execute` return).

---

## Substrate middleware — every call deposits pheromone

```ts
// claw/src/middleware.ts
import { wrapLanguageModel, type LanguageModelV2Middleware } from 'ai'
import { devToolsMiddleware } from '@ai-sdk/devtools'
import { mark, warn } from './substrate'

export const substrateMiddleware = (env: Env, group: string): LanguageModelV2Middleware => ({
  wrapGenerate: async ({ doGenerate, params }) => {
    const result = await doGenerate()
    const cacheRatio = (result.usage.inputTokenDetails?.cacheReadTokens ?? 0) /
                       Math.max(1, result.usage.inputTokens)
    if (result.finishReason === 'stop') {
      await mark(env, `claw:${group}`, `model:${params.model}`, 1 + cacheRatio)
    } else if (result.finishReason === 'error') {
      await warn(env, `claw:${group}`, `model:${params.model}`, 1)
    }
    return result
  },
  wrapStream: async ({ doStream, params }) => doStream(),  // similar treatment
})

export const wrappedModel = (env: Env, modelId: string, group: string) =>
  wrapLanguageModel({
    model: gateway(modelId),
    middleware: env.MODE === 'development'
      ? [substrateMiddleware(env, group), devToolsMiddleware()]
      : [substrateMiddleware(env, group)],
  })
```

Cache hits → stronger pheromone (the model+route just paid less for the same outcome). Errors → resistance. Reasoning token volume → `/close` rubric input. Calendar time stays out of the substrate (Rule 2).

---

## MCP integration (stable in v6)

```ts
// claw/src/aitools.ts (additions)
import { createMCPClient } from '@ai-sdk/mcp'

export async function clawToolsWithMCP(env: Env) {
  const tools = clawTools(env)
  if (!env.MCP_SERVERS) return tools

  for (const url of env.MCP_SERVERS.split(',')) {
    const client = await createMCPClient({
      transport: { type: 'http', url, headers: { Authorization: `Bearer ${env.MCP_KEY}` } },
    })
    Object.assign(tools, await client.tools())
  }
  return tools
}
```

Connects directly to our `mcp/` package (which is the MCP server publishing substrate tools to external clients). Round-trip: claw is both an MCP host (consuming external MCP tools) and a peer of our own `mcp/` server (which publishes the same substrate tools to Claude Desktop / Cursor).

OAuth, resources, prompts, and elicitation are wired only when an MCP server requires them — see Wave 2 inventory.

---

## web — `useChat` + approval

```tsx
// web/src/components/Chat.tsx
'use client'
import { useChat, addToolApprovalResponse } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { InferAgentUIMessage } from 'ai'
import { useState } from 'react'
import { Tool } from '@/components/ai-elements/tool'
import type { agent as personaAgent } from '@/server-types/agent'

export type ChatMessage = InferAgentUIMessage<typeof personaAgent>

export function Chat({ group }: { group: string }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { group } }),
  })

  return (
    <div className="flex flex-col gap-2">
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.parts.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.text}</span>
            if (part.type.startsWith('tool-')) {
              if (part.state === 'approval-requested') {
                return (
                  <div key={i} className="bg-foreground border p-3 rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-sm">Approve <code>{part.type}</code>?</p>
                    <pre className="text-xs text-font/60">{JSON.stringify(part.input, null, 2)}</pre>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="bg-primary text-on-primary rounded-lg px-3 py-1.5 text-sm"
                        onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: true })}>
                        Approve
                      </button>
                      <button
                        className="bg-foreground border rounded-lg px-3 py-1.5 text-sm"
                        style={{ borderColor: 'var(--color-border)' }}
                        onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: false })}>
                        Deny
                      </button>
                    </div>
                  </div>
                )
              }
              return <Tool key={i} part={part} />
            }
            return null
          })}
        </div>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage({ text: input }); setInput('') }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-background border rounded-lg px-3.5 py-2.5"
          style={{ borderColor: 'var(--color-border)' }}
        />
      </form>
    </div>
  )
}
```

Astro endpoint stays a thin proxy:

```ts
// web/src/pages/api/chat.ts
import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  return fetch(`${env.CLAW_URL}/message?stream=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CLAW_KEY}` },
    body: request.body,
    duplex: 'half',
  })
}
```

Streaming end to end: tokens render as they type, tool calls render as cards as they fire, approval prompts pause the stream until the user decides, tool results stream back inline.

---

## `Output.*` for structured tasks (replaces standalone `generateObject`)

Inside an agent loop:

```ts
new ToolLoopAgent({
  model: gateway('groq/llama-3-70b'),
  instructions: 'Classify the user message.',
  output: Output.object({
    schema: z.object({
      intent: z.enum(['greeting', 'question', 'request', 'feedback']),
      urgency: z.enum(['low', 'medium', 'high']),
      tags: z.array(z.string()),
    }),
  }),
  stopWhen: stepCountIs(1),
})
```

Or for one-of-N choice:

```ts
output: Output.choice({
  options: [
    { value: 'route-to-billing', description: 'Payment, refunds, invoices' },
    { value: 'route-to-support', description: 'Bugs, errors, how-to' },
    { value: 'route-to-sales', description: 'Pricing, plans, demos' },
  ],
})
```

Replaces `claw/src/classify.ts` keyword regex when LLM quality is needed. Faster than streamText (one shot in the loop), Zod-validated, ~100ms on Groq.

---

## Provider swap is one line (Gateway-first)

Same agent, different model — Gateway routes for free:

```ts
new ToolLoopAgent({ model: gateway('anthropic/claude-haiku-4-5'), … })
new ToolLoopAgent({ model: gateway('google/gemini-2.5-flash'), … })
new ToolLoopAgent({ model: gateway('xai/grok-4'), … })
new ToolLoopAgent({ model: gateway('groq/llama-3-70b'), … })
```

Provider-direct only when the persona needs provider-specific tools or the user has direct keys. The persona's `model` field is the only thing that changes.

---

## Federation hook (Mode B)

In cloud mode, point at `api.one.ie` (which is Gateway-shaped):

```ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
const oneRouter = createOpenAICompatible({
  baseURL: 'https://api.one.ie/v1',
  apiKey: env.ONE_API_KEY,
  name: 'one',
})
new ToolLoopAgent({ model: oneRouter('haiku-4-5'), … })
```

Same agent code, claw routes through one.ie's model fleet — cached, rate-pooled, billable. Mode A keeps using `gateway()` directly. Switch via env, no fork.

---

## Seam with `@oneie/sdk` (the agents SDK)

AI SDK v6 and `@oneie/sdk` are **orthogonal layers** that share one source of truth (`agents/*.md`) and meet at four seams. Neither wraps the other; they compose.

### Shared source — one markdown, two consumers

```yaml
# agents/ceo.md
name: ceo
model: anthropic/claude-sonnet-4-5      # ← AI SDK reads (gateway model id)
skills:                                  # ← @oneie/sdk reads (paid capabilities → TypeDB)
  - { name: strategize, price: 0.05, tags: [leadership] }
sensitivity: 0.8
---
You are the CEO...                       # ← AI SDK reads (instructions)
```

`@oneie/sdk`'s `parse()` + `syncAgent()` writes the unit + skills + memberships to TypeDB. The AI SDK builder reads `model` + body + `skills` to construct a `ToolLoopAgent`. **One file, two consumers, zero duplication.** Change the markdown, both layers re-derive.

### Seam 1 — Skills ↔ Tools

A markdown skill is simultaneously a **paid substrate capability** AND a v6 `tool()`:

```ts
// claw/src/agents/builder.ts
import { ToolLoopAgent, tool, gateway, stepCountIs } from 'ai'
import { ONE, type AgentSpec } from '@oneie/sdk'
import { clawTools } from '../aitools'

function skillsToTools(spec: AgentSpec, one: ONE) {
  return Object.fromEntries(spec.skills.map((s) => [s.name, tool({
    description: s.tags.join(', '),
    inputSchema: s.schema,
    strict: true,
    needsApproval: s.price > 0,                              // paid skill ⇒ user gate
    execute: async (input, { callOptions }) => {
      if (s.price > 0) await one.payRequest({ to: spec.uid, skill: s.name, amount: s.price })
      return one.ask({ receiver: `${spec.uid}:${s.name}`, data: input })
    },
  })]))
}

export function buildAgent(env: Env, spec: AgentSpec) {
  const one = new ONE({ baseUrl: env.ONE_URL, apiKey: env.ONE_API_KEY })
  return new ToolLoopAgent({
    model: gateway(spec.model),
    instructions: spec.systemPrompt,
    tools: { ...clawTools(env), ...skillsToTools(spec, one) },
    stopWhen: stepCountIs(spec.maxSteps ?? 5),
  })
}
```

`tool.execute` becomes `one.ask()`. AI SDK runs the LLM loop; `@oneie/sdk` runs substrate routing. Free skills = no approval; paid skills = approval gate triggers `addToolApprovalResponse` UI.

### Seam 2 — `@oneie/sdk` 4 outcomes ↔ v6 finish states

`Outcome<T>` from `@oneie/sdk/types` maps directly to v6 stream events. The substrate middleware (Wave 3 row "substrate middleware") owns the mapping — agent authors never write `mark`/`warn` by hand:

| `@oneie/sdk` outcome | v6 signal | Close |
|---|---|---|
| `{ kind: 'result' }` | `finishReason: 'stop'` + tool result | `one.mark(edge, 1 + cacheReadRatio)` |
| `{ kind: 'timeout' }` | `AbortError` / stream timeout | neutral |
| `{ kind: 'dissolved' }` | `NoSuchToolError` / missing receiver | `one.warn(edge, 0.5)` |
| `{ kind: 'failure' }` | `ToolExecutionError` / `finishReason: 'error'` | `one.warn(edge, 1)` |

```ts
// claw/src/middleware.ts (excerpt)
import { wrapLanguageModel, NoSuchToolError, ToolExecutionError, type LanguageModelV2Middleware } from 'ai'
import { ONE } from '@oneie/sdk'

export const substrateMiddleware = (one: ONE, group: string): LanguageModelV2Middleware => ({
  wrapGenerate: async ({ doGenerate, params }) => {
    try {
      const r = await doGenerate()
      const cacheBoost = (r.usage.inputTokenDetails?.cacheReadTokens ?? 0)
                       / Math.max(1, r.usage.inputTokens)
      if (r.finishReason === 'stop')       await one.mark({ from: `claw:${group}`, to: `model:${params.model}`, strength: 1 + cacheBoost })
      else if (r.finishReason === 'error') await one.warn({ from: `claw:${group}`, to: `model:${params.model}`, strength: 1 })
      return r
    } catch (e) {
      if (e instanceof NoSuchToolError)        await one.warn({ from: `claw:${group}`, to: `model:${params.model}`, strength: 0.5 })
      else if (e instanceof ToolExecutionError) await one.warn({ from: `claw:${group}`, to: `model:${params.model}`, strength: 1 })
      throw e
    }
  },
})
```

**Rule 1 (closed loop) is enforced by the integration itself.** No agent author writes substrate code; pheromone deposits automatically from `usage` + `finishReason`.

### Seam 3 — Multi-agent handoff via `one.discover` + `one.ask`

Agent-to-agent delegation rides v6's tool loop. The CEO calls `delegate`; the substrate decides who:

```ts
delegate: tool({
  description: 'Hand off to a specialist for a skill you don\'t have',
  inputSchema: z.object({ skill: z.string(), brief: z.string() }),
  strict: true,
  execute: async ({ skill, brief }, { callOptions }) => {
    const { agents } = await one.discover({ skill })          // @oneie/sdk
    const best = agents[0]
    return one.ask({ receiver: `${best.uid}:${skill}`, data: { brief, fromGroup: callOptions.group } })
  },
})
```

The CEO's `ToolLoopAgent` decides *whether* to delegate. `@oneie/sdk` decides *who* via `follow()` over highest-strength path. The receiving agent is its own `ToolLoopAgent` on its own claw worker. Two LLM loops, one substrate path that strengthens with every successful handoff.

### Seam 4 — Payment via `one.pay*` + `needsApproval`

The user gate (v6) and the money (`@oneie/sdk`) align on the same primitive:

```ts
hire: tool({
  description: 'Hire a specialist. Costs SUI from your wallet.',
  inputSchema: z.object({ skillId: z.string(), price: z.number() }),
  strict: true,
  needsApproval: ({ price }) => price > 0,                    // v6: user clicks "Pay $X"
  execute: async ({ skillId, price }, { callOptions }) => {
    const escrow = await one.payRequest({ skill: skillId, amount: price })
    const out = await one.ask({ receiver: skillId, data: callOptions })
    if (out.kind === 'result') await one.payAccept(escrow.id)
    return out
  },
})
```

UI shows **Pay $0.05 → strategize**. Approve → `payRequest` opens escrow. `result` → `payAccept` settles. `failure` → escrow auto-refunds. **AI SDK owns the gate; `@oneie/sdk` owns the money.**

### The whole picture

```
agents/<name>.md  ────┬──── parse() ──────────────────────────────────────────┐
                      │                                                       │
                      ├──→ @oneie/sdk      TypeDB unit + skills + paths       │
                      │       │                                               │
                      │   one.ask()                                           │
                      │   one.pay*()       ←── tool.execute calls these       │
                      │   one.discover()                                      │
                      │   one.mark/warn    ←── substrateMiddleware closes     │
                      │                                                       │
                      └──→ AI SDK v6       ToolLoopAgent (model + system + tools)
                              │                                               │
                          createAgentUIStreamResponse ─── SSE ───→ useChat<InferAgentUIMessage>
                                                                       │
                                                                       ├── tool-{name} parts → <Tool>
                                                                       ├── approval-requested → Pay $X / Approve
                                                                       └── text-delta
```

### Why it's seamless

1. **No abstraction tax** — neither SDK wraps the other. Each owns its layer cleanly.
2. **Markdown is the contract** — change `agents/<name>.md`, both layers re-derive.
3. **Outcomes align by design** — `@oneie/sdk`'s 4 outcomes mirror v6's `finishReason` + error taxonomy.
4. **Approval IS the close-loop gate** — Rule 1 says every signal closes; v6 says paid/destructive tools approve. Same gate, two protocols.
5. **Pheromone is free** — substrate middleware deposits `mark`/`warn` from `usage` + `finishReason`. Agents never write substrate code; they write `tool()` calls.

The glue is one file: `claw/src/agents/builder.ts` (~50 lines) reads markdown, builds the `ToolLoopAgent`, and wires substrate middleware. Two SDKs that don't otherwise know about each other.

See [`one/sdk.md`](sdk.md#composition-with-ai-sdk-v6) for the inverse view (substrate-first), and [`agents/CLAUDE.md`](../agents/CLAUDE.md) for the markdown contract that both layers consume.

---

## Migration from today's claw (v5-shape → v6)

```bash
cd claw
npx @ai-sdk/codemod upgrade v6        # automated where possible
```

| Today (v5-shaped or pre-SDK) | After v6 |
|---|---|
| `fetch` to OpenRouter, manual JSON parsing | `agent.stream({ prompt, options })` |
| `tools` array as raw JSON Schema, dispatched via `executeTool` switch | `tool({ inputSchema, strict, needsApproval, execute, toModelOutput })` map |
| Manual `TransformStream` to parse SSE deltas | `createAgentUIStreamResponse({ agent, uiMessages, options })` |
| Tool calls accumulated mid-stream then executed in `flush` | Tools execute inline; `needsApproval` pauses for user |
| Multi-step (browse → think → reply) requires queue | `stopWhen: stepCountIs(N)` in `ToolLoopAgent` |
| Web parses SSE manually | `useChat<InferAgentUIMessage>` |
| Standalone `generateObject` for classify/outcome | `output: Output.object/choice` inside agent |
| No telemetry / observability | `devToolsMiddleware()` + extended `usage` token breakdown |
| MCP — would need custom client | `createMCPClient({ transport: { type: 'http' } })` |
| Memory recall = string match | `embed` + `rerank({ model: cohere.reranking('rerank-v3.5') })` |

Net change in `claw/`: `src/index.ts` shrinks ~80 lines, `src/tools.ts` becomes `src/aitools.ts` (~120 lines, fully typed + approval-aware), `src/classify.ts` folds into a per-persona `output` field, new `src/middleware.ts` (substrate + devtools), new `src/agents/*.ts` (one per persona). Net deps: `+ai@^6`, `+@ai-sdk/groq`, `+@ai-sdk/mcp`, `+@ai-sdk/devtools`, `+zod`. ~120 kB.

---

## Health check

See [`integrate.md` § Health checks](integrate.md#health-checks-canonical--referenced-by-aisdkmd--mcpmd) — case 3 (streaming round-trip) covers this layer end-to-end. v6 additions:
- case 3a: tool-approval round-trip (request → approve → execute → result)
- case 3b: Gateway provider returns usage with `inputTokenDetails.cacheReadTokens > 0` after second call
- case 3c: DevTools (`localhost:4983`) shows the call

---

*ToolLoopAgent decides. tool.execute does (after approval). useChat shows. rerank ranks. Gateway routes. DevTools watches. Six primitives, one protocol, zero plumbing.*

# aisdk

> **Position:** layer 2 of 4 — [`integrate`](integrate.md) → `aisdk` → [`ai-elements`](ai-elements.md) → [`mcp`](mcp.md)
> **Prereq:** `integrate.md` (claw + web wired, env-var seam in place)
> **Enables:** `ai-elements.md` (renders `messages.parts`), `mcp.md` (rides on `tool()` + `streamText`)
> **Owns:** the wire protocol — `streamText` ↔ `useChat`, `tool()`, `generateObject`. Anything else links here.

Plan: install **every Vercel AI SDK feature** (https://ai-sdk.dev) cleanly across `claw/` (server) + `web/` (client) — one install pass, one provider matrix, zero drift.

**Principle:** AI SDK owns the LLM call and the wire protocol. We own the substrate (`mark`, `warn`, `recall`) and surface it as `tool()` definitions. Web's `useChat` and claw's `streamText` speak the same protocol — zero custom SSE plumbing.

**Mode:** lean. Spec locked (vendor surface), variance known (one SDK, one protocol), exit scalar (every primitive importable + `bun run build` green on both packages), files known.

---

## Prereqs (verify before install)

| Requirement | Repo state | Action |
|---|---|---|
| Node 18+ | ✅ (bun) | none |
| TypeScript ≥ 5 | ✅ | none |
| React 19 (web only) | ✅ `^19.1.0` | none |
| Zod | ❌ not in `claw/`/`web/` | add (`zod`) |
| `claw/` package | ✅ Hono on CF Workers | adds `ai` + providers |
| `web/` package | ✅ Astro 6 + React 19 | adds `@ai-sdk/react` |
| `OPENROUTER_API_KEY` env | ✅ in `claw/.dev.vars` | none |
| Groq / Anthropic / Google keys | optional | add per provider used |

---

## Wave 1 — Install (lean default)

Install only what's wired today. Everything else is a one-line `bun add` when a persona's `model` field needs it.

```bash
# claw (server)
cd claw
bun add ai zod @ai-sdk/openai-compatible @ai-sdk/groq

# web (client)
cd ../web
bun add ai @ai-sdk/react zod
```

**Gate:** `bun run build` green in both `claw/` and `web/`. No version skew (`ai` major must match across packages).

**Add on demand** (one per persona, not "just in case"):

| Provider package | When to add |
|---|---|
| `@ai-sdk/openai` | direct OpenAI keys (not via OpenRouter) |
| `@ai-sdk/anthropic` | direct Anthropic keys; computer-use tool |
| `@ai-sdk/google` | Gemini direct |
| `@ai-sdk/mistral` `@ai-sdk/xai` `@ai-sdk/cohere` `@ai-sdk/deepseek` `@ai-sdk/perplexity` `@ai-sdk/fireworks` `@ai-sdk/togetherai` | direct keys for that vendor |
| `@ai-sdk/replicate` `@ai-sdk/fal` | `generateImage` |
| `@ai-sdk/elevenlabs` `@ai-sdk/deepgram` | `generateSpeech` / `transcribe` |
| `@ai-sdk/azure` `@ai-sdk/amazon-bedrock` `@ai-sdk/google-vertex` | enterprise model routing |

OpenRouter (via `openai-compatible`) covers ~all text models in one key today — start there.

---

## Wave 2 — Feature inventory (what becomes available)

All exports from `ai` + `@ai-sdk/react` after W1:

**Generation primitives (server, `ai`):**
- `streamText` — token stream + tool calls
- `generateText` — one-shot text
- `streamObject` — partial structured output
- `generateObject` — one-shot Zod-typed object
- `embed`, `embedMany` — vector embeddings
- `generateImage` — image gen (fal, replicate, openai)
- `transcribe` — audio → text (deepgram, elevenlabs, openai)
- `generateSpeech` — text → audio (elevenlabs, openai)

**Tooling:**
- `tool()` — Zod-schema'd tool definition with server `execute`
- `stepCountIs`, `hasToolCall` — multi-step stop conditions
- `experimental_createMCPClient` — MCP tools as AI SDK tools
- Provider-defined tools (e.g. Anthropic computer-use, OpenAI web-search)

**Streaming + protocol:**
- `result.toUIMessageStreamResponse()` — SSE for `useChat`
- `result.toDataStreamResponse()` — raw data stream
- `createUIMessageStream`, `createDataStreamResponse` — custom streams
- `smoothStream` — token smoothing transform

**Middleware + observability:**
- `wrapLanguageModel` + `LanguageModelV2Middleware` — caching, logging, redaction, guardrails
- `experimental_telemetry` — OpenTelemetry spans
- Provider registry (`createProviderRegistry`) — model id namespace per provider

**React hooks (`@ai-sdk/react`):**
- `useChat` — message list + stream
- `useCompletion` — single-turn completion stream
- `useObject` — `streamObject` consumer
- `DefaultChatTransport` — pluggable transport

**Errors + types:**
- `APICallError`, `InvalidPromptError`, `NoSuchToolError`, `ToolExecutionError` — typed catches
- `LanguageModel`, `UIMessage`, `ModelMessage` — wire types

---

## Wave 3 — Wire to repo

Surfaces, mapped to features above. Each row is one PR-shaped slice.

| Surface | Feature | File |
|---|---|---|
| LLM call (replace raw fetch) | `streamText` + provider swap | `claw/src/index.ts` |
| Substrate tools | `tool()` map (8 tools) | `claw/src/aitools.ts` (new) |
| Multi-step (browse → think → reply) | `stopWhen: stepCountIs(5)` | `claw/src/index.ts` |
| Per-turn classification (replace `classify.ts`) | `generateObject` + Zod | `claw/src/classify.ts` |
| Outcome detection | `generateObject` | `claw/src/pipeline.ts` |
| Memory recall ranking | `embed` + `embedMany` | `claw/src/substrate.ts` |
| Caching / logging / redaction | `wrapLanguageModel` middleware | `claw/src/middleware.ts` (new) |
| Telemetry | `experimental_telemetry` → OTel | `claw/src/index.ts` |
| MCP tools (consume `mcp/`) | `experimental_createMCPClient` | `claw/src/aitools.ts` |
| Chat UI | `useChat` + `DefaultChatTransport` | `web/src/components/Chat.tsx` |
| SSE proxy | `toUIMessageStreamResponse()` passthrough | `web/src/pages/api/chat.ts` |
| Generative UI cards | `<ToolCard>` per `tool-*` part | `web/src/components/ToolCard.tsx` (new) |
| Streaming structured tasks (web) | `useObject` + `streamObject` | per-feature route |
| Voice → text input | `transcribe` (Deepgram) | `claw/src/voice.ts` (new, optional) |
| Image gen surface | `generateImage` (fal) | per-feature route, optional |

**Substrate convention:** every tool's `execute` closes the loop — `mark` on success, `warn` on failure — per `.claude/rules/engine.md`.

(Code-level integration shape preserved below in **Shape** through **Health check** sections.)

---

## Wave 4 — Verify

Deterministic gates (numbers, no vibes):

```bash
# claw
cd claw
bun run build                      # must succeed
bunx tsc --noEmit                  # zero errors
bun -e "import('ai').then(m => console.log(Object.keys(m).length))"  # ≥ 30 exports

# web
cd ../web
bun run build
bunx tsc --noEmit
bun -e "import('@ai-sdk/react').then(m => console.log(Object.keys(m)))"  # includes useChat, useCompletion, useObject

# end-to-end stream
curl -N -X POST http://localhost:8787/message?stream=1 \
  -H "Authorization: Bearer $CLAW_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"browse https://example.com"}'
# expect: text-delta + tool-call(browse) + tool-result + text-delta + finish
```

**Rubric (≥ 0.65 to ship):**
- **fit** — `streamText`, `tool()`, `useChat`, `generateObject` all wired; ≥ 1 provider per modality (text, embed, image if used, audio if used)
- **form** — no raw `fetch` to model APIs anywhere in `claw/`; no SSE parsing in `web/`
- **truth** — `bun run build` + `tsc` clean both sides; health curl streams real deltas
- **taste** — tools live in `aitools.ts` (not inline); provider keys never reach browser; one `pickModel()` switch, not provider branches scattered

---

## Don't

- Don't pin `ai` to different majors across `claw/` and `web/` — protocol drift breaks the stream
- Don't install every provider package "just in case" — add as the persona's `model` field needs them; the W1 list is a max, not a min
- Don't bypass `streamText` for a quick prompt — use `generateText` from the same package
- Don't define tools inline in `streamText({ tools: { … } })` — keep in `aitools.ts` for testability and reuse
- Don't expose any provider key to the browser — `web/` only ever talks to `claw/`
- Don't wrap `useChat` in a context provider unless you need cross-component shared state
- Don't render tool results as raw JSON — one `<ToolCard>` per `toolName`, that's the protocol's whole point

---

## Shape

```
web (useChat)  ────SDK Data Stream────  claw (streamText + tools)  ────  OpenRouter / Groq / Anthropic
                                          │
                                          └── tool.execute() runs in-worker
                                              (substrate.mark, browser.fetch, …)
```

Two packages:
- **`ai`** (server) — `streamText`, `generateText`, `generateObject`, `tool()`. Lives in `claw/`.
- **`@ai-sdk/react`** (client) — `useChat`, `useObject`. Lives in `web/`.

Plus a provider:
- `@ai-sdk/openai-compatible` for OpenRouter (since OpenRouter is OpenAI-shaped)
- `@ai-sdk/groq` for Groq direct (when model id starts with `groq/`)

Protocol between them is the **AI SDK Data Stream** — text deltas + tool calls + tool results + custom data, all on one SSE connection.

---

## claw — `streamText` + tools

Replace the raw `fetch` to OpenRouter in `src/index.ts`:

```ts
import { streamText, tool, stepCountIs } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'

function pickModel(modelId: string, env: Env) {
  if (modelId.startsWith('groq/')) {
    return groq(modelId.slice(5))
  }
  return createOpenAICompatible({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: env.OPENROUTER_API_KEY,
    name: 'openrouter',
  })(modelId)
}

const result = streamText({
  model: pickModel(context.model, env),
  system: systemPromptWithPack(context.systemPrompt, pack),
  messages: chatMessages,
  tools: clawTools(env, group),     // see below
  stopWhen: stepCountIs(5),         // multi-step: tools → think → tools → reply
})

return result.toUIMessageStreamResponse()
```

That's the entire LLM call. No `TransformStream`, no `[DONE]` parsing, no JSON accumulator.

---

## Tools as first-class

The eight substrate tools become `tool()` definitions with **Zod schemas** and **server-side execute**:

```ts
// src/aitools.ts
import { tool } from 'ai'
import { z } from 'zod'
import { browser } from './browser'
import {
  highways, mark, query, rememberHypothesis, suggestRoute, warn,
} from './substrate'
import type { Env } from './types'

export const clawTools = (env: Env, group: string) => {
  const selfId = `claw:${group}`
  return {
    browse: tool({
      description: 'Fetch a URL, return title + summary + key facts. Cached 5 min.',
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => browser.fetch(url, env.KV),
    }),

    remember: tool({
      description: 'Store a fact about this conversation in long-term memory',
      inputSchema: z.object({ key: z.string(), value: z.string() }),
      execute: async ({ key, value }) => {
        await env.KV.put(`knowledge:${group}:${key}`, value).catch(() => {})
        rememberHypothesis(env, group, key, value)
        return { stored: key }
      },
    }),

    recall: tool({
      description: 'Retrieve stored knowledge by query',
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query: q }) => {
        const local = await env.KV.get(`knowledge:${group}:${q}`)
        if (local) return { key: q, value: local, source: 'local' }
        const rows = await query(env, `match $h isa hypothesis, has statement $s; $s contains "${q}"; select $s; limit 5;`)
        return { query: q, results: rows, source: 'substrate' }
      },
    }),

    highways: tool({
      description: 'Get the most-traveled paths in the substrate',
      inputSchema: z.object({ limit: z.number().default(5) }),
      execute: async ({ limit }) => ({ highways: await highways(env, limit) }),
    }),

    mark: tool({
      description: 'Strengthen a path (after a successful collaboration)',
      inputSchema: z.object({ target: z.string(), strength: z.number().default(1) }),
      execute: async ({ target, strength }) => {
        await mark(env, selfId, target, strength)
        return { marked: target }
      },
    }),

    warn: tool({
      description: 'Add resistance to a path (after a failed collaboration)',
      inputSchema: z.object({ target: z.string(), strength: z.number().default(1) }),
      execute: async ({ target, strength }) => {
        await warn(env, selfId, target, strength)
        return { warned: target }
      },
    }),

    discover: tool({
      description: 'Find units in the substrate that offer a capability',
      inputSchema: z.object({ skill: z.string() }),
      execute: async ({ skill }) => ({ skill, units: await suggestRoute(env, selfId, skill) }),
    }),
  }
}
```

Compare to today's `tools.ts`: same logic, half the lines, fully type-safe inputs, results auto-serialized into the stream.

---

## web — `useChat`

```tsx
// web/src/components/Chat.tsx
'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export function Chat({ group }: { group: string }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { group },
    }),
  })

  return (
    <div className="flex flex-col gap-2">
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.parts.map((p, i) => {
            if (p.type === 'text') return <span key={i}>{p.text}</span>
            if (p.type.startsWith('tool-')) return <ToolCard key={i} part={p} />
            return null
          })}
        </div>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage({ text: input }); setInput('') }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
    </div>
  )
}
```

Astro endpoint is a thin proxy to claw:

```ts
// web/src/pages/api/chat.ts
import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  return fetch(`${env.CLAW_URL}/message?stream=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.CLAW_KEY}`,
    },
    body: request.body,
    duplex: 'half',
  })
}
```

Streaming end to end: tokens render as the LLM types, tool calls render as cards as they fire, tool results stream back inline.

---

## Generative UI

Render tool parts via the canonical `<Tool>` element from [`ai-elements`](ai-elements.md), switching on `part.type` (`tool-browse`, `tool-remember`, …). One component, every tool. Don't redefine `<ToolCard>` here — it lives in ai-elements once.

---

## `generateObject` for structured tasks

Bring back classification / extraction / labeling with zero custom JSON parsing:

```ts
import { generateObject } from 'ai'

const { object } = await generateObject({
  model: pickModel('groq/meta-llama/llama-4-scout-17b-16e-instruct', env),
  schema: z.object({
    intent: z.enum(['greeting', 'question', 'request', 'feedback']),
    urgency: z.enum(['low', 'medium', 'high']),
    tags: z.array(z.string()),
  }),
  prompt: `Classify: ${userMessage}`,
})
// object is fully typed. Use object.intent, object.tags directly.
```

Faster than streamText (one shot), Zod-validated, ~100ms on Groq. Use for: per-turn classification (replace `classify.ts` keyword regex when you want LLM quality), structured outcome detection, anything that needs typed JSON.

---

## Provider swap is one line

Same `streamText` call, different model:

```ts
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { mistral } from '@ai-sdk/mistral'

streamText({ model: anthropic('claude-haiku-4-5'), … })
streamText({ model: google('gemini-2.5-flash'), … })
streamText({ model: mistral('mistral-large-latest'), … })
```

Tools, streaming, schemas — identical. The persona's `model` field becomes the only thing that changes.

---

## Federation hook (Mode B)

In cloud mode, point the OpenAI-compatible provider at `api.one.ie`:

```ts
const oneRouter = createOpenAICompatible({
  baseURL: 'https://api.one.ie/v1',
  apiKey: env.ONE_API_KEY,
  name: 'one',
})
```

Same code, claw routes through one.ie's model fleet — cached, rate-pooled, billable. Mode A keeps using OpenRouter directly. Switch via env, no fork.

---

## Migration from today's claw

| Today | After AI SDK |
|---|---|
| `fetch` to OpenRouter, manual JSON parsing | `streamText({ model, … })` |
| `tools` array as raw JSON Schema, dispatched via `executeTool` switch | `tool({ inputSchema: z.object(…), execute })` map |
| Manual `TransformStream` to parse SSE deltas | `result.toUIMessageStreamResponse()` |
| Tool calls accumulated mid-stream then executed in `flush` | Tools execute inline, results stream back automatically |
| Multi-step (browse → think → reply) requires queue | `stopWhen: stepCountIs(N)` |
| Web parses SSE manually | `useChat` |

Net change in claw: `src/index.ts` shrinks ~80 lines. `src/tools.ts` shrinks to a `tool()` map (~100 lines vs 137). Adds `src/aitools.ts` or replaces `tools.ts`. Net deps: `+ai`, `+@ai-sdk/openai-compatible`, `+@ai-sdk/groq`, `+zod`. ~80 kB.

---

## What not to do

- **Don't bypass `streamText` for "just a quick prompt"** — pick `generateText` from the same package. Same provider, same API, no streaming. Don't drop back to raw fetch.
- **Don't define tools inline inside `streamText`** if you can avoid it — keep them in `aitools.ts` so they're testable in isolation and reusable across endpoints.
- **Don't expose `OPENROUTER_API_KEY` to the browser** — claw owns the key. Web only ever talks to claw.
- **Don't wrap `useChat` in a context provider** unless you need shared state across components — it's already self-contained per chat instance.
- **Don't render tool results as raw JSON** — define a `<ToolCard>` per tool name. That's the whole point of the protocol.

---

## Health check

See [`integrate.md` § Health checks](integrate.md#health-checks-canonical--referenced-by-aisdkmd--mcpmd) — case 3 (streaming round-trip) covers this layer end-to-end.

---

*streamText thinks. tool.execute does. useChat shows. Three primitives, one protocol, zero plumbing.*

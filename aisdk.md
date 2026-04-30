# aisdk

How the [Vercel AI SDK](https://ai-sdk.dev) integrates into `claw` (server) and `web` (client). Substrate-aware tools, end-to-end streaming, generative UI, one-line provider swap.

**Principle:** AI SDK owns the LLM call and the wire protocol. We own the substrate (`mark`, `warn`, `recall`) and surface it as `tool()` definitions. Web's `useChat` and claw's `streamText` speak the same protocol — zero custom SSE plumbing.

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

Tools can return structured data; web renders custom components per tool name.

```tsx
function ToolCard({ part }: { part: { type: string; output?: unknown } }) {
  if (part.type === 'tool-browse' && part.output) {
    const r = part.output as { title: string; summary: string; facts: string[] }
    return (
      <div className="border rounded p-3 my-2">
        <div className="text-sm text-muted-foreground">browsed</div>
        <div className="font-semibold">{r.title}</div>
        <div className="text-sm">{r.summary}</div>
        <ul className="text-xs">{r.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </div>
    )
  }
  if (part.type === 'tool-remember') return <div className="text-xs">📌 remembered</div>
  if (part.type === 'tool-mark')     return <div className="text-xs">✓ path strengthened</div>
  if (part.type === 'tool-highways' && part.output) {
    const r = part.output as { highways: { from: string; to: string; strength: number }[] }
    return <HighwayMap edges={r.highways} />     // ReactFlow island
  }
  return null
}
```

The chat surface stops being "text in, text out" and becomes a substrate viewer. Memory cards. Tool execution cards. Live highway maps. Same API, generative output.

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

```bash
# Streaming endpoint returns SSE
curl -N -X POST https://claw.<acct>.workers.dev/message?stream=1 \
  -H 'Authorization: Bearer <CLAW_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"browse https://example.com and tell me what it says"}'
```

Should stream:
```
data: {"type":"text-start","id":"msg_…"}
data: {"type":"text-delta","id":"msg_…","textDelta":"Let"}
…
data: {"type":"tool-call","toolCallId":"…","toolName":"browse","input":{"url":"https://example.com"}}
data: {"type":"tool-result","toolCallId":"…","output":{"title":"Example Domain",…}}
data: {"type":"text-delta",…}
data: {"type":"finish","finishReason":"stop"}
```

You're integrated.

---

*streamText thinks. tool.execute does. useChat shows. Three primitives, one protocol, zero plumbing.*

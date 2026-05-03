import type { APIRoute } from 'astro'
import { createGroq } from '@ai-sdk/groq'
import { createWorkersAI } from 'workers-ai-provider'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { getCfCtx, getEnv } from '../../lib/cf-env'

export const prerender = false

const SYSTEM = `You are ONE — a helpful, concise assistant for the ONE substrate.
Be direct. Use markdown. When a user asks about ONE, explain that it's a signal-based AI substrate where agents earn paths through verified outcomes.

When tools are independent, call them in parallel.`

const SSE_HEADERS = {
  'X-Accel-Buffering': 'no',
  'Cache-Control': 'no-cache, no-transform',
  'Content-Encoding': 'identity',
}

const STARTER_PROMPTS = new Set([
  'What is ONE?',
  'Show me the signal highways',
  'How do I sell a skill?',
  'How do I buy?',
  'Explain how pheromone routing works',
  'Walk me through a signal step by step',
  'Show a TypeScript ONE signal handler',
  'Show the schema for a path entity',
  'List the agent files in this repo',
  'Where does ONE store knowledge?',
])

type KVLike = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

export const GET: APIRoute = () => new Response(null, { status: 204 })

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as unknown as {
    GROQ_API_KEY?: string
    AI?: unknown
    CHAT_CACHE?: KVLike
  }
  const groqApiKey = env.GROQ_API_KEY
  if (!groqApiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { messages?: UIMessage[]; group?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 })
  }

  const messages = body.messages ?? []
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 })
  }

  const lastText =
    messages
      .at(-1)
      ?.parts?.find((p): p is { type: 'text'; text: string } => p.type === 'text')
      ?.text?.trim() ?? ''

  // T3-P11: KV edge-cache for starter prompts
  const cache = STARTER_PROMPTS.has(lastText) ? env.CHAT_CACHE : undefined
  const cacheKey = cache ? `v1:${lastText}` : null
  if (cache && cacheKey) {
    const cached = await cache.get(cacheKey)
    if (cached) {
      return new Response(cached, {
        headers: { ...SSE_HEADERS, 'Content-Type': 'text/event-stream; charset=utf-8' },
      })
    }
  }

  const opts = {
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
  }

  let result
  try {
    const groq = createGroq({ apiKey: groqApiKey })
    result = streamText({ model: groq('llama-3.3-70b-versatile'), ...opts })
  } catch {
    const ai = createWorkersAI({ binding: env.AI })
    result = streamText({ model: ai('@cf/meta/llama-3.3-70b-instruct-fp8-fast'), ...opts })
  }

  const response = result.toUIMessageStreamResponse({ headers: SSE_HEADERS })

  if (cache && cacheKey && response.body) {
    const [body1, body2] = response.body.tee()
    const ctx = await getCfCtx()
    ctx?.waitUntil(
      (async () => {
        const reader = body2.getReader()
        const chunks: Uint8Array[] = []
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
        const total = chunks.reduce((s, c) => s + c.length, 0)
        const merged = new Uint8Array(total)
        let off = 0
        for (const c of chunks) {
          merged.set(c, off)
          off += c.length
        }
        await cache.put(cacheKey, new TextDecoder().decode(merged), { expirationTtl: 3600 })
      })(),
    )
    return new Response(body1, { headers: response.headers })
  }

  return response
}

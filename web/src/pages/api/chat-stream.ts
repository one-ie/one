import type { APIContext } from 'astro'
import { chatStream } from '../../lib/llm'
import { loadAgent } from '../../lib/agent'
import { getEnv } from '../../lib/cf-env'
import { emit } from '../../lib/telemetry'
import { rateLimit, clientKey } from '../../lib/rate-limit'
import type { Env, Message } from '../../lib/types'

export const prerender = false

const MAX_MESSAGE_BYTES = 16_000
const MAX_HISTORY_TURNS = 40
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

const errResponse = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env
  const agent = loadAgent(env as unknown as Record<string, string | undefined>)
  const start = Date.now()

  const limit = rateLimit(`chat:${clientKey(request)}`, RATE_LIMIT, RATE_WINDOW_MS)
  if (!limit.allowed) {
    return errResponse(
      429,
      { error: 'rate limited', retryAfterSec: limit.retryAfterSec },
      { 'Retry-After': String(limit.retryAfterSec), 'X-RateLimit-Reset': String(limit.resetAt) }
    )
  }

  let body: { message?: unknown; history?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return errResponse(400, { error: 'invalid json' })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return errResponse(400, { error: 'message required' })
  if (message.length > MAX_MESSAGE_BYTES) return errResponse(400, { error: 'message too long' })

  const rawHistory = Array.isArray(body.history) ? body.history : []
  const history: Message[] = rawHistory
    .slice(-MAX_HISTORY_TURNS)
    .filter(
      (m): m is Message =>
        !!m &&
        typeof m === 'object' &&
        (m as Message).role !== undefined &&
        typeof (m as Message).content === 'string'
    )
    .map((m) => ({ role: m.role, content: m.content }))

  const messages: Message[] = [...history, { role: 'user' as const, content: message }]
  const encoder = new TextEncoder()
  let fullText = ''
  let errored: string | null = null

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }
      try {
        for await (const chunk of chatStream(env, agent.systemPrompt, messages, agent.model)) {
          fullText += chunk
          send('delta', { text: chunk })
        }
        const leaks = detectPromptLeak(fullText, agent.systemPrompt)
        const final = leaks ? 'I can\'t share my instructions, but I\'m happy to help with ONE.' : fullText
        if (leaks) send('replace', { text: final })
        send('done', { length: final.length })
      } catch (err) {
        errored = err instanceof Error ? err.message : 'unknown'
        send('error', { error: 'upstream model error' })
      } finally {
        controller.close()
        emit(env, agent.id, {
          channel: 'web',
          model: agent.model,
          messageLen: message.length,
          responseLen: fullText.length,
          latencyMs: Date.now() - start,
          success: errored === null,
          error: errored ?? undefined,
          outcome: errored ? 'warn' : 'result',
        })
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'X-RateLimit-Remaining': String(limit.remaining),
      'X-RateLimit-Reset': String(limit.resetAt),
    },
  })
}

export const GET = () =>
  new Response(JSON.stringify({ error: 'method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  })

function detectPromptLeak(response: string, systemPrompt: string): boolean {
  const needle = systemPrompt.slice(0, 120).toLowerCase()
  if (needle.length < 40) return false
  return response.toLowerCase().includes(needle)
}

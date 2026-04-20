import type { APIContext } from 'astro'
import { chat } from '../../lib/llm'
import { loadAgent } from '../../lib/agent'
import { getEnv } from '../../lib/cf-env'
import { emit } from '../../lib/telemetry'
import type { Env, Message } from '../../lib/types'

export const prerender = false

const MAX_MESSAGE_BYTES = 16_000
const MAX_HISTORY_TURNS = 40

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env
  const agent = loadAgent(env as unknown as Record<string, string | undefined>)
  const start = Date.now()

  let body: { message?: unknown; history?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return json({ error: 'message required' }, 400)
  if (message.length > MAX_MESSAGE_BYTES) return json({ error: 'message too long' }, 400)

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

  try {
    const messages: Message[] = [...history, { role: 'user' as const, content: message }]
    const response = await chat(env, agent.systemPrompt, messages, agent.model)

    emit(env, agent.id, {
      channel: 'web',
      model: agent.model,
      messageLen: message.length,
      responseLen: response.length,
      latencyMs: Date.now() - start,
      success: true,
    })

    return json({ response })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    emit(env, agent.id, {
      channel: 'web',
      model: agent.model,
      messageLen: message.length,
      responseLen: 0,
      latencyMs: Date.now() - start,
      success: false,
      error: msg,
    })
    return json({ error: 'upstream model error' }, 502)
  }
}

export const GET = () =>
  new Response(JSON.stringify({ error: 'method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  })

export const ALL = GET

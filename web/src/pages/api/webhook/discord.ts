import type { APIContext } from 'astro'
import { chat } from '../../../lib/llm'
import { loadAgent } from '../../../lib/agent'
import { getEnv } from '../../../lib/cf-env'
import { normalizeDiscord, sendDiscord } from '../../../lib/channels'
import { emit } from '../../../lib/telemetry'
import type { Env } from '../../../lib/types'

export const prerender = false

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env
  const agent = loadAgent(env as unknown as Record<string, string | undefined>)
  const start = Date.now()

  try {
    const payload = await request.json()

    // Discord ping verification
    if (payload.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (payload.author?.bot) return new Response('OK', { status: 200 })

    const signal = normalizeDiscord(payload)
    const response = await chat(env, agent.systemPrompt, [{ role: 'user', content: signal.content }], agent.model)
    await sendDiscord(env, signal.group, response)

    emit(env, agent.id, {
      channel: 'discord',
      model: agent.model,
      messageLen: signal.content.length,
      responseLen: response.length,
      latencyMs: Date.now() - start,
      success: true,
    })

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Discord webhook error:', err)
    emit(env, agent.id, {
      channel: 'discord',
      model: agent.model,
      messageLen: 0,
      responseLen: 0,
      latencyMs: Date.now() - start,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    })
    return new Response('OK', { status: 200 })
  }
}

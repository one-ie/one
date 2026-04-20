import type { APIContext } from 'astro'
import { chat } from '../../../lib/llm'
import { loadAgent } from '../../../lib/agent'
import { getEnv } from '../../../lib/cf-env'
import { normalizeTelegram, sendTelegram } from '../../../lib/channels'
import type { Env } from '../../../lib/types'

export const prerender = false

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env

  try {
    const payload = await request.json()
    const signal = normalizeTelegram(payload)
    if (!signal) return new Response('OK', { status: 200 })

    const agent = loadAgent(env as unknown as Record<string, string | undefined>)
    const response = await chat(env, agent.systemPrompt, [{ role: 'user', content: signal.content }], agent.model)
    await sendTelegram(env, signal.group, response)

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return new Response('OK', { status: 200 })
  }
}

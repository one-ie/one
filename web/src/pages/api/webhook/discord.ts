import type { APIContext } from 'astro'
import { getEnv } from '../../../lib/cf-env'
import { normalizeDiscord, sendDiscord } from '../../../lib/channels'
import { runAgent } from '../../../lib/handler'
import type { Env } from '../../../lib/types'

export const prerender = false

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env
  const payload = await request.json()

  // Discord ping verification
  if (payload.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (payload.author?.bot) return new Response('OK', { status: 200 })

  const signal = normalizeDiscord(payload)
  const response = await runAgent(signal, 'discord', env)
  if (response) await sendDiscord(env, signal.group, response)

  return new Response('OK', { status: 200 })
}

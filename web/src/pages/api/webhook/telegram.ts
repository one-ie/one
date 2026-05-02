import type { APIContext } from 'astro'
import { getEnv } from '../../../lib/cf-env'
import { normalizeTelegram, sendTelegram } from '../../../lib/channels'
import { runAgent } from '../../../lib/handler'
import type { Env } from '../../../lib/types'

export const prerender = false

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env
  const payload = await request.json()
  const signal = normalizeTelegram(payload)
  if (!signal) return new Response('OK', { status: 200 })

  const response = await runAgent(signal, 'telegram', env)
  if (response) await sendTelegram(env, signal.group, response)

  return new Response('OK', { status: 200 })
}

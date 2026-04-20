import type { APIContext } from 'astro'
import { loadAgent } from '../../lib/agent'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

export async function GET(_ctx: APIContext) {
  const env = await getEnv()
  const agent = loadAgent(env)

  return new Response(
    JSON.stringify({
      status: 'ok',
      agent: agent.id,
      model: agent.model,
      hasOpenRouter: !!env.OPENROUTER_API_KEY,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

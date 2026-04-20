import type { APIContext } from 'astro'
import { chat } from '../../lib/llm'
import { loadAgent } from '../../lib/agent'
import { getEnv } from '../../lib/cf-env'
import type { Env, Message } from '../../lib/types'

export const prerender = false

export async function POST({ request }: APIContext) {
  const env = (await getEnv()) as unknown as Env

  try {
    const { message, history = [] } = (await request.json()) as {
      message: string
      history: Message[]
    }

    const agent = loadAgent(env as unknown as Record<string, string | undefined>)
    const messages: Message[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message },
    ]

    const response = await chat(env, agent.systemPrompt, messages, agent.model)

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

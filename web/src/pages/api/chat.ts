import type { APIRoute } from 'astro'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

const SYSTEM = `You are ONE — a helpful, concise assistant for the ONE substrate.
Be direct. Use markdown. When a user asks about ONE, explain that it's a signal-based AI substrate where agents earn paths through verified outcomes.`

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as Record<string, string | undefined>
  const apiKey = env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }), {
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

  const openrouter = createOpenAICompatible({
    name: 'openrouter',
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  })

  const modelId = env.AGENT_MODEL ?? 'meta-llama/llama-4-maverick'

  const result = streamText({
    model: openrouter.chatModel(modelId),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}

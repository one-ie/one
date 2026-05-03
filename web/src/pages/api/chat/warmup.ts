import type { APIRoute } from 'astro'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

export const POST: APIRoute = async () => {
  const env = await getEnv()
  const groqApiKey = env.GROQ_API_KEY
  if (!groqApiKey) return new Response(null, { status: 204 })
  const groq = createGroq({ apiKey: groqApiKey })
  generateText({ model: groq('llama-3.3-70b-versatile'), prompt: 'hi', maxOutputTokens: 1 }).catch(() => {})
  return new Response(null, { status: 204 })
}

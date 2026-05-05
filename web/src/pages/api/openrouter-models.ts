import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

type KVLike = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

interface OpenRouterModel {
  id: string
  name?: string
  description?: string
  context_length?: number
  pricing?: { prompt?: string; completion?: string }
  top_provider?: { is_moderated?: boolean }
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[]
}

const CACHE_KEY = 'openrouter:models:v1'
const CACHE_TTL = 3600

export const GET: APIRoute = async () => {
  const env = (await getEnv()) as unknown as {
    OPENROUTER_API_KEY?: string
    CHAT_CACHE?: KVLike
  }

  if (env.CHAT_CACHE) {
    const cached = await env.CHAT_CACHE.get(CACHE_KEY)
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      })
    }
  }

  const headers: Record<string, string> = {}
  if (env.OPENROUTER_API_KEY) headers.Authorization = `Bearer ${env.OPENROUTER_API_KEY}`

  const res = await fetch('https://openrouter.ai/api/v1/models', { headers })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'openrouter fetch failed', status: res.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const json = (await res.json()) as OpenRouterModelsResponse
  const models = (json.data ?? []).map((m) => ({
    id: m.id,
    name: m.name ?? m.id,
    description: m.description,
    context: m.context_length,
    promptPrice: m.pricing?.prompt,
    completionPrice: m.pricing?.completion,
  }))

  const payload = JSON.stringify({ models })

  if (env.CHAT_CACHE) {
    await env.CHAT_CACHE.put(CACHE_KEY, payload, { expirationTtl: CACHE_TTL })
  }

  return new Response(payload, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

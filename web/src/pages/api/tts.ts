import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
type Voice = (typeof VOICES)[number]

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as Record<string, string | undefined>
  const key = env.OPENAI_API_KEY
  if (!key) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { text?: string; voice?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 })
  }

  const text = (body.text ?? '').toString().slice(0, 4000).trim()
  if (!text) return new Response(JSON.stringify({ error: 'text required' }), { status: 400 })

  const voice: Voice = VOICES.includes(body.voice as Voice) ? (body.voice as Voice) : 'alloy'

  const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice,
      input: text,
      response_format: 'mp3',
    }),
  })

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '')
    return new Response(JSON.stringify({ error: 'tts upstream failed', detail }), {
      status: upstream.status,
    })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}

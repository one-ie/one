import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
type Voice = (typeof VOICES)[number]

type TtsEnv = {
  OPENAI_API_KEY?: string
  AI?: { run: (model: string, input: Record<string, unknown>) => Promise<unknown> }
}

function pickProvider(env: TtsEnv): 'openai' | 'cf' | null {
  if (env.OPENAI_API_KEY) return 'openai'
  if (env.AI && typeof env.AI.run === 'function') return 'cf'
  return null
}

async function ttsOpenAI(env: TtsEnv, text: string, voice: Voice): Promise<Response> {
  const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
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
    return new Response(JSON.stringify({ error: 'openai tts failed', detail }), {
      status: upstream.status,
    })
  }
  return new Response(upstream.body, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  })
}

async function ttsCloudflare(env: TtsEnv, text: string): Promise<Response> {
  // MeloTTS returns WAV, not MP3. Cap input to ~500 chars to keep latency reasonable.
  const trimmed = text.slice(0, 500)
  const audioHeaders = { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' }

  let result: ReadableStream | Uint8Array | { audio?: string }
  try {
    result = (await env.AI!.run('@cf/myshell-ai/melotts', {
      prompt: trimmed,
      lang: 'en',
    })) as ReadableStream | Uint8Array | { audio?: string }
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'cf tts run failed', detail: (e as Error).message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (result instanceof ReadableStream) {
    return new Response(result, { status: 200, headers: audioHeaders })
  }
  if (result instanceof Uint8Array) {
    return new Response(result.buffer as ArrayBuffer, { status: 200, headers: audioHeaders })
  }
  if (result && typeof result === 'object' && typeof result.audio === 'string') {
    const bin = Uint8Array.from(atob(result.audio), (c) => c.charCodeAt(0))
    return new Response(bin.buffer as ArrayBuffer, { status: 200, headers: audioHeaders })
  }
  return new Response(JSON.stringify({ error: 'cf tts unexpected response' }), { status: 502 })
}

export const GET: APIRoute = async () => {
  const env = (await getEnv()) as unknown as TtsEnv
  const provider = pickProvider(env)
  return new Response(
    JSON.stringify({
      available: provider !== null,
      provider,
      voices: provider === 'openai' ? VOICES : [],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const env = (await getEnv()) as unknown as TtsEnv
    const provider = pickProvider(env)
    if (!provider) {
      return new Response(JSON.stringify({ error: 'no tts provider configured' }), {
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

    if (provider === 'openai') {
      const voice: Voice = VOICES.includes(body.voice as Voice) ? (body.voice as Voice) : 'alloy'
      return ttsOpenAI(env, text, voice)
    }
    return ttsCloudflare(env, text)
  } catch (e) {
    console.error('tts handler error:', e)
    return new Response(
      JSON.stringify({ error: 'tts handler error', detail: (e as Error).message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

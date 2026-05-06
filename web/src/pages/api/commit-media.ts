import type { APIRoute } from 'astro'
import { verifyCommitAssertion, rpFromRequest } from '@/lib/passkey'

export const prerender = false

const ALLOWED_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

export const POST: APIRoute = async ({ request }) => {
  const { rpId, origin } = rpFromRequest(request)
  const _env = (await import('cloudflare:workers' as string)).env as {
    CONTENT?: R2Bucket
    DB?: D1Database
    SERVER_SECRET?: string
  }
  if (!_env.CONTENT || !_env.DB || !_env.SERVER_SECRET) {
    return new Response('not configured', { status: 503 })
  }
  const env = _env as { CONTENT: R2Bucket; DB: D1Database; SERVER_SECRET: string }

  const { slug, filename, contentBase64, challenge, assertion } = await request.json() as {
    slug?: string
    filename?: string
    contentBase64?: string
    challenge?: string
    assertion?: unknown
  }

  if (!slug || !filename || !contentBase64 || !challenge || !assertion) {
    return new Response('missing fields', { status: 400 })
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const contentType = ALLOWED_TYPES[ext]
  if (!contentType) return new Response(`unsupported type: ${ext}`, { status: 415 })

  const bytes = Uint8Array.from(atob(contentBase64), c => c.charCodeAt(0))
  const hashBuf = await crypto.subtle.digest('SHA-256', bytes)
  const sha = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('')

  const ok = await verifyCommitAssertion({ slug, file: `media/${sha}.${ext}`, content: sha, challenge, assertion, origin, rpId, env })
  if (!ok) return new Response('unauthorized', { status: 401 })

  const key = `${slug}/media/${sha}.${ext}`
  await env.CONTENT.put(key, bytes, { httpMetadata: { contentType }, customMetadata: { sha, filename, ts: String(Date.now()) } })

  const mediaUrl = `/u/${slug}/media/${sha}.${ext}`
  return new Response(JSON.stringify({ ok: true, sha, url: mediaUrl, contentType }), {
    headers: { 'content-type': 'application/json' },
  })
}

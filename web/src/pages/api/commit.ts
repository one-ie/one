import type { APIRoute } from 'astro'
import { checkToken, verifyAuthenticationResponse } from '../../lib/passkey'
import { getSlugOwner } from '../../lib/slug'

export const prerender = false

type CfEnv = { SERVER_SECRET: string; DB: D1Database; CONTENT: R2Bucket; RP_ID?: string; ORIGIN?: string }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return mod.env as CfEnv
}

export const POST: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  const body = await request.json() as {
    slug: string
    file: string
    content: string | null
    challenge: string
    token: string
    assertion: Record<string, unknown>
    expectedSha?: string
  }

  if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token)) {
    return new Response(JSON.stringify({ error: 'invalid or expired challenge' }), { status: 400 })
  }

  const owner = await getSlugOwner(body.slug, env.DB)
  if (!owner) {
    return new Response(JSON.stringify({ error: 'slug not found' }), { status: 404 })
  }

  const pubkeyBytes = Uint8Array.from(Buffer.from(owner.pubkey, 'base64'))

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: body.assertion as unknown as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
      expectedChallenge: body.challenge,
      expectedOrigin: env.ORIGIN ?? url.origin,
      expectedRPID: env.RP_ID ?? url.hostname,
      credential: {
        id: owner.credential_id,
        publicKey: pubkeyBytes,
        counter: 0,
        transports: ['internal'],
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'assertion failed', detail: String(e) }), { status: 400 })
  }

  if (!verification.verified) {
    return new Response(JSON.stringify({ error: 'not verified' }), { status: 400 })
  }

  const key = `${body.slug}/${body.file}`
  const prev = await env.CONTENT.get(key)
  const prevSha = prev ? (prev.customMetadata?.sha ?? '') : ''

  if (body.expectedSha !== undefined && prevSha !== body.expectedSha) {
    return new Response(JSON.stringify({ ok: false, conflict: true, currentSha: prevSha }), { status: 409, headers: { 'content-type': 'application/json' } })
  }

  const kind = body.file.split('/')[0]
  const name = body.file.split('/').slice(1).join('/')
  const resourceUrl = `/u/${body.slug}/${kind}/${name}`

  if (body.content === null) {
    await env.CONTENT.delete(key)
    return new Response(JSON.stringify({ ok: true, deleted: true, url: resourceUrl }), { headers: { 'content-type': 'application/json' } })
  }

  const sha = await digestSha256(body.content)

  await env.CONTENT.put(key, body.content, {
    customMetadata: { sha, prevSha, ts: String(Date.now()), model: 'user' },
  })

  return new Response(
    JSON.stringify({ ok: true, sha, url: resourceUrl }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

async function digestSha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

import type { APIRoute } from 'astro'
import { makeChallenge, checkToken, rpFromRequest } from '../../lib/passkey'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'

export const prerender = false

type CfEnv = { SERVER_SECRET: string; DB: D1Database; SESSION?: KVNamespace }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return mod.env as CfEnv
}

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days

// GET /api/auth — returns a fresh challenge; also returns current session slug if valid
export const GET: APIRoute = async ({ request, locals }) => {
  const env = await getEnv()
  const { rpId } = rpFromRequest(request)
  const { challenge, token } = await makeChallenge(env.SERVER_SECRET)

  // Middleware resolved the session (cookie → KV, or DEV_SLUG fallback)
  return new Response(JSON.stringify({ challenge, token, rpId, slug: locals.slug ?? null }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// POST /api/auth — verifies passkey assertion, creates session, returns slug
export const POST: APIRoute = async ({ request, cookies }) => {
  const env = await getEnv()
  const { rpId, origin } = rpFromRequest(request)

  const body = await request.json() as {
    assertion: AuthenticationResponseJSON
    challenge: string
    token: string
  }

  if (!body.assertion || !body.challenge || !body.token) {
    return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400 })
  }
  if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token)) {
    return new Response(JSON.stringify({ error: 'invalid or expired challenge' }), { status: 400 })
  }

  const credentialId = body.assertion.id
  const owner = await env.DB
    .prepare('SELECT slug, pubkey, credential_id FROM owners WHERE credential_id = ?')
    .bind(credentialId)
    .first<{ slug: string; pubkey: string; credential_id: string }>()

  if (!owner) {
    return new Response(JSON.stringify({ ok: false, error: 'no-account' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const pubkeyBytes = Uint8Array.from(Buffer.from(owner.pubkey, 'base64'))

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: body.assertion,
      expectedChallenge: body.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
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
    return new Response(JSON.stringify({ error: 'not verified' }), { status: 401 })
  }

  // Issue session
  const sessionId = crypto.randomUUID()
  if (env.SESSION) {
    await env.SESSION.put(`session:${sessionId}`, owner.slug, { expirationTtl: SESSION_TTL })
  }

  cookies.set('session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
    secure: rpId !== 'localhost' && rpId !== '127.0.0.1',
  })

  return new Response(JSON.stringify({ ok: true, slug: owner.slug }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// DELETE /api/auth — sign out: revoke session, clear cookie
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const env = await getEnv()
  const sessionId = cookies.get('session')?.value
  if (sessionId && env.SESSION) {
    await env.SESSION.delete(`session:${sessionId}`)
  }
  cookies.delete('session', { path: '/' })
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

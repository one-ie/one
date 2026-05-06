import type { APIRoute } from 'astro'
import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { makeChallenge, checkToken, verifyRegistrationResponse, rpFromRequest } from '../../lib/passkey'
import { randomSlug, slugExists } from '../../lib/slug'
import { autoImportSkillCreator } from '../../lib/skill/auto-import'

export const prerender = false

type CfEnv = { SERVER_SECRET: string; DB: D1Database; CONTENT?: R2Bucket }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return mod.env as CfEnv
}

export const GET: APIRoute = async ({ request }) => {
  const env = await getEnv()
  const { rpId } = rpFromRequest(request)

  const { challenge, token } = await makeChallenge(env.SERVER_SECRET)
  const userId = crypto.randomUUID()
  return new Response(
    JSON.stringify({ challenge, token, userId, rpId, rpName: 'ONE' }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  const { rpId, origin } = rpFromRequest(request)
  const body = await request.json() as {
    registration: Record<string, unknown>
    userId: string
    challenge: string
    token: string
    slug?: string
    displayName?: string
    tosTimestamp?: number
  }

  if (!body.challenge || !body.token || !body.registration) {
    return new Response(JSON.stringify({ error: 'missing required fields' }), { status: 400 })
  }
  if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token)) {
    return new Response(JSON.stringify({ error: 'invalid or expired challenge' }), { status: 400 })
  }

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body.registration as unknown as Parameters<typeof verifyRegistrationResponse>[0]['response'],
      expectedChallenge: body.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'registration failed', detail: String(e) }), { status: 400 })
  }

  if (!verification.verified || !verification.registrationInfo) {
    return new Response(JSON.stringify({ error: 'not verified' }), { status: 400 })
  }

  const { credential } = verification.registrationInfo
  let slug = body.slug
  if (!slug || await slugExists(slug, env.DB)) {
    slug = randomSlug()
    while (await slugExists(slug, env.DB)) slug = randomSlug()
  }

  const recoveryWords = generateMnemonic(wordlist, 128)
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(recoveryWords), 'PBKDF2', false, ['deriveBits'])
  const hashBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(slug), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256,
  )
  const recoveryHash = Buffer.from(hashBits).toString('base64')

  const pubkeyB64 = Buffer.from(credential.publicKey).toString('base64')
  await env.DB.prepare(
    'INSERT INTO owners (slug, pubkey, credential_id, ts, recovery_hash, display_name, tos_hash, tos_signed_at) VALUES (?, ?, ?, unixepoch(), ?, ?, ?, ?)',
  ).bind(slug, pubkeyB64, credential.id, recoveryHash, body.displayName?.trim() || null, 'v1', body.tosTimestamp ?? null).run()

  if (env.CONTENT) await autoImportSkillCreator(slug, env.CONTENT)

  return new Response(JSON.stringify({ slug, recoveryWords: recoveryWords.split(' '), redirectTo: `/u/${slug}/chat` }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

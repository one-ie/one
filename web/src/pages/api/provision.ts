import type { APIRoute } from 'astro'
import { makeChallenge, checkToken, verifyRegistrationResponse } from '../../lib/passkey'
import { randomSlug, slugExists } from '../../lib/slug'
import { autoImportSkillCreator } from '../../lib/skill/auto-import'

export const prerender = false

type CfEnv = { SERVER_SECRET: string; DB: D1Database; CONTENT?: R2Bucket; RP_ID?: string; ORIGIN?: string }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return mod.env as CfEnv
}

export const GET: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  const probe = url.searchParams.get('probe')
  const slug = url.searchParams.get('slug')
  if (probe && slug) {
    const exists = await slugExists(slug, env.DB)
    return new Response(JSON.stringify({ owner: exists }), { headers: { 'Content-Type': 'application/json' } })
  }
  const { challenge, token } = await makeChallenge(env.SERVER_SECRET)
  const userId = crypto.randomUUID()
  const rp = env.RP_ID ?? url.hostname
  return new Response(
    JSON.stringify({ challenge, token, userId, rpId: rp, rpName: 'ONE' }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

export const POST: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  const body = await request.json() as {
    registration: Record<string, unknown>
    userId: string
    challenge: string
    token: string
    slug?: string
  }

  if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token)) {
    return new Response(JSON.stringify({ error: 'invalid or expired challenge' }), { status: 400 })
  }

  const rp = env.RP_ID ?? url.hostname
  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body.registration as unknown as Parameters<typeof verifyRegistrationResponse>[0]['response'],
      expectedChallenge: body.challenge,
      expectedOrigin: env.ORIGIN ?? url.origin,
      expectedRPID: rp,
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

  const pubkeyB64 = Buffer.from(credential.publicKey).toString('base64')
  await env.DB.prepare(
    'INSERT INTO owners (slug, pubkey, credential_id, ts) VALUES (?, ?, ?, unixepoch())',
  ).bind(slug, pubkeyB64, credential.id).run()

  if (env.CONTENT) await autoImportSkillCreator(slug, env.CONTENT)

  return new Response(JSON.stringify({ slug, redirectTo: `/u/${slug}/chat` }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

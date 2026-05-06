import type { APIRoute } from 'astro'
import { checkToken, verifyRegistrationResponse, rpFromRequest } from '../../lib/passkey'

export const prerender = false

export const POST: APIRoute = async ({ request, url }) => {
  const env = (await import('cloudflare:workers' as string)).env as { DB?: D1Database; SERVER_SECRET?: string }
  if (!env.DB) return new Response('DB not configured', { status: 503 })

  const action = url.searchParams.get('action')

  if (action === 'add-key') {
    if (!env.SERVER_SECRET) return new Response(JSON.stringify({ error: 'not configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
    const body = await request.json() as { slug?: string; registration: Record<string, unknown>; challenge: string; token: string }
    if (!body.slug || !body.challenge || !body.token)
      return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token))
      return new Response(JSON.stringify({ error: 'invalid token' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    const { rpId, origin } = rpFromRequest(request)
    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: body.registration as unknown as Parameters<typeof verifyRegistrationResponse>[0]['response'],
        expectedChallenge: body.challenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    if (!verification.verified || !verification.registrationInfo)
      return new Response(JSON.stringify({ error: 'not verified' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    const { credential } = verification.registrationInfo
    const pubkeyB64 = Buffer.from(credential.publicKey).toString('base64')
    await env.DB.prepare('INSERT INTO owners_keys (slug, pubkey, label) VALUES (?, ?, ?)')
      .bind(body.slug, pubkeyB64, 'device').run()
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  }

  const formData = await request.formData()
  const slug = formData.get('slug') as string | null
  const wallet = formData.get('wallet') as string | null
  const agentverseKey = formData.get('agentverse_key') as string | null
  const recoveryEmail = formData.get('recovery_email') as string | null

  if (!slug) return new Response('missing slug', { status: 400 })

  const updates: string[] = []
  const values: (string | null)[] = []

  if (wallet !== null) { updates.push('wallet = ?'); values.push(wallet || null) }
  if (agentverseKey) { updates.push('agentverse_key_enc = ?'); values.push(agentverseKey) }
  if (recoveryEmail !== null) { updates.push('recovery_email = ?'); values.push(recoveryEmail || null) }

  if (updates.length > 0) {
    values.push(slug)
    await env.DB.prepare(`UPDATE owners SET ${updates.join(', ')} WHERE slug = ?`).bind(...values).run()
  }

  return new Response(null, { status: 302, headers: { location: `/u/${slug}/settings` } })
}

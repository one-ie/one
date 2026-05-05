import type { APIRoute } from 'astro'
import { zipSync, strToU8 } from 'fflate'
import { verifyAuthenticationResponse } from '../../../lib/passkey'
import { getSlugOwner } from '../../../lib/slug'

export const prerender = false

export const GET: APIRoute = async ({ params, request, url }) => {
  const slug = params.slug!
  const env = (await import('cloudflare:workers' as string)).env as { CONTENT?: R2Bucket; DB?: D1Database; RP_ID?: string; ORIGIN?: string }
  if (!env.CONTENT || !env.DB) return new Response('not configured', { status: 503 })

  const assertionHeader = request.headers.get('X-Assertion')
  if (!assertionHeader) {
    return new Response(JSON.stringify({ error: 'X-Assertion header required' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const owner = await getSlugOwner(slug, env.DB)
  if (!owner) return new Response('not found', { status: 404 })

  let assertion: Record<string, unknown>
  try { assertion = JSON.parse(assertionHeader) } catch {
    return new Response('invalid assertion', { status: 400 })
  }

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: assertion as unknown as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
      expectedChallenge: assertion['challenge'] as string,
      expectedOrigin: env.ORIGIN ?? url.origin,
      expectedRPID: env.RP_ID ?? url.hostname,
      credential: {
        id: owner.credential_id,
        publicKey: Uint8Array.from(Buffer.from(owner.pubkey, 'base64')),
        counter: 0,
        transports: ['internal'],
      },
    })
  } catch {
    return new Response('assertion failed', { status: 401 })
  }
  if (!verification.verified) return new Response('not verified', { status: 401 })

  const listed = await env.CONTENT.list({ prefix: `${slug}/` })
  const files: Record<string, Uint8Array> = {}
  await Promise.all(
    listed.objects
      .filter(o => !o.key.includes('/_workspace/') && !o.key.includes('/_recovery/'))
      .map(async o => {
        const obj = await env.CONTENT!.get(o.key)
        if (obj) files[o.key.slice(slug.length + 1)] = strToU8(await obj.text())
      }),
  )

  const zipped = zipSync(files)
  return new Response(zipped.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${slug}-export.zip"`,
    },
  })
}

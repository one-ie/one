import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { getSlugOwner } from './slug'
export { verifyRegistrationResponse, verifyAuthenticationResponse }
export type { VerifiedRegistrationResponse, VerifiedAuthenticationResponse } from '@simplewebauthn/server'

const used = new Set<string>()
const enc = (s: string) => new TextEncoder().encode(s)

export function rpFromRequest(request: Request): { rpId: string; origin: string } {
  const host = request.headers.get('host') ?? new URL(request.url).host
  const rpId = host.split(':')[0]
  const proto = rpId === 'localhost' || rpId === '127.0.0.1' ? 'http' : 'https'
  return { rpId, origin: `${proto}://${host}` }
}

export async function makeChallenge(secret: string): Promise<{ challenge: string; token: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const challenge = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const exp = Date.now() + 120_000
  const msg = `${challenge}:${exp}`
  const k = await crypto.subtle.importKey('raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sigBytes = await crypto.subtle.sign('HMAC', k, enc(msg))
  const token = btoa(String.fromCharCode(...new Uint8Array(sigBytes))) + ':' + exp
  return { challenge, token }
}

export async function verifyCommitAssertion(opts: {
  slug: string
  file: string
  content: string
  challenge: string
  assertion: unknown
  origin: string
  rpId: string
  env: { DB: D1Database; SERVER_SECRET?: string }
}): Promise<boolean> {
  const owner = await getSlugOwner(opts.slug, opts.env.DB)
  if (!owner) return false
  const pubkeyBytes = Uint8Array.from(Buffer.from(owner.pubkey, 'base64'))
  try {
    const result = await verifyAuthenticationResponse({
      response: opts.assertion as AuthenticationResponseJSON,
      expectedChallenge: opts.challenge,
      expectedOrigin: opts.origin,
      expectedRPID: opts.rpId,
      credential: {
        id: owner.credential_id,
        publicKey: pubkeyBytes,
        counter: 0,
        transports: ['internal'],
      },
    })
    return result.verified
  } catch {
    return false
  }
}

export async function checkToken(secret: string, challenge: string, token: string): Promise<boolean> {
  const colonIdx = token.lastIndexOf(':')
  const sig = token.slice(0, colonIdx)
  const exp = token.slice(colonIdx + 1)
  if (Date.now() > +exp) return false
  if (used.has(challenge)) return false
  const msg = `${challenge}:${exp}`
  const k = await crypto.subtle.importKey('raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0))
  const ok = await crypto.subtle.verify('HMAC', k, sigBytes, enc(msg))
  if (ok) used.add(challenge)
  return ok
}

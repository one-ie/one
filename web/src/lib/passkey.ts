import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
export { verifyRegistrationResponse, verifyAuthenticationResponse }
export type { VerifiedRegistrationResponse, VerifiedAuthenticationResponse } from '@simplewebauthn/server'

const used = new Set<string>()
const enc = (s: string) => new TextEncoder().encode(s)

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

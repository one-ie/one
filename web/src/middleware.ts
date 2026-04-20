import { defineMiddleware } from 'astro:middleware'

const STATIC_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
}

// CSP: unsafe-inline is required for Astro's island-hydration bootstrap
// script that's emitted inline per page. Switch to a nonce-based policy
// once Astro's experimental.csp is wired. Until then, the other directives
// keep the blast radius small: same-origin only, no framing, no base hijack.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next()
  const h = res.headers
  for (const [k, v] of Object.entries(STATIC_HEADERS)) h.set(k, v)

  const ct = h.get('Content-Type') ?? ''
  if (ct.includes('text/html')) h.set('Content-Security-Policy', CSP)

  return res
})

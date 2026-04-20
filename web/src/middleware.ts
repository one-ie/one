import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next()
  const h = res.headers
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  if (!h.has('X-Frame-Options')) h.set('X-Frame-Options', 'SAMEORIGIN')
  return res
})

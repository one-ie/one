import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (ctx, next) => {
  const host = ctx.request.headers.get('host') ?? ''
  const isPrimary =
    host === 'one.ie' ||
    host === 'demo.one.ie' ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')

  if (!isPrimary && host) {
    const env = (await import('cloudflare:workers' as string)).env as { DB?: D1Database }
    if (env.DB) {
      const row = await env.DB
        .prepare('SELECT slug FROM domains WHERE host = ? AND verified = 1')
        .bind(host)
        .first<{ slug: string }>()
      if (row) {
        const url = new URL(ctx.request.url)
        const suffix = url.pathname === '/' ? '' : url.pathname
        return ctx.rewrite(new URL(`/u/${row.slug}${suffix}`, url))
      }
    }
  }

  return next()
})

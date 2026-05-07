import { defineMiddleware } from 'astro:middleware'

const ONE_IE_SUBDOMAIN = /^([a-z0-9-]+)\.one\.ie$/i

function agentFromPath(pathname: string): string | undefined {
  // First segment after the leading slash, if present and non-empty
  const segment = pathname.split('/')[1]
  return segment || undefined
}

function buildContext(workspace: string | undefined, pathname: string, viewer: WorkspaceContext['viewer'] = 'end_user'): WorkspaceContext {
  return {
    workspace,
    agent: workspace !== undefined ? agentFromPath(pathname) : undefined,
    viewer,
    brand: workspace,
  }
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next()
  if (ctx.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json')
    return new Response('{}', { headers: { 'content-type': 'application/json' } })
  const host = ctx.request.headers.get('host') ?? ''
  const url = new URL(ctx.request.url)

  // Resolve session from cookie — runs on all SSR requests
  const sessionId = ctx.cookies.get('session')?.value
  const cfEnv = (await import('cloudflare:workers' as string)).env as { SESSION?: KVNamespace; DEV_SLUG?: string }
  if (sessionId && cfEnv.SESSION) {
    const slug = await cfEnv.SESSION.get(`session:${sessionId}`)
    if (slug) ctx.locals.slug = slug
  }

  // Local dev bypass: DEV_SLUG in .dev.vars acts as a pre-authenticated session
  if (!ctx.locals.slug && cfEnv.DEV_SLUG && (host.startsWith('localhost') || host.startsWith('127.0.0.1'))) {
    ctx.locals.slug = cfEnv.DEV_SLUG
  }

  // Diagnostic — visible in wrangler dev console
  console.log(`[mw] ${ctx.request.method} ${url.pathname} | sessionId=${sessionId ? sessionId.slice(0, 8) + '...' : 'none'} | slug=${ctx.locals.slug ?? 'none'} | DEV_SLUG=${cfEnv.DEV_SLUG ?? 'unset'}`)

  const isPrimary =
    host === 'one.ie' ||
    host === 'demo.one.ie' ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')

  if (isPrimary) {
    ctx.locals.workspaceContext = buildContext(undefined, url.pathname, 'developer')
    return next()
  }

  // Check for {workspace}.one.ie subdomain
  const subMatch = ONE_IE_SUBDOMAIN.exec(host)
  if (subMatch) {
    ctx.locals.workspaceContext = buildContext(subMatch[1].toLowerCase(), url.pathname)
    return next()
  }

  // Custom domain — D1 lookup
  if (host) {
    const env = (await import('cloudflare:workers' as string)).env as { DB?: D1Database }
    if (env.DB) {
      const row = await env.DB
        .prepare('SELECT slug FROM domains WHERE host = ? AND verified = 1')
        .bind(host)
        .first<{ slug: string }>()
      if (row) {
        ctx.locals.workspaceContext = buildContext(row.slug, url.pathname)
        const suffix = url.pathname === '/' ? '' : url.pathname
        return ctx.rewrite(new URL(`/u/${row.slug}${suffix}`, url))
      }
    }
  }

  // Unknown host — treat as primary
  ctx.locals.workspaceContext = buildContext(undefined, url.pathname)
  return next()
})

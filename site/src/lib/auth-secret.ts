// Which secret signs sessions — decided per request, never at build time.
//
// On Cloudflare a secret set with `wrangler secret put` exists only in the
// runtime env; `import.meta.env` is fixed when the site is built and never sees
// it. Reading it at build time, and throwing at module load when it was absent,
// made every /api/auth route answer Astro's 500 page in production.
//
// Runtime env wins, then a build-time value, then the dev fallback (dev only).
// null means "not configured": the auth routes answer 503 with the fix, and the
// rest of the site keeps working.
export const DEV_SECRET = 'dev-secret-change-in-production'

export function resolveAuthSecret(
  runtimeEnv: Record<string, string | undefined>,
  buildSecret: string | undefined,
  dev: boolean,
): string | null {
  const s = runtimeEnv.BETTER_AUTH_SECRET || buildSecret
  if (s) return s
  return dev ? DEV_SECRET : null
}

export function authNotConfigured(): Response {
  return Response.json(
    {
      error: 'auth_not_configured',
      detail:
        'Sign-in is off on this site: set BETTER_AUTH_SECRET (wrangler secret put BETTER_AUTH_SECRET), bind a D1 database as DB and apply migrations/ (wrangler d1 migrations apply <db> --remote).',
    },
    { status: 503 },
  )
}

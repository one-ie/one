import { betterAuth } from 'better-auth'
import { getEnv } from './cf-env'
import { authNotConfigured, resolveAuthSecret } from './auth-secret'

/**
 * Better Auth server instance, built on first use from the RUNTIME env.
 *
 * Standalone mode: set BETTER_AUTH_SECRET as a Worker secret, and apply
 * migrations/ to the D1 database bound as DB. Users and sessions live in D1, so
 * a session survives the isolate that made it. Better Auth recognises the D1
 * binding itself (prepare + batch + exec) and uses its own D1 dialect.
 * ONE BaaS mode: set ONE_API_KEY in .env — auth proxies to one.ie.
 *
 * To add providers (GitHub, Google, etc.) see:
 * https://www.better-auth.com/docs/authentication/social-login
 */
type Auth = ReturnType<typeof betterAuth>
type D1Like = { prepare: unknown; batch: unknown; exec: unknown }
let built: { secret: string; db: unknown; auth: Auth } | null = null
let warned = false

/** The D1 binding when it is one; anything else is no database. */
export function d1Of(env: Record<string, unknown>): D1Like | undefined {
  const db = env.DB as Partial<D1Like> | undefined
  return db && typeof db === 'object' && 'prepare' in db && 'batch' in db && 'exec' in db ? (db as D1Like) : undefined
}

/** The auth instance, or null when sign-in is not configured (no secret, or no D1 in production). Never a throw. */
export async function getAuth(): Promise<Auth | null> {
  const env = (await getEnv()) as Record<string, string | undefined>
  const secret = resolveAuthSecret(
    env,
    import.meta.env.BETTER_AUTH_SECRET as string | undefined,
    Boolean(import.meta.env.DEV),
  )
  if (!secret) return null
  const db = d1Of(env)
  // Production without D1 is "not configured": a session kept in one isolate's
  // memory signs people out at random. Dev may run on the memory store.
  if (!db && !import.meta.env.DEV) return null
  if (built?.secret === secret && built.db === db) return built.auth
  if (!db && !warned) {
    warned = true
    console.warn('[auth] no D1 binding "DB": sessions are kept in this isolate only. Bind DB and apply migrations/.')
  }
  const auth = betterAuth({
    secret,
    // D1 when bound (sessions survive the isolate); Better Auth's memory store in dev otherwise.
    ...(db ? { database: db as never } : {}),
    // Unset: Better Auth infers the origin from the request, so the same build
    // answers on every host it is served from.
    baseURL: env.BETTER_AUTH_URL || (import.meta.env.BETTER_AUTH_URL as string | undefined) || undefined,
    emailAndPassword: {
      enabled: true,
    },
  }) as unknown as Auth // the options literal narrows the generic; callers use the base shape
  built = { secret, db, auth }
  return auth
}

export { authNotConfigured }

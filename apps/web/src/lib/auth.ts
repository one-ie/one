import { betterAuth } from 'better-auth'

/**
 * Better Auth server instance.
 *
 * Standalone mode: sessions stored in D1 (set DB binding in wrangler.toml).
 * ONE BaaS mode: set ONE_API_KEY in .env — auth proxies to one.ie.
 *
 * To add providers (GitHub, Google, etc.) see:
 * https://www.better-auth.com/docs/authentication/social-login
 */
// Fail fast outside dev: a missing secret in production means every session
// token is signed with a public, well-known string. The dev fallback only
// applies when Vite/Astro reports DEV.
const secret = import.meta.env.BETTER_AUTH_SECRET as string | undefined
if (!secret && !import.meta.env.DEV) {
  throw new Error('BETTER_AUTH_SECRET must be set in production')
}

export const auth = betterAuth({
  secret: secret ?? 'dev-secret-change-in-production',
  baseURL: (import.meta.env.BETTER_AUTH_URL as string | undefined) ?? 'http://localhost:4321',
  emailAndPassword: {
    enabled: true,
  },
})

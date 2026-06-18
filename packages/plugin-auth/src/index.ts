import { createAuthClient } from 'better-auth/client'
import type { OnePluginFactory } from '@oneie/frontend'

export interface OneAuthConfig {
  baseUrl?: string
}

function defaultBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return (
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { BETTER_AUTH_URL?: string } }).env?.BETTER_AUTH_URL) ||
    'https://one.ie'
  )
}

export function createOneAuthClient(config: OneAuthConfig = {}) {
  const authClient = createAuthClient({
    baseURL: config.baseUrl ?? defaultBaseUrl(),
  })
  return authClient
}

export const { signIn, signUp, signOut, useSession, getSession } = createOneAuthClient()

export const auth: OnePluginFactory<OneAuthConfig> = (config = {}) => ({
  name: 'plugin-auth',
  tier: 'free',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

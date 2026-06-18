import type { OnePluginFactory } from '@oneie/frontend'

export interface OneBackendConfig {
  apiKey?: string
  baseUrl?: string
}

export async function oneClient(config: OneBackendConfig = {}) {
  const { SubstrateClient } = await import('@oneie/sdk/client')
  const apiKey =
    config.apiKey ??
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { ONE_API_KEY?: string } }).env?.ONE_API_KEY)
  if (!apiKey) throw new Error('ONE_API_KEY is required for oneClient()')
  return SubstrateClient.fromApiKey(apiKey, config.baseUrl)
}

export const backend: OnePluginFactory<OneBackendConfig> = (config = {}) => ({
  name: 'plugin-backend',
  tier: 'free',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

// plugin-premium — served-widget loader + entitlement gate (C4)
import type { OnePluginFactory } from '@oneie/frontend'

export interface OnePanelConfig {
  plugin: string
  entitlementKey?: string
  ws?: string
  primary?: string
}

export const premium: OnePluginFactory<OnePanelConfig> = (config = {}) => ({
  name: 'plugin-premium',
  tier: 'paid',
  serves: `https://one.ie/x/${config.plugin ?? 'premium'}.js`,
  entitlement: config.plugin ?? 'premium',
  config: undefined,
  integration: undefined,
})

export type { OnePanelConfig as PremiumConfig }
export * from './bridge'

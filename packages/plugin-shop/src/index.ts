import type { OnePluginFactory } from '@oneie/frontend'

export interface OneShopConfig {
  /** Workspace slug — identifies which product catalog to load */
  ws: string
  /** Default currency code (ISO 4217). Defaults to 'USD' */
  currency?: string
  /** Payment provider: 'stripe' | 'x402' | 'both'. Defaults to 'stripe' */
  provider?: 'stripe' | 'x402' | 'both'
  /** Cart behaviour: 'drawer' | 'page'. Defaults to 'drawer' */
  cart?: 'drawer' | 'page'
  /** Theme accent — overrides the brand.tokens.primary for shop surfaces */
  primary?: string
  /** WS hub URL override (defaults to one.config.ts backend.baseUrl) */
  endpoint?: string
}

export const shop: OnePluginFactory<OneShopConfig> = (_config = {} as OneShopConfig) => ({
  name: 'plugin-shop',
  tier: 'paid',
  serves: 'https://one.ie/x/shop.js',
  entitlement: 'shop',
  config: undefined,
  integration: undefined,
})

export type { OneShopConfig as ShopConfig }

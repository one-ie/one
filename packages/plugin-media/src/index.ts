import type { OnePluginFactory } from '@oneie/frontend'

export interface OneMediaConfig {
  /** Workspace slug — required for the connected tier key check */
  ws: string
  /** Video provider(s) to surface. Default: 'both' */
  provider?: 'mux' | 'youtube' | 'both'
  /** Gallery layout. Default: 'grid' */
  layout?: 'grid' | 'list' | 'featured'
  /** Number of columns in grid layout. Default: 3 */
  columns?: 2 | 3 | 4
  /** Override the default media API endpoint */
  endpoint?: string
}

export const media: OnePluginFactory<OneMediaConfig> = (config) => ({
  name: 'plugin-media',
  tier: 'connected',
  serves: 'https://one.ie/m/media.js',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

export type { OneMediaConfig as MediaConfig }

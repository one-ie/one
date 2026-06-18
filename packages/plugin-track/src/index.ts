import type { OnePluginFactory } from '@oneie/frontend'

export interface OneTrackConfig {
  ws: string
  agent?: string
}

export const track: OnePluginFactory<OneTrackConfig> = (config = {} as OneTrackConfig) => ({
  name: 'plugin-track',
  tier: 'connected',
  serves: 'p/one.js',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

export type { OneTrackConfig as TrackConfig }

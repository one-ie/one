import type { AstroIntegration } from 'astro'
import type { OnePluginFactory } from '@oneie/frontend'

export interface OnePagesConfig {
  /** Workspace slug whose published pages this site renders. */
  ws?: string
  /** Inject the /p/[slug] route automatically. Default: true. */
  injectRoutes?: boolean
}

const defaults: Required<OnePagesConfig> = {
  ws: '',
  injectRoutes: true,
}

export const pages: OnePluginFactory<OnePagesConfig> = (config = {}) => {
  const resolved: Required<OnePagesConfig> = { ...defaults, ...config }

  const integration = (_cfg: OnePagesConfig): AstroIntegration => ({
    name: '@oneie/plugin-pages',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        if (resolved.injectRoutes) {
          injectRoute({
            pattern: '/p/[slug]',
            entrypoint: '@oneie/plugin-pages/PageRoute.astro',
          })
        }
      },
    },
  })

  return {
    name: 'plugin-pages',
    tier: 'free',
    config: undefined,
    integration,
    entitlement: undefined,
    serves: undefined,
  }
}

export { PageRenderer } from './PageRenderer'
export type { PageRendererProps, PuckData } from './PageRenderer'
export { fetchPage } from './fetchPage'
export type { FetchPageOptions } from './fetchPage'
export { pagesPuckConfig } from './config'
export type { OnePagesConfig as PagesConfig }

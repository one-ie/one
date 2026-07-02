import type { AstroIntegration } from 'astro'
import type { OnePluginFactory } from '@oneie/frontend'

export interface OneBlogConfig {
  /** Directory where blog posts live. Default: 'src/content/blog' */
  postsDir?: string
  /** Emit an RSS feed at /rss.xml. Default: true */
  rss?: boolean
  /** Inject /blog and /blog/[slug] routes automatically. Default: true */
  injectRoutes?: boolean
  /** Posts per page for the index grid. Default: 12 */
  postsPerPage?: number
}

const defaults: Required<OneBlogConfig> = {
  postsDir: 'src/content/blog',
  rss: true,
  injectRoutes: true,
  postsPerPage: 12,
}

export const blog: OnePluginFactory<OneBlogConfig> = (config = {}) => {
  const resolved: Required<OneBlogConfig> = { ...defaults, ...config }

  const integration = (_cfg: OneBlogConfig): AstroIntegration => ({
    name: '@oneie/plugin-blog',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        if (resolved.injectRoutes) {
          injectRoute({
            pattern: '/blog',
            entrypoint: '@oneie/plugin-blog/BlogIndex.astro',
          })
          injectRoute({
            pattern: '/blog/[slug]',
            entrypoint: '@oneie/plugin-blog/BlogPost.astro',
          })
        }
      },
    },
  })

  return {
    name: 'plugin-blog',
    tier: 'free',
    config: undefined,
    integration,
    entitlement: undefined,
    serves: undefined,
  }
}

export type { OneBlogConfig as BlogConfig }

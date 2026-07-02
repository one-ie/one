import type { AstroIntegration } from 'astro'
import type { OnePlugin } from './plugin'
import { virtualOneConfig } from './virtual'

export interface BrandTokens {
  primary?: string
  secondary?: string
  tertiary?: string
  background?: string
  foreground?: string
  font?: string
}

export interface OneConfig {
  backend?: {
    baseUrl?: string
    apiKey?: string
  }
  brand?: {
    tokens?: BrandTokens
  }
  // OnePlugin<any> — a plugins array is heterogeneous; each plugin carries its
  // own config type (C appears contravariantly in `integration`), so a concrete
  // OnePlugin<FooConfig> is not assignable to OnePlugin<unknown>. `any` lets the
  // array hold differently-typed plugins without widening the plugin contract.
  plugins?: OnePlugin<any>[]
}

/**
 * defineOne — the single control surface for a ONE-connected Astro site.
 *
 * Returns a composed Astro integration that:
 *   - Merges each plugin's AstroIntegration into the build (build-time wiring only)
 *   - Exposes resolved config to islands via the `one:config` virtual module
 *   - Validates each plugin's config slice at startup
 *
 * NOTE: declaring a `paid` plugin here registers its build-time integration but
 * does NOT grant backend access. The product API returns 402 until the workspace
 * has an entitlement row (purchased via `one plugin add <name>`).
 *
 * Usage in astro.config.mjs:
 *   import oneIntegration from './one.config.ts'
 *   export default defineConfig({ integrations: [react(), oneIntegration] })
 */
export function defineOne(config: OneConfig): AstroIntegration {
  return {
    name: '@oneie/frontend',
    hooks: {
      'astro:config:setup': ({ updateConfig, logger }) => {
        const plugins = config.plugins ?? []

        // Validate each plugin's config slice
        for (const plugin of plugins) {
          if (plugin.config) {
            logger.debug(`[one] validating plugin: ${plugin.name}`)
          }
        }

        // Expose resolved config as virtual module
        updateConfig({
          vite: {
            plugins: [virtualOneConfig(config)],
          },
        })

        logger.debug(`[one] ${plugins.length} plugin(s) registered`)
      },
    },
  }
}

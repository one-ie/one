import type { AstroIntegration } from 'astro'
import type { ZodType } from 'zod'

/**
 * A ONE plugin — the build-time contract every plugin satisfies.
 *
 * `tier` determines what the plugin ships:
 *   free      — integration only, source in repo, no key needed
 *   connected — integration injects a served <script> tag (chat/track); needs a workspace key
 *   paid      — entitlement + serves: backend returns 402 without the claim; UI loads from one.ie
 */
export interface OnePlugin<C = unknown> {
  name: string
  tier: 'free' | 'connected' | 'paid'
  config?: ZodType<C>
  integration?: (config: C) => AstroIntegration
  entitlement?: string
  serves?: string
}

/** Factory function type — plugins export a function that returns OnePlugin */
export type OnePluginFactory<C = unknown> = (config?: Partial<C>) => OnePlugin<C>

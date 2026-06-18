import type { OneConfig } from './config'

const VIRTUAL_ID = 'one:config'
const RESOLVED_ID = '\0one:config'

/** Vite plugin that exposes resolved OneConfig as a virtual module `one:config`. */
export function virtualOneConfig(config: OneConfig) {
  const resolved = JSON.stringify({
    backend: {
      baseUrl: config.backend?.baseUrl ?? 'https://one.ie',
      hasApiKey: Boolean(config.backend?.apiKey),
    },
    brand: config.brand ?? {},
    plugins: (config.plugins ?? []).map((p) => ({
      name: p.name,
      tier: p.tier,
      entitlement: p.entitlement,
      serves: p.serves,
    })),
  })

  return {
    name: 'vite-plugin-one-config',
    resolveId(id: string): string | undefined {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id: string): string | undefined {
      if (id !== RESOLVED_ID) return
      return `export default ${resolved}`
    },
  }
}

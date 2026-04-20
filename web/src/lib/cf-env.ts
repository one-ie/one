/**
 * Env accessor that works in both Cloudflare Workers and Node dev.
 * CF: imports from `cloudflare:workers`.
 * Node: falls back to `process.env` so local `astro dev` can read secrets from `.dev.vars`/`.env`.
 */

export async function getEnv(): Promise<Record<string, string>> {
  try {
    const mod = (await import('cloudflare:workers' as string)) as { env?: Record<string, string> }
    if (mod.env) return mod.env
  } catch {
    // cloudflare:workers unavailable (Node dev) — fall through
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env as Record<string, string>
  }
  return {}
}

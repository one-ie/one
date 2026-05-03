/**
 * Cloudflare env accessor for Astro 6.
 * locals.runtime.env throws in v13 — use cloudflare:workers import.
 */

export async function getEnv(): Promise<Record<string, string>> {
  try {
    const mod = (await import('cloudflare:workers' as string)) as { env?: Record<string, string> }
    if (mod.env) return mod.env
  } catch {
    // cloudflare:workers unavailable (Node dev)
  }
  return process.env as Record<string, string>
}

export async function getCfCtx(): Promise<{ waitUntil(p: Promise<unknown>): void } | null> {
  try {
    const mod = (await import('cloudflare:workers' as string)) as { ctx?: { waitUntil(p: Promise<unknown>): void } }
    return mod.ctx ?? null
  } catch {
    return null
  }
}

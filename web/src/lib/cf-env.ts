/**
 * Cloudflare env accessor for Astro 6.
 * locals.runtime.env throws in v13 — use cloudflare:workers import.
 */

export async function getEnv(): Promise<Record<string, string>> {
  try {
    const mod = (await import('cloudflare:workers' as string)) as { env?: Record<string, string> }
    if (mod.env) return mod.env
  } catch {
    // cloudflare:workers unavailable (Node dev) — fall through to process.env
  }
  return process.env as unknown as Record<string, string>
}

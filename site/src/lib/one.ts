/**
 * Server-only ONE backend client — the one place that knows how to key
 * @oneie/plugin-backend's oneClient() on Cloudflare.
 *
 * oneClient()'s built-in fallback reads import.meta.env.ONE_API_KEY, which is
 * always empty on Workers — secrets live in the cloudflare:workers env — so
 * the key must be passed explicitly. Do that here, once, instead of at every
 * call site.
 */
import { oneClient } from '@oneie/plugin-backend'
import { getEnv } from './cf-env'

export type OneClient = Awaited<ReturnType<typeof oneClient>>

/**
 * A keyed SubstrateClient, or null when ONE_API_KEY isn't set — standalone
 * mode. Callers render without backend data rather than crash, matching the
 * template's promise that the site runs before a workspace is connected.
 */
export async function one(): Promise<OneClient | null> {
  const env = await getEnv()
  if (!env.ONE_API_KEY) return null
  return oneClient({
    apiKey: env.ONE_API_KEY,
    // one.config.ts's convention is ONE_BASE_URL; `one onboard`/`one init`
    // write ONE_API_URL — accept both rather than silently defaulting.
    baseUrl: env.ONE_BASE_URL ?? env.ONE_API_URL ?? 'https://one.ie',
  })
}

/**
 * client.ask() resolves to an Outcome envelope even when the receiver ran —
 * timeout/dissolved/failure arrive as values, not rejections. Unwrap the
 * result and turn every non-result kind into a thrown error so callers can
 * use one try/catch for both transport and outcome failures.
 */
export function unwrap<T = Record<string, unknown>>(
  outcome: { kind: string; result?: unknown },
  receiver = 'ask',
): T {
  if (outcome.kind !== 'result') throw new Error(`${receiver} → ${outcome.kind}`)
  return outcome.result as T
}

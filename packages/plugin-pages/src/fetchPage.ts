// Reads one published page from a ONE workspace via the public `pages:view`
// receiver, over the existing /api/ask/:receiver dispatch. Draft/unpublished pages
// are filtered SERVER-SIDE (status='published' in the resolver SQL) — this helper
// never sees them; it returns null for any not-ok / error / non-result outcome.
//
// The /api/ask edge is gateway-guarded (isGatewayRequest): a foreign-origin,
// keyless request is 403'd unless GATEWAY_SERVICE_SECRET is unset on the target OR
// a Bearer token is present. `opts.apiKey` sends a Bearer so an external site can
// reach the receiver when the guard is armed. See text/page-editor-external-plan.md.
import type { PuckData } from './PageRenderer'

export type { PuckData }

export interface FetchPageOptions {
  /** Origin of the ONE deploy serving /api/ask. Default: https://one.ie */
  baseUrl?: string
  /** Optional workspace world-key sent as `Authorization: Bearer` when the ask edge guard is armed. */
  apiKey?: string
  /** Injectable fetch (tests). Default: the global fetch. */
  fetchImpl?: typeof fetch
}

interface AskEnvelope {
  outcome?: string
  result?: { ok?: boolean; data?: unknown; error?: string }
}

export async function fetchPage(
  ws: string,
  slug: string,
  opts: FetchPageOptions = {},
): Promise<PuckData | null> {
  const baseUrl = (opts.baseUrl ?? 'https://one.ie').replace(/\/$/, '')
  const doFetch = opts.fetchImpl ?? fetch
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.apiKey) headers['authorization'] = `Bearer ${opts.apiKey}`

  let res: Response
  try {
    res = await doFetch(`${baseUrl}/api/ask/pages:view`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: { slug: ws, page: slug } }),
    })
  } catch {
    return null
  }
  if (!res.ok) return null

  let env: AskEnvelope
  try {
    env = (await res.json()) as AskEnvelope
  } catch {
    return null
  }
  if (env.outcome !== 'result' || !env.result?.ok) return null
  return (env.result.data ?? null) as PuckData | null
}

// GitHub stars for the front page, read at the edge and cached.
//
// The page never fetches GitHub on a request that has a fresh copy: the count
// lives in the Cache API (caches.default on Cloudflare — no binding, so a clone
// with KV id "change-me" still works) for TTL_MS, and the page says how old
// the number is. When GitHub refuses (rate limit, outage) the last good count
// is served and labelled stale; with nothing cached the page shows no number.
//
// The repo comes from site config: SITE.repo in seo-site.ts, or the SITE_REPO
// var at runtime. A fresh clone has neither, so it shows no star count — never
// another project's.

export const TTL_MS = 10 * 60 * 1000
// The cached entry outlives the TTL so a GitHub refusal can still serve the
// last good count (labelled stale) instead of nothing.
const KEEP_S = 7 * 24 * 60 * 60
const FETCH_TIMEOUT_MS = 2500

export type Stars = {
  repo: string
  stars: number
  forks: number
  fetchedAt: number // ms since epoch, when GitHub answered
  source: 'cache' | 'github' | 'stale'
}

type CacheLike = {
  match(key: Request | string): Promise<Response | undefined>
  put(key: Request | string, res: Response): Promise<void>
}

export type ReadStarsDeps = {
  cache: CacheLike | null
  fetch: typeof fetch
  now: () => number
  waitUntil?: (p: Promise<unknown>) => void
  /** Optional read-only token. Workers share egress IPs, and GitHub allows 60
   *  unauthenticated requests an hour per IP; a token lifts that. Unset in a clone. */
  token?: string
}

/** The edge cache when there is one (Workers), else a per-process memory cache
 *  (astro dev on Node), so neither fetches GitHub on every request. */
const memory = new Map<string, string>()
export function edgeCache(): CacheLike {
  const c = (globalThis as { caches?: { default?: CacheLike } }).caches?.default
  if (c) return c
  return {
    async match(key) {
      const v = memory.get(String(typeof key === 'string' ? key : key.url))
      return v === undefined ? undefined : new Response(v)
    },
    async put(key, res) {
      memory.set(String(typeof key === 'string' ? key : key.url), await res.text())
    },
  }
}

/** owner/name, or null when unset or malformed — a clone without a repo shows nothing. */
export function normalizeRepo(repo: string | undefined | null): string | null {
  const r = (repo ?? '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/+$/, '')
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r) ? r : null
}

const keyFor = (repo: string) => `https://github-stars.cache/${repo.toLowerCase()}`

export async function readStars(repoInput: string | undefined | null, deps: ReadStarsDeps): Promise<Stars | null> {
  const repo = normalizeRepo(repoInput)
  if (!repo) return null
  const key = keyFor(repo)

  let cached: Omit<Stars, 'source'> | null = null
  if (deps.cache) {
    try {
      const hit = await deps.cache.match(key)
      if (hit) cached = (await hit.json()) as Omit<Stars, 'source'>
    } catch {
      cached = null
    }
  }
  if (cached && deps.now() - cached.fetchedAt < TTL_MS) return { ...cached, source: 'cache' }

  // Expired but present, and the platform can finish work after the response:
  // answer with the cached count now and refresh behind it. Only a cold cache
  // waits on GitHub. The age label reads fetchedAt, so it stays honest.
  if (cached && deps.waitUntil) {
    deps.waitUntil(refresh(repo, key, deps).catch(() => null))
    return { ...cached, source: 'cache' }
  }
  return (await refresh(repo, key, deps)) ?? (cached ? { ...cached, source: 'stale' } : null)
}

async function refresh(repo: string, key: string, deps: ReadStarsDeps): Promise<Stars | null> {
  try {
    const res = await deps.fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'one-template-site',
        ...(deps.token ? { authorization: `Bearer ${deps.token}` } : {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`github ${res.status}`)
    const body = (await res.json()) as { stargazers_count?: unknown; forks_count?: unknown }
    if (typeof body.stargazers_count !== 'number') throw new Error('github: no stargazers_count')
    const fresh = {
      repo,
      stars: body.stargazers_count,
      forks: typeof body.forks_count === 'number' ? body.forks_count : 0,
      fetchedAt: deps.now(),
    }
    if (deps.cache) {
      const put = deps.cache
        .put(key, new Response(JSON.stringify(fresh), {
          headers: { 'content-type': 'application/json', 'cache-control': `max-age=${KEEP_S}` },
        }))
        .catch(() => {})
      await put
    }
    return { ...fresh, source: 'github' }
  } catch {
    return null
  }
}

/** "just now" · "4 min ago" · "2 h ago" — how old the number on the page is. */
export function ageLabel(fetchedAt: number, now: number): string {
  const min = Math.max(0, Math.floor((now - fetchedAt) / 60000))
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  return h < 48 ? `${h} h ago` : `${Math.floor(h / 24)} days ago`
}

/** The line under the count: what it is, how old, and that it is cached. */
export function starsNote(s: Stars, now: number): string {
  const age = ageLabel(s.fetchedAt, now)
  if (s.source === 'stale') return `Last read from GitHub ${age}. GitHub is not answering, so this is the cached number.`
  return `Read from GitHub ${age}, cached for ${TTL_MS / 60000} minutes.`
}

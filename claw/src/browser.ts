/**
 * Browser tool — fetch a URL and extract structured content
 * Cache in KV for 5 minutes to avoid duplicate fetches
 */

export interface BrowseResult {
  url: string
  title: string
  summary: string
  facts: string[]
  cached?: boolean
  error?: string
}

const CACHE_TTL = 300 // 5 minutes in seconds

// Extract <title> tag content
function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return match ? match[1].trim() : ''
}

// Strip HTML tags, collapse whitespace
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract first 2-3 complete sentences from plain text
function extractSummary(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  return sentences.slice(0, 3).join(' ').trim().slice(0, 500) // hard cap
}

// Extract bullet-like lines from raw HTML (*, -, •, numbered)
function extractFacts(html: string): string[] {
  const lines = html
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')

  const bullets: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[•\-*]/.test(trimmed) || /^\d+[.)]/.test(trimmed)) {
      const clean = trimmed.replace(/^[•\-*\d.)]+\s*/, '').trim()
      if (clean.length > 10 && clean.length < 200) {
        bullets.push(clean)
      }
    }
    if (bullets.length >= 5) break
  }
  return bullets
}

// KV cache key for a URL
function cacheKey(url: string): string {
  return `browser:${url.slice(0, 200)}`
}

export const browser = {
  fetch: async (url: string, kv?: KVNamespace): Promise<BrowseResult> => {
    // Validate URL shape before hitting network
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return { url, title: '', summary: '', facts: [], error: 'Invalid URL' }
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { url, title: '', summary: '', facts: [], error: 'Only http/https supported' }
    }

    // Check KV cache
    if (kv) {
      const cached = await kv.get(cacheKey(url))
      if (cached) {
        try {
          return { ...JSON.parse(cached), cached: true }
        } catch {
          // fall through to fresh fetch
        }
      }
    }

    // Fetch with 5s timeout
    let html: string
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ONE-Claw/1.0 (content-extraction)' },
      })
      clearTimeout(timer)
      if (!res.ok) {
        return { url, title: '', summary: '', facts: [], error: `HTTP ${res.status}` }
      }
      html = await res.text()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'fetch failed'
      return { url, title: '', summary: '', facts: [], error: msg }
    }

    // Extract content
    const title = extractTitle(html)
    const bodyText = stripHtml(html)
    const summary = extractSummary(bodyText)
    const facts = extractFacts(html)

    const result: BrowseResult = { url, title, summary, facts }

    // Write to KV cache (non-fatal if fails)
    if (kv) {
      try {
        await kv.put(cacheKey(url), JSON.stringify(result), { expirationTtl: CACHE_TTL })
      } catch {
        // KV unavailable or overquota — ignore, still return fresh result
      }
    }

    return result
  },
}

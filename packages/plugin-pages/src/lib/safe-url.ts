// Ported verbatim from one.ie/web/src/lib/safe-url.ts
//
// Allowlist a URL's scheme before it is used as an href. Puck page content is
// workspace-owner-authored but rendered to the public with no login — a
// javascript:/data:/vbscript: URL stored in an href would execute script in
// every visitor's browser on every site that installs this package. Returns
// the URL only when it parses to a safe scheme, otherwise undefined so the
// caller drops the link.
const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export function safeHref(url?: string | null): string | undefined {
  if (!url) return undefined
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://one.ie'
    const parsed = new URL(url, base)
    return SAFE_SCHEMES.has(parsed.protocol) ? url : undefined
  } catch {
    return undefined
  }
}

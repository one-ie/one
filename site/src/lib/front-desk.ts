/**
 * The client site's front desk, in one plain module: the chat embed tag, the
 * lead form's call to lead:capture, the catalogue the desk quotes from, and the
 * site's llms.txt. No astro:, no cloudflare: and no SDK import, so a test can
 * run every piece against the real receivers (the client-site test upstream).
 *
 * Why the form posts to this site and not to one.ie: the site lives on the
 * client's own domain, and a browser POST from there to one.ie is cross-origin.
 * The site's own route (/api/lead) calls lead:capture server-side with the
 * site's key, the same way /api/newsletter/subscribe calls audience:subscribe.
 */

export interface FrontDeskConfig {
  ws: string
  agent: string
  page: string
  enabled: boolean
  view: 'icon' | 'half' | 'full' | 'rail' | 'split'
  position: 'left' | 'right'
  greeting?: string
}

/** The chat.js tag's attributes, or null when the front desk is off. */
export function embedAttrs(cfg: FrontDeskConfig): Record<string, string> | null {
  if (!cfg.enabled || !cfg.ws || !cfg.agent) return null
  return {
    src: 'https://one.ie/c/chat.js',
    'data-agent': cfg.agent,
    'data-ws': cfg.ws,
    'data-view': cfg.view,
    'data-position': cfg.position,
    ...(cfg.greeting ? { 'data-greeting': cfg.greeting } : {}),
  }
}

// lead:capture's own limits (the receiver's contract), checked here
// first so a bad form costs no call.
const MAX_FIELDS = 12
const MAX_VALUE_LEN = 2000
// A phone is digits and the marks people write between them; 32 covers an extension.
const PHONE = /^[0-9+()\-.\s/x#ext]{3,32}$/i
const PHONE_DIGITS_MIN = 5
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const EMAIL_MAX = 254
const ND = /\p{Nd}/u
/**
 * A phone as plain ASCII: NFKC folds full-width forms (＋３５３ → +353), and any
 * other decimal digit (Arabic-Indic, Persian, Thai, Devanagari …) becomes 0-9 by
 * its place in its own run of ten. Letters stay letters, so the check still refuses them.
 * Any run of whitespace (a newline, a tab) becomes one space, so a phone is one line.
 */
export function plainPhone(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/\p{Nd}/gu, (d) => {
      const cp = d.codePointAt(0)!
      if (cp < 128) return d
      let start = cp
      while (start > 0 && ND.test(String.fromCodePoint(start - 1))) start--
      return String((cp - start) % 10)
    })
    .replace(/\s+/g, ' ')
    .trim()
}
/** The hidden field ContactForm renders; a person never fills it, a form-filling bot does. */
export const HONEYPOT = 'company_website'

export type LeadRequest =
  | { ok: true; body: { page: string; workspace: string; fields: Record<string, string> } }
  | { ok: false; error: string }

/** The lead:capture body for a form submit, or the reason it is refused. */
export function leadCaptureRequest(input: unknown, cfg: FrontDeskConfig): LeadRequest {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'bad_request: fields required' }
  const raw = input as Record<string, unknown>
  if (raw[HONEYPOT] !== undefined && String(raw[HONEYPOT]).trim() !== '') return { ok: false, error: 'rejected' }
  const fields: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (k === HONEYPOT || v === undefined || v === null) continue
    if (typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'boolean') return { ok: false, error: `bad_field: ${k}` }
    const s = String(v).trim()
    if (s.length > MAX_VALUE_LEN) return { ok: false, error: 'value_too_long' }
    if (s) fields[k.slice(0, 64)] = s
  }
  if (Object.keys(fields).length > MAX_FIELDS) return { ok: false, error: 'too_many_fields' }
  const email = fields['email']
  if (email !== undefined && (email.length > EMAIL_MAX || !EMAIL.test(email))) return { ok: false, error: 'bad_email' }
  if (fields['phone'] !== undefined) fields['phone'] = plainPhone(fields['phone'])
  const phone = fields['phone']
  if (phone !== undefined && (!PHONE.test(phone) || phone.replace(/\D/g, '').length < PHONE_DIGITS_MIN)) return { ok: false, error: 'bad_phone' }
  if (!fields['name'] && !fields['phone']) return { ok: false, error: 'name_or_phone_required' }
  return { ok: true, body: { page: cfg.page, workspace: cfg.ws, fields } }
}

/**
 * A per-visitor-IP limit on the form. Every stranger rides the site's one key, so
 * without it one bot fills the client's CRM and fires its follow-ups. The store
 * is the site's KV (a fixed one-minute window per IP); a post with no IP shares
 * one bucket, never an unlimited one. KV is not atomic, so a burst can pass one
 * or two over: a brake on a flood, not an exact count.
 */
export const LEAD_LIMIT_PER_MINUTE = 5

export interface CounterStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

export async function allowLead(store: CounterStore, ip: string, now = Date.now()): Promise<{ ok: boolean; retryAfter: number }> {
  const minute = Math.floor(now / 60_000)
  const key = `lead-rl:${(ip || 'no-ip').slice(0, 64)}:${minute}`
  const seen = Number((await store.get(key)) ?? 0) || 0
  const retryAfter = 60 - Math.floor((now % 60_000) / 1000)
  if (seen >= LEAD_LIMIT_PER_MINUTE) return { ok: false, retryAfter }
  await store.put(key, String(seen + 1), { expirationTtl: 120 })
  return { ok: true, retryAfter: 0 }
}

type Outcome = { kind: string; result?: unknown }
export type Ask = (receiver: string, data: Record<string, unknown>) => Promise<Outcome>

/**
 * The form route's whole answer. 200 only when lead:capture filed the lead; a
 * refusal comes back with its name, so the visitor is never thanked for a lead
 * that went nowhere. `ask` is null when the site has no ONE key.
 */
export async function captureLead(
  ask: Ask | null,
  input: unknown,
  cfg: FrontDeskConfig,
): Promise<{ status: number; json: { ok: boolean; error?: string } }> {
  const req = leadCaptureRequest(input, cfg)
  if (!req.ok) return { status: 400, json: { ok: false, error: req.error } }
  if (!ask) return { status: 503, json: { ok: false, error: 'backend_not_connected' } }
  let out: Outcome
  try {
    out = await ask('lead:capture', req.body)
  } catch (e) {
    return { status: 502, json: { ok: false, error: e instanceof Error ? e.message : 'lead_capture_failed' } }
  }
  if (out.kind !== 'result') return { status: 502, json: { ok: false, error: `lead:capture ${out.kind}` } }
  const r = (out.result ?? {}) as { ok?: boolean; error?: string }
  if (r.ok !== true) return { status: 422, json: { ok: false, error: r.error ?? 'lead_not_captured' } }
  return { status: 200, json: { ok: true } }
}

export interface CatalogueItem { pid: string; name: string; description: string; quote: string | null }

type ListedPrice = { unit_amount: number; currency: string; is_default?: number }
type ListedProduct = { pid: string; name: string; description?: string | null; prices?: ListedPrice[] }

/** A minor-unit amount as a person says it — the same rule the front desk quotes by. */
export function formatQuote(unitAmount: number, currency: string): string {
  const code = (currency || 'eur').toUpperCase()
  try {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).format(unitAmount / 100)
  } catch {
    return `${(unitAmount / 100).toFixed(2)} ${code}`
  }
}

/** products:list's answer as the lines the site shows; anything else is an empty catalogue. */
export function catalogueFromProducts(listed: unknown): CatalogueItem[] {
  const products = (listed as { products?: unknown } | null)?.products
  if (!Array.isArray(products)) return []
  return (products as ListedProduct[]).map((p) => {
    const price = (p.prices ?? []).find((x) => x.is_default) ?? (p.prices ?? [])[0]
    return {
      pid: p.pid,
      name: p.name,
      description: p.description ?? '',
      quote: price ? formatQuote(Number(price.unit_amount), price.currency) : null,
    }
  })
}

/** The client's catalogue from ONE, or [] when the site has no key or the read fails. */
export async function readCatalogue(ask: Ask | null, cfg: FrontDeskConfig): Promise<CatalogueItem[]> {
  if (!ask || !cfg.ws) return []
  try {
    const out = await ask('products:list', { slug: cfg.ws })
    return out.kind === 'result' ? catalogueFromProducts(out.result) : []
  } catch {
    return []
  }
}

/** The site's llms.txt: who the business is, what it sells and at what price, and where to reach it. */
export function siteLlmsTxt(o: {
  name: string
  url: string
  description: string
  catalogue: Array<{ name: string; description?: string; quote: string | null }>
}): string {
  // One line per fact: a newline in a name or description must never start a new line.
  const one = (s: string) => s.replace(/\s+/g, ' ').trim()
  const base = one(o.url).replace(/\/$/, '')
  const lines = [`# ${one(o.name)}`, '', `> ${one(o.description)}`, '', '## Catalogue', '']
  if (o.catalogue.length === 0) lines.push(`- ${base}/catalogue: the catalogue is not published yet`)
  for (const c of o.catalogue) {
    const price = one(c.quote ?? 'price on request')
    const desc = c.description ? one(c.description) : ''
    lines.push(`- ${one(c.name)}: ${price}${desc ? ` — ${desc}` : ''}`)
  }
  lines.push(
    '',
    `Full catalogue: ${base}/catalogue`,
    '',
    '## Talk to us',
    '',
    `- ${base}/contact: the contact form; a person or our front desk replies`,
    '- The chat on every page is our front desk: it answers, qualifies and books at any hour',
    '',
  )
  return lines.join('\n')
}

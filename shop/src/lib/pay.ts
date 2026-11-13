// Every way this shop takes money, in one file you can read in two minutes.
//
//   Crypto: pay.one.ie mints a signed link that names YOUR addresses. The buyer
//           sends USDC (or the chain's own coin) straight to them. pay.one.ie
//           stores nothing and never holds the money.
//   Card:   a Stripe Checkout Session on YOUR Stripe account, made with your own
//           secret key. No platform fee is added here; Stripe takes its fee.

export interface Wallet {
  sui?: string
  evm?: string
  sol?: string
}

export interface Product {
  slug: string
  name: string
  /** cents */
  price: number
  description?: string
}

export interface ShopConfig {
  name: string
  slug: string
  wallet: Wallet
  products: Product[]
  card: boolean
  badge: boolean
  ref?: string
  currency?: string
}

/** Which pay.one.ie chains each address receives on. One EVM address is valid on Base and Ethereum. */
export const RAILS: Record<keyof Wallet, readonly string[]> = {
  sui: ['SUI'],
  evm: ['BASE', 'ETH'],
  sol: ['SOL'],
}

export function treasuriesFor(wallet: Wallet): Record<string, string> {
  const out: Record<string, string> = {}
  for (const chain of Object.keys(RAILS) as (keyof Wallet)[]) {
    const address = wallet[chain]?.trim()
    if (!address) continue
    for (const rail of RAILS[chain]) out[rail] = address
  }
  return out
}

/** The merchant name a link carries: the one configured, else one derived from the owner's address. */
export function merchantSlugFor(configured: string | undefined, wallet: Wallet): string {
  const named = (configured ?? '').trim()
  if (named && named !== 'my-shop') return named.slice(0, 64)
  const address = wallet.evm || wallet.sui || wallet.sol || ''
  const tail = address.replace(/^0x/i, '').slice(0, 10).toLowerCase()
  return tail ? `shop-${tail}` : 'shop'
}

export function findProduct(products: Product[], slug: unknown): Product | null {
  if (typeof slug !== 'string') return null
  const p = products.find((x) => x.slug === slug)
  return p && Number.isInteger(p.price) && p.price > 0 ? p : null
}

export type LinkRequest =
  | { ok: true; body: { protocol: 'payment_link_create'; data: Record<string, unknown> } }
  | { ok: false; error: 'no_wallet' | 'invalid_amount' }

export function linkRequest(input: { wallet: Wallet; amountCents: number; product: string; merchantSlug: string; referrer?: string }): LinkRequest {
  const treasuries = treasuriesFor(input.wallet)
  if (Object.keys(treasuries).length === 0) return { ok: false, error: 'no_wallet' }
  const amount = Math.round(Number(input.amountCents))
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'invalid_amount' }
  return {
    ok: true,
    body: {
      protocol: 'payment_link_create',
      data: {
        amount,
        unit: 'usd',
        product: (input.product || 'Payment').slice(0, 256),
        merchantSlug: input.merchantSlug,
        chains: Object.keys(treasuries),
        treasuries,
      },
    },
  }
}

/** Mint a crypto payment link. Returns the URL the buyer pays at. */
export async function createCryptoLink(req: LinkRequest & { ok: true }, payUrl = 'https://pay.one.ie'): Promise<string> {
  const res = await fetch(`${payUrl.replace(/\/$/, '')}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  })
  const body = (await res.json().catch(() => ({}))) as { success?: boolean; data?: { url?: string }; error?: { message?: string } }
  if (!res.ok || !body.success || !body.data?.url) throw new Error(body.error?.message ?? `pay.one.ie answered ${res.status}`)
  return body.data.url
}

/** The form a Stripe Checkout Session is created from. No application fee: the sale is the owner's. */
export function checkoutForm(p: Product, origin: string, currency = 'usd'): URLSearchParams {
  const f = new URLSearchParams()
  f.set('mode', 'payment')
  f.set('line_items[0][quantity]', '1')
  f.set('line_items[0][price_data][currency]', currency)
  f.set('line_items[0][price_data][unit_amount]', String(p.price))
  f.set('line_items[0][price_data][product_data][name]', p.name)
  if (p.description) f.set('line_items[0][price_data][product_data][description]', p.description.slice(0, 500))
  f.set('success_url', `${origin}/thanks?paid=card`)
  f.set('cancel_url', `${origin}/`)
  f.set('metadata[product]', p.slug)
  return f
}

export async function createCardCheckout(secretKey: string, p: Product, origin: string, currency = 'usd'): Promise<string> {
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: checkoutForm(p, origin, currency),
  })
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: { message?: string } }
  if (!res.ok || !body.url) throw new Error(body.error?.message ?? `Stripe answered ${res.status}`)
  return body.url
}

/** Server env on Cloudflare (and in `astro dev`, which runs workerd). */
export async function serverEnv(): Promise<Record<string, string | undefined>> {
  try {
    const mod = (await import('cloudflare:workers' as string)) as { env?: Record<string, string> }
    if (mod.env) return mod.env
  } catch {
    // not on workerd
  }
  return {}
}

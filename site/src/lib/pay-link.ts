// The request this site sends pay.one.ie to mint a payment link: pure, so the
// money mapping is testable without a network or a wallet.
//
// Three rules, each a bug it replaces:
//   1. One EVM address is valid on Base AND Ethereum. Offer both (Base first:
//      its gas is cents, Ethereum's is dollars). Sending it as ETH only hid the
//      cheapest USDC rail from every buyer.
//   2. A link names its merchant. Every site used to fall back to 'one-site', so
//      every stranger's sales read as one merchant. The fallback is now derived
//      from the owner's own address, unique per owner with no config.
//   3. pay.one.ie reads `webhook` and `metadata` from `options`. Sent at the top
//      level they were dropped without a word, so connected mode never reported
//      a single payment.
//
// The buyer picks USDC or the chain's own coin on pay.one.ie's page, which
// selects USDC by default. Money goes straight to the addresses below; nothing
// here, and nothing at pay.one.ie, holds it.

export interface SiteWallet {
  sui?: string
  evm?: string
  sol?: string
  btc?: string
}

/** Which pay.one.ie chain codes each address can receive on. */
export const RAILS: Record<keyof SiteWallet, readonly string[]> = {
  sui: ['SUI'],
  evm: ['BASE', 'ETH'],
  sol: ['SOL'],
  btc: ['BTC'],
}

export function treasuriesFor(wallet: SiteWallet): Record<string, string> {
  const out: Record<string, string> = {}
  for (const chain of Object.keys(RAILS) as (keyof SiteWallet)[]) {
    const address = wallet[chain]?.trim()
    if (!address) continue
    for (const rail of RAILS[chain]) out[rail] = address
  }
  return out
}

/** The merchant name a link carries: the one configured, else one derived from the owner's address. */
export function merchantSlugFor(configured: string | undefined, wallet: SiteWallet): string {
  const named = (configured ?? '').trim()
  if (named) return named.slice(0, 64)
  const address = wallet.evm || wallet.sui || wallet.sol || wallet.btc || ''
  const tail = address.replace(/^0x/i, '').slice(0, 10).toLowerCase()
  return tail ? `site-${tail}` : 'site'
}

export interface LinkInput {
  wallet: SiteWallet
  amountCents: number
  product: string
  merchantSlug: string
  webhook?: string
  metadata?: Record<string, unknown>
}

export type LinkRequest =
  | { ok: true; body: { protocol: 'payment_link_create'; data: Record<string, unknown> } }
  | { ok: false; error: 'no_wallet' | 'invalid_amount' }

export function linkRequest(input: LinkInput): LinkRequest {
  const treasuries = treasuriesFor(input.wallet)
  if (Object.keys(treasuries).length === 0) return { ok: false, error: 'no_wallet' }
  const amount = Math.round(Number(input.amountCents))
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'invalid_amount' }
  const options: Record<string, unknown> = {}
  if (input.webhook) options.webhook = input.webhook
  if (input.metadata && Object.keys(input.metadata).length) options.metadata = input.metadata
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
        ...(Object.keys(options).length ? { options } : {}),
      },
    },
  }
}

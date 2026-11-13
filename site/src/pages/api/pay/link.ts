import type { APIRoute } from 'astro'
import { getEnv } from '../../../lib/cf-env'
import { readSelfHostedWallet } from '../../../lib/chain-balances'
import { linkRequest, merchantSlugFor } from '../../../lib/pay-link'
import { resolvePlan } from '../../../lib/plan-pricing'
import { resolveProduct } from '../../../lib/product-pricing'

export const prerender = false

// pay.one.ie's own protocol envelope — POST {payUrl}/ { protocol, data } ->
// { success, data, error? }. payment_link_create itself needs no signature
// (only the PAYER signs, at claim time), so this is safe to call directly
// with no ONE backend involved at all.
async function payProtocol(payUrl: string, protocol: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${payUrl.replace(/\/$/, '')}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ protocol, data }),
  })
  const body = (await res.json().catch(() => ({}))) as { success?: boolean; data?: Record<string, unknown>; error?: { message?: string; code?: string } }
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message ?? body.error?.code ?? `${protocol} → ${res.status}`)
  }
  return body.data ?? {}
}

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  const payUrl = (env.PAY_URL as string | undefined) ?? 'https://pay.one.ie'

  let body: { amountCents?: number; product?: string; planId?: string; productId?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }
  // Same anti-tamper posture as create-intent.ts: a named plan's price is
  // resolved server-side, never taken from the client, so a plan's crypto
  // price can't drift from its Stripe price or be spoofed by the buyer.
  const plan = resolvePlan(body.planId)
  // A catalog product (site/src/content/products/*.md) resolves the same way —
  // server-side only, and from its OWN field (productId), never from `product`
  // (the free-text "For" description on the ad-hoc path). Keeping them separate
  // means a buyer's free-text description can never accidentally — or
  // deliberately — match a catalog slug and hijack the price they're charged.
  const catalogProduct = plan ? null : await resolveProduct(body.productId)
  // NB: despite the name, this "amount" is cents (matches the non-plan/product
  // branch below, which passes body.amountCents straight through) — the
  // pay.one.ie payment_link_create protocol takes an integer cents count
  // regardless of unit:'usd' (confirmed against links.ts's own reader:
  // `usdAmount = payload.a / 100` when unit==='usd').
  const amount = plan ? plan.cents : catalogProduct ? catalogProduct.cents : Number(body.amountCents ?? 0)
  const product = plan
    ? plan.label
    : catalogProduct
      ? catalogProduct.label
      : (String(body.product ?? '').slice(0, 256) || 'Payment')
  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ error: 'amountCents must be > 0' }, { status: 400 })
  }

  // This site's own self-hosted wallet (.dev.vars, from `one wallet keygen`)
  // becomes the link's treasuries — the payer picks which chain to pay on;
  // funds land directly in the addresses /wallet displays. No ONE_API_KEY
  // needed: this never touches the substrate, only pay.one.ie.
  const wallet = readSelfHostedWallet(env)
  const merchantSlug = merchantSlugFor(env.AGENCY_WSID as string | undefined, wallet)

  // Connected mode: `one onboard` writes ONE_API_KEY + AGENCY_WSID to .dev.vars.
  // When present, opt this link into the webhook that one.ie's crypto-webhook.ts
  // verifies, so the workspace hears of a claim (no credits granted, no custody
  // change). Standalone mode sends neither, so the link is exactly the one it
  // always was.
  const oneApiKey = env.ONE_API_KEY as string | undefined
  const req = linkRequest({
    wallet, amountCents: amount, product, merchantSlug,
    webhook: oneApiKey ? `${(env.ONE_API_URL as string | undefined) ?? 'https://one.ie'}/api/pay/crypto-webhook` : undefined,
    metadata: oneApiKey ? { workspace: merchantSlug, product: catalogProduct?.slug } : undefined,
  })
  if (!req.ok) {
    return Response.json(
      req.error === 'no_wallet'
        ? { error: 'No wallet configured — run `one wallet keygen` and add the addresses to .dev.vars (see .dev.vars.example).' }
        : { error: 'amountCents must be > 0' },
      { status: req.error === 'no_wallet' ? 409 : 400 },
    )
  }

  try {
    const created = await payProtocol(payUrl, req.body.protocol, req.body.data)
    return Response.json({ url: created.url, qr: created.qr })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 })
  }
}

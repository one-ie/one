import type { APIRoute } from 'astro'
import config from '../../../one.config'
import { createCardCheckout, createCryptoLink, findProduct, linkRequest, merchantSlugFor, serverEnv } from '../../lib/pay'

export const prerender = false

// One form, two rails. The price is read from one.config.ts on the server, never
// from the form, so a buyer can never set their own price.
export const POST: APIRoute = async ({ request, redirect, url }) => {
  const form = await request.formData().catch(() => null)
  const product = findProduct(config.products, form?.get('product'))
  if (!product) return new Response('Unknown product', { status: 400 })
  const rail = form?.get('rail') === 'card' ? 'card' : 'crypto'

  try {
    if (rail === 'card') {
      const env = await serverEnv()
      const secret = env.STRIPE_SECRET_KEY
      if (!config.card || !secret) return new Response('Card payments are not set up on this shop yet.', { status: 503 })
      return redirect(await createCardCheckout(secret, product, url.origin, config.currency), 303)
    }
    const req = linkRequest({
      wallet: config.wallet,
      amountCents: product.price,
      product: product.name,
      merchantSlug: merchantSlugFor(config.slug, config.wallet),
    })
    if (!req.ok) return new Response(req.error === 'no_wallet' ? 'This shop has no wallet address yet.' : 'Bad price', { status: 503 })
    return redirect(await createCryptoLink(req), 303)
  } catch (err) {
    return new Response(`Payment could not start: ${err instanceof Error ? err.message : String(err)}`, { status: 502 })
  }
}

import type { APIRoute } from 'astro'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

type CfEnv = { SERVER_SECRET?: string }

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (await getEnv()) as CfEnv

  // Session via middleware (cookie or DEV_SLUG) takes priority; fall back to server token for SDK callers
  const sessionSlug = (locals as { slug?: string }).slug
  console.log(`[wallet] locals.slug=${sessionSlug ?? 'undef'} | localsKeys=${Object.keys(locals).join(',')}`)
  if (!sessionSlug) {
    if (!env.SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
    const auth = request.headers.get('Authorization') ?? ''
    if (auth !== `Bearer ${env.SERVER_SECRET}`) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  // TODO: W5 — read on-chain balances via passkey/provision flow:
  //   - SUI: query Sui RPC fullnode for coin balance by address
  //   - ETH: query eth_getBalance via public RPC
  //   - address: derive from provisioned key stored in KV/D1 after passkey commit
  // TODO: W5 — read Stripe Connect account status via stripe.accounts.retrieve()
  //   when STRIPE_ACCOUNT_ID is available in env

  return Response.json({
    address: null,
    balance: {
      sui: '0',
      eth: '0',
    },
    stripe: {
      status: 'not_connected',
    },
  })
}

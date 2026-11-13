// Your shop, in one file. Everything here is PUBLIC: it ships in your site.
// Never put a key or a secret here. The Stripe secret goes in as a Cloudflare
// secret (`npx wrangler secret put STRIPE_SECRET_KEY`), and your wallet's 24
// words stay sealed on your own machine in .one/.
//
// `npx oneie create shop` fills this file in for you.

import type { ShopConfig } from './src/lib/pay'

export default {
  name: 'My Shop',
  // The merchant name on your payment links. Unique to you.
  slug: 'my-shop',

  // Your receiving addresses: from `npx oneie wallet open`. Buyers pay these
  // directly. Nobody, ONE included, can move money out of them but you.
  //   sui -> USDC or SUI on Sui
  //   evm -> USDC or ETH on Base and Ethereum (one address, both chains)
  //   sol -> USDC or SOL on Solana (offered once pay.one.ie advertises Solana)
  wallet: {
    sui: '',
    evm: '',
    sol: '',
  },

  // Prices in cents. The price a buyer pays is always read from here, on the
  // server: a buyer can never set their own.
  products: [
    { slug: 'test', name: 'Test product', price: 100, description: 'One dollar, to see a real payment land.' },
  ],

  // "Pay by card" appears once STRIPE_SECRET_KEY is set. The money goes to YOUR
  // Stripe account. This code adds no platform fee; Stripe takes its own.
  card: true,

  // A small "Made with ONE — get your free key" line in the footer and on
  // checkout. It is how the next person finds the gift. Set false to remove it.
  badge: true,

  // Who showed you ONE (their shop's slug), signed into your shop's attestation
  // at /.well-known/one.json. Leave empty for none.
  ref: '',
} satisfies ShopConfig

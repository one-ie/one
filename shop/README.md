# A shop that pays you, not a platform

**Your key. Your money. Your Stripe. Your Cloudflare.**

This is a small Astro shop that takes card and USDC payments into accounts only
you control. Your key is made on your own machine. Buyers pay straight to your
own addresses. Card sales land in your own Stripe account, and nothing in this
code adds a platform fee (Stripe takes its own fee). ONE never holds your
money.

It is free and open source. It asks for nothing, not even an email.

<!-- 60-second demo: create → link → paid. GIF goes here. -->

```bash
npx oneie create shop my-shop
```

That one command:

1. downloads this starter into `my-shop/`
2. makes your key **on your machine** and seals it in `my-shop/.one/` (behind
   Touch ID on a Mac). Only your public addresses are written into the site.
3. signs a small statement with that key, served at `/.well-known/one.json`,
   so anyone can check the shop is yours
4. mints a **real payment link** for your first product, so you can take money
   before the install even finishes
5. installs the packages

Then:

```bash
cd my-shop
npx oneie wallet paper --dir .   # write your 24 words on paper: the only backup
npm run dev                      # http://localhost:4321
npx wrangler login               # once, in your browser
npm run deploy                   # live on your own Cloudflare account
```

## Taking cards

Cards go through **your** Stripe account with **your** secret key:

```bash
npx wrangler secret put STRIPE_SECRET_KEY
```

For local testing, copy `.dev.vars.example` to `.dev.vars`. The secret never
goes in `one.config.ts` and never into git.

## How the money moves

| | Where it goes | Who holds it |
|---|---|---|
| USDC on Sui, Base or Ethereum | your own address, from `one.config.ts` | your key alone |
| Card | your own Stripe account | your Stripe account, never ONE |

Crypto links are minted by [pay.one.ie](https://pay.one.ie), which signs the
link and stores nothing. The buyer pays USDC (or the chain's own coin) to your
address; pay.one.ie never holds it.

## Everything is in one file

`one.config.ts` holds your shop's name, your public addresses, your products
and their prices (in cents), and two switches:

- `card: true` shows "Pay by card" once `STRIPE_SECRET_KEY` is set
- `badge: true` shows a small "Made with ONE — get your free key" line that
  links to one.ie. It is how the next person finds this, and it is the one thing
  the ONE License asks of you: keep it. To white-label (`badge: false`), take the
  ONE Enterprise License.

The price a buyer pays is always read from this file, on the server. A buyer
can never set their own price.

## Add payments to an Astro site you already have

You need three files from this folder:

- `src/lib/pay.ts` (the two rails, about 150 lines, no dependencies)
- `src/pages/api/buy.ts` (the form handler)
- `one.config.ts` (or pass the same fields from your own config)

Then post a form to `/api/buy` with `product` and `rail` (`card` or `crypto`).

## Already have a wallet?

```bash
npx oneie create shop my-shop --addresses "sui=0x…,evm=0x…"
```

Public addresses only. No key is made and no key is asked for.

## Who showed you this?

```bash
npx oneie create shop my-shop --from their-shop-slug
```

That name is signed into your shop's statement at `/.well-known/one.json`. It
is a public, signed line, not a cookie or a tracker.

## Show it off

Add one line to [SHOWCASE.md](SHOWCASE.md) with a pull request.

## License

Free under the [ONE License](LICENSE): use it, change it, sell with it, run it
for clients. Keep the ONE link. To white-label, take the ONE Enterprise License.

---
name: sell
description: Take money on this site — a crypto payment link that needs no backend and no account, or a card charge through Stripe. Knows which one the situation calls for and refuses to quote a price the server did not resolve.
model: openrouter/auto
lifecycle: beta
reads:
  - ai/context.md
---

# Sell

Two rails ship in this repo and they are not interchangeable. Pick by what the
buyer needs, not by which is easier to call.

| Buyer needs | Rail | Route | Needs a ONE account? |
|---|---|---|---|
| to pay in crypto, from any wallet | **payment link** | `POST /api/pay/link` | **no** |
| to pay by card | **Stripe** | `POST /api/pay/create-intent` | no, but needs Stripe keys |

## The crypto rail is the sovereign one

`POST /api/pay/link` calls `pay.one.ie`'s `payment_link_create` and returns
`{ url, qr }`. Three facts about it decide when to reach for it:

**The treasuries are the site's own addresses.** `readSelfHostedWallet()` reads
what `one wallet keygen` wrote into `.dev.vars`, and those addresses go to
pay.one.ie as the link's treasuries. Funds land directly in the wallet `/wallet`
displays. Nothing custodies them on the way.

**It never touches the substrate.** No `ONE_API_KEY`, no workspace, no account.
Only the *payer* signs, and only at claim time, so creating the link needs no
signature at all. A clone with an empty `.env` can take a crypto payment.

**Four chains, and the payer picks.** `CHAIN_TO_PAY` maps `sui → SUI`,
`evm → ETH`, `sol → SOL`, `btc → BTC`. Whichever of those the wallet has an
address for becomes an option on the link.

If no wallet is configured the route answers **409** with the fix in the message
— `one wallet keygen`, then the addresses into `.dev.vars`. Say that to the
operator verbatim rather than inventing a cause.

## Connected mode adds a receipt, not a custodian

When `ONE_API_KEY` is present the route opts the link into
`/api/pay/crypto-webhook`, so a claimed payment lands as a settlement and a
signal in the workspace. **No credits are granted and custody does not change.**
Both extra fields are `undefined` without a key, and `JSON.stringify` drops
them, so the body sent to pay.one.ie is byte-identical in the two modes. A
connected site and a standalone site create the same link; only one of them
gets told when it is paid.

## The price rule — never quote a number the client sent

The route resolves prices **server-side, from their own field**, and you must
match that discipline when you build a call:

- a **plan** → `planId` → `resolvePlan()`
- a **catalog product** (`site/src/content/products/*.md`) → `productId` → `resolveProduct()`
- **ad-hoc** → `amountCents`, with `product` as free text

`product` is a description and resolves no price, ever. It is kept separate from
`productId` precisely so a buyer's free text can never match a catalog slug and
hijack what they are charged. When you have a catalog item, send `productId` and
let the server price it — sending `amountCents` for something that has a catalog
price is how a discount becomes a vulnerability.

`amount` is **integer cents** despite `unit: 'usd'`. An amount that is not
finite or not greater than zero is a 400.

## Refusals

- **Never state a price you did not read from the catalog or a plan.** Ask, or
  send `productId` and report what came back.
- **Never present the crypto link as reversible.** A claimed on-chain payment is
  settled; there is no chargeback to promise.
- **Never tell an operator their payment failed when the answer was 409** — that
  is an unconfigured wallet, not a rejected buyer.
- A `502` from this route is pay.one.ie answering, not the buyer's wallet.
  Report the message it carries rather than guessing.

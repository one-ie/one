# stripe — card payments inside `/chat`

> **Goal.** Two pricing cards. Pick one. One card input. Pay. Done.
>
> **Shape:** PaymentIntent with `payment_method_types: ['card']`, a
> `<PaymentElement>` with every field except the card itself disabled,
> Stripe.js lazy-loaded. Nothing else. No wallets, no Link, no address,
> no name, no email. The card is the form.
>
> **Reference:** [`one.ie/src/components/pay/card/`](../../one.ie/src/components/pay/card/) is
> the source pattern. Port the bones, drop the chrome.

---

## Classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | Two cards → pick → card form → confirm. No discovery. |
| Variance known | YES | One shape per file; ports map 1:1 from `one.ie/src/components/pay/card/`. |
| Exit scalar | YES | Stripe test card `4242 4242 4242 4242` succeeds end-to-end; Lighthouse `/chat` ≥ 95 (currently 100); zero design-rule violations from `.claude/hooks/design-check.sh`. |
| Files known | YES | 4 new files + 2 edits. Listed below. |

`mode: lean` · `lifecycle: construction`

> **Lighthouse guard.** `/chat` currently scores 100% (memory: `project_chat_lighthouse.md`).
> Stripe.js is ~120 KB gzipped — it must NOT load on `/chat` until the user
> opens the pay panel. Lazy-load via `React.lazy` + dynamic `loadStripe()`.
> Existing `<Chat client:idle fullPage />` hydration policy is preserved.

---

## Routing

```
user types "buy" or clicks pricing chip
  → Chat.tsx renders <PayPanel /> inline (lazy)
    → step 1: <PriceCards /> shows 2 plans
      → user clicks card  → emitClick('ui:pay:plan', {planId, amount})
    → step 2: lazy import StripeProvider + StripeCheckoutForm
      → POST /api/pay/stripe/create-intent { planId }
        → returns { clientSecret, amount }
      → <Elements stripe options={{clientSecret}}>
        → <PaymentElement />
        → user submits  → emitClick('ui:pay:card-submit')
          → stripe.confirmPayment({ redirect: 'if_required' })
            → success  → onSuccess(piId)
                       → POST /api/signal { receiver: 'substrate:pay', ... }
                       → render confirmation message in Chat
            → failure  → inline error
```

No new TypeDB entities. No D1 migrations. PaymentIntents are the source of
truth; substrate signal is fire-and-forget for pheromone (path: `pay → card → accept`).

---

## Source map (port from `one.ie` → `one-ie/one/web`)

| Source (`/Users/toc/Server/one.ie/...`) | Target (`/Users/toc/Server/one-ie/one/web/...`) | Notes |
|---|---|---|
| `src/components/pay/card/StripeProvider.tsx` (108 L) | `src/components/pay/StripeProvider.tsx` | Drop `--color-primary-mid` → `--color-primary`. Tokens-only per `design.md`. |
| `src/components/pay/card/StripeCheckoutForm.tsx` (177 L) | `src/components/pay/StripeCheckoutForm.tsx` | **Strip to ~60 LOC.** Drop `AddressElement`, security-badge row, trust-indicator row, all icons except the submit lock. PaymentElement options force card-only and hide every billing field. One submit button. One inline error line. That's the whole form. |
| `src/components/pay/card/StripeCheckoutWrapper.tsx` (207 L) | merged into `PayPanel.tsx` (below) | Inline the create-intent fetch + `<Elements>` wiring; drop ShippingAddress branch. |
| `src/pages/api/pay/stripe/create-intent.ts` (111 L) | `src/pages/api/pay/create-intent.ts` | **CF Worker port:** swap `import.meta.env.STRIPE_SECRET_KEY` → `getEnv(ctx).STRIPE_SECRET_KEY` per `web/src/pages/api/chat.ts` pattern. Replace mock `calculateOrderTotal` with the 2-plan price table. |
| `src/lib/stripe.ts` (10 L) | not needed | Inline. |
| `src/types/stripe.ts` (129 L) | inline `StripeElementsAppearance` type in `StripeProvider.tsx` | Don't drag the whole types file. |

---

## Locked decisions

- Currency `usd`. Single line item. No tax, no shipping, no address.
- `payment_method_types: ['card']` — disables wallets/Link explicitly. Card-only is the brief.
- Fulfilment is **webhook**, not client. Client `confirmPayment` resolution drives UX only.
- Workers runtime → `Stripe.createFetchHttpClient()` (no Node `https`).
- Idempotency-Key on `paymentIntents.create` = `SHA-256(planId + sessionId)` to dedupe double-clicks.
- Plan switch resets `clientSecret` (PI amount is immutable). Per-mount cache prevents re-fetch on re-pick.

---

## Polish budget (locked — three icons, one motion)

The whole UI is six visual elements. Anything beyond this is bloat.

| Element | Source | Where |
|---|---|---|
| `Zap` icon (Pro) | lucide via `<IconBadge tone="primary">` | PriceCards header |
| `Users` icon (Team) | lucide via `<IconBadge tone="tertiary">` | PriceCards header |
| `Check` mark on selected card | lucide via `<Icon>`, primary fill in 24px circle | PriceCards top-right |
| `Lock` on pay button | lucide via `<Icon size="sm">`, inline-flex with label | StripeCheckoutForm submit |
| `Loader2` while processing | lucide via `<Icon size="sm" className="animate-spin">` | StripeCheckoutForm submit |
| `CircleCheck` on success | lucide via `<Icon>`, tertiary tint in 36px circle | PayPanel done state |

**Motion:** card hover `-translate-y-0.5` + shadow swap (`--shadow-card` →
`--shadow-pop`) at `var(--ease)` (120ms). Nothing else animates.

**Card-network logos** (Visa/MC/Amex): Stripe's `<PaymentElement>` paints
them inside its own field as the user types. We don't add our own row.

---

## New files (4)

### 1. `web/src/components/pay/PriceCards.tsx`

Two cards, side-by-side on desktop, stacked on mobile. Each plan gets a
brand-tinted `<IconBadge>` for identity. Selected card shows a primary-fill
`Check` top-right (replaces the ring as the selection signal).

```tsx
import { Check, Users, Zap, type LucideIcon } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { IconBadge } from '@/components/ui/IconBadge'
import { emitClick } from '@/lib/ui-signal'

type Tone = 'primary' | 'secondary' | 'tertiary'

export const PLANS = [
  { id: 'pro',  name: 'Pro',  amountCents: 2900, period: '/mo',
    icon: Zap as LucideIcon, tone: 'primary' as Tone,
    features: ['Unlimited messages', 'Telegram + Discord', 'Priority support'] },
  { id: 'team', name: 'Team', amountCents: 9900, period: '/mo',
    icon: Users as LucideIcon, tone: 'tertiary' as Tone, highlight: true,
    features: ['Everything in Pro', '5 seats', 'Shared memory', 'Custom branding'] },
] as const
export type PlanId = typeof PLANS[number]['id']

interface Props { selected?: PlanId; onSelect: (id: PlanId, amountCents: number) => void }

export function PriceCards({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {PLANS.map((p) => {
        const active = selected === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => { emitClick('ui:pay:plan', { planId: p.id, amount: p.amountCents }); onSelect(p.id, p.amountCents) }}
            className="relative text-left bg-background rounded-2xl p-5 border transition hover:-translate-y-0.5"
            style={{
              borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
              boxShadow: active ? 'var(--shadow-pop)' : 'var(--shadow-card)',
              transitionDuration: 'var(--ease, 120ms)',
            }}
          >
            {active && (
              <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-on-primary inline-flex items-center justify-center">
                <Icon icon={Check} size="sm" />
              </span>
            )}
            <div className="flex items-center gap-3">
              <IconBadge icon={p.icon} tone={p.tone} size="md" />
              <h3 className="text-base font-bold">{p.name}</h3>
              {p.highlight && <span className="ml-auto text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary">Popular</span>}
            </div>
            <p className="mt-4">
              <span className="text-3xl font-bold tracking-tight">${(p.amountCents/100).toFixed(0)}</span>
              <span className="text-font/60 text-sm ml-1">{p.period}</span>
            </p>
            <ul className="mt-4 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-font/60">
                  <Icon icon={Check} size="sm" />{f}
                </li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>
  )
}
```

**Polish notes:** `hover:-translate-y-0.5` is the only motion (≤120ms via
`var(--ease)`). The selected card swaps `--shadow-card` → `--shadow-pop` —
subtle lift, same shape. Brand pill uses `bg-primary/15 text-primary`
(tinted, not filled) so it sits quietly until you look at it.

### 2. `web/src/components/pay/StripeProvider.tsx`

Direct port. Read `PUBLIC_STRIPE_PUBLISHABLE_KEY` from `import.meta.env`
(client-side, OK on Astro/Vite). Default appearance uses `--color-primary` /
`--color-background` / `--color-font` / `--color-destructive`.

### 3. `web/src/components/pay/StripeCheckoutForm.tsx`

Card-only. ~60 LOC. The PaymentElement options are the whole story:

```tsx
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'

const options: StripePaymentElementOptions = {
  layout: 'accordion',
  paymentMethodOrder: ['card'],
  wallets: { applePay: 'never', googlePay: 'never' },
  fields: { billingDetails: { name: 'never', email: 'never', phone: 'never', address: 'never' } },
  terms: { card: 'never' },
}

interface Props { amount: number; onSuccess: (id: string) => void; onError?: (m: string) => void }

export function StripeCheckoutForm({ amount, onSuccess, onError }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true); setErr(null)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    if (error) { setErr(error.message ?? 'Payment failed'); onError?.(error.message ?? 'failed') }
    else if (paymentIntent?.status === 'succeeded') onSuccess(paymentIntent.id)
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <PaymentElement options={options} />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg px-4 py-2.5 font-medium hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
        style={{ transitionDuration: 'var(--ease, 120ms)' }}
      >
        {busy ? (
          <><Icon icon={Loader2} size="sm" className="animate-spin" /> Processing…</>
        ) : (
          <><Icon icon={Lock} size="sm" /> Pay ${amount.toFixed(0)}</>
        )}
      </button>
    </form>
  )
}
```

No icons. No security row. No trust badges. The PaymentElement renders a
single card field (number · expiry · cvc inline). Stripe puts its own
"Powered by Stripe" mark in the element — that's enough trust signal.

### 4. `web/src/components/pay/PayPanel.tsx`

State machine (4 states: `pick → loading → pay → done`, plus `error`).
Wraps `PriceCards`, lazy-loads Stripe only when a plan is picked, caches
`clientSecret` per `planId` to avoid duplicate intents on re-pick, and
emits `ui:pay:*` signals throughout.

```tsx
import { CircleCheck } from 'lucide-react'
import { lazy, Suspense, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { PriceCards, type PlanId } from './PriceCards'
import { emitClick } from '@/lib/ui-signal'

const StripeProvider     = lazy(() => import('./StripeProvider').then(m => ({ default: m.StripeProvider })))
const StripeCheckoutForm = lazy(() => import('./StripeCheckoutForm').then(m => ({ default: m.StripeCheckoutForm })))

interface Props { onComplete?: (paymentIntentId: string, planId: PlanId) => void }

export function PayPanel({ onComplete }: Props) {
  const [plan, setPlan] = useState<{ id: PlanId; amountCents: number } | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const cache = useRef<Map<PlanId, string>>(new Map())   // planId → clientSecret (per-mount idempotency)

  const pick = async (id: PlanId, amountCents: number) => {
    setError(null)
    setPlan({ id, amountCents })
    const cached = cache.current.get(id)
    if (cached) { setClientSecret(cached); return }
    setLoading(true)
    setClientSecret(null)
    try {
      const r = await fetch('/api/pay/create-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id }),
      })
      if (!r.ok) {
        const msg = (await r.json().catch(() => ({}))).error || `HTTP ${r.status}`
        setError(msg); emitClick('ui:pay:error', { message: msg })
        return
      }
      const j = await r.json() as { clientSecret: string }
      cache.current.set(id, j.clientSecret)
      setClientSecret(j.clientSecret)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'network error'
      setError(msg); emitClick('ui:pay:error', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-2">
      <PriceCards selected={plan?.id} onSelect={pick} />
      {error && <p className="text-sm text-destructive my-2">{error}</p>}
      {plan && clientSecret && (
        <Suspense fallback={null}>
          <div className="bg-background rounded-2xl p-5 border mt-4" style={{ borderColor: 'var(--color-border)' }}>
            {done ? (
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-tertiary/15 inline-flex items-center justify-center">
                  <Icon icon={CircleCheck} size="md" className="text-tertiary" />
                </span>
                <div>
                  <p className="text-sm font-medium">Paid</p>
                  <p className="text-xs text-font/60 font-mono">{done}</p>
                </div>
              </div>
            ) : (
              <StripeProvider clientSecret={clientSecret}>
                <StripeCheckoutForm
                  key={plan.id}
                  amount={plan.amountCents / 100}
                  onSuccess={(piId) => {
                    emitClick('ui:pay:success', { paymentIntentId: piId, planId: plan.id, amount: plan.amountCents })
                    setDone(piId); onComplete?.(piId, plan.id)
                  }}
                  onError={(msg) => emitClick('ui:pay:error', { message: msg })}
                />
              </StripeProvider>
            )}
          </div>
        </Suspense>
      )}
    </div>
  )
}
```

> **Plan switching.** Clicking a different card calls `pick()` with the new
> id; if its `clientSecret` is cached we reuse it, otherwise we fetch a fresh
> intent. The `key={plan.id}` on `StripeCheckoutForm` forces a remount so
> the embedded PaymentElement re-binds to the new intent.

---

## API routes (2 new)

### `web/src/pages/api/pay/create-intent.ts`

CF Worker variant: `STRIPE_SECRET_KEY` from `getEnv(ctx)`, **fetch HTTP
client** (Workers has no Node `https`), idempotency key on create, server-side
amount lookup, no auth (entitlement is granted by webhook, not this call).

```ts
import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getCfCtx, getEnv } from '../../../lib/cf-env'

export const prerender = false

const PRICES: Record<string, number> = { pro: 2900, team: 9900 }

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export const POST: APIRoute = async ({ request }) => {
  const env = getEnv(getCfCtx())
  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  const { planId, sessionId } = await request.json() as { planId?: string; sessionId?: string }
  const amount = planId ? PRICES[planId] : undefined
  if (!amount) return Response.json({ error: 'invalid plan' }, { status: 400 })

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),     // REQUIRED on Workers
  })

  const idempotencyKey = await sha256Hex(`${planId}:${sessionId ?? request.headers.get('cf-ray') ?? crypto.randomUUID()}`)

  const pi = await stripe.paymentIntents.create(
    {
      amount, currency: 'usd',
      payment_method_types: ['card'],            // card-only, no wallets, no Link
      metadata: { planId },
    },
    { idempotencyKey },
  )
  return Response.json({ clientSecret: pi.client_secret, amount })
}
```

> Client should pass a stable `sessionId` (e.g. `crypto.randomUUID()` cached
> in `sessionStorage`) so retries from the same tab dedupe. Falls back to
> `cf-ray` per-request if absent.

### `web/src/pages/api/pay/webhook.ts`

Stripe webhook handler. **This is the authoritative source for fulfilment.**
Verifies the signature with `constructEventAsync` (Workers requires async — no
sync HMAC), maps events to `substrate:pay` signals, and is the only place a
plan should be marked active.

```ts
import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getCfCtx, getEnv } from '../../../lib/cf-env'

export const prerender = false

interface PayContent {
  rail: string; from: string; to: string; ref: string
  status: 'captured' | 'refunded' | 'failed' | 'disputed'
  provider: 'stripe'; planId?: string
}

async function emitPaySignal(opts: { amount: number } & PayContent, base: string): Promise<void> {
  await fetch(`${base}/api/signal`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receiver: 'substrate:pay',
      data: {
        weight: opts.amount,
        tags: ['pay', opts.rail, opts.status === 'refunded' ? 'refund' : opts.status === 'failed' ? 'fail' : 'accept'],
        content: { rail: opts.rail, from: opts.from, to: opts.to, ref: opts.ref, status: opts.status, provider: opts.provider, planId: opts.planId },
      },
    }),
  }).catch(() => {})
}

export const POST: APIRoute = async ({ request, url }) => {
  const env = getEnv(getCfCtx())
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'webhook not configured' }, { status: 503 })
  }
  const sig = request.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'missing stripe-signature' }, { status: 400 })

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
  })
  const body = await request.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET)   // async = Workers-safe
  } catch (e) {
    return Response.json({ error: 'invalid signature' }, { status: 400 })
  }

  const base = url.origin

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const planId = pi.metadata?.planId
      // TODO(next cycle): mark plan active for the user (D1 / TypeDB write keyed on planId + customer)
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: pi.id, status: 'captured', provider: 'stripe', planId, amount: pi.amount / 100 }, base)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: pi.id, status: 'failed', provider: 'stripe', planId: pi.metadata?.planId, amount: pi.amount / 100 }, base)
      break
    }
    case 'charge.refunded': {
      const ch = event.data.object as Stripe.Charge
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: ch.id, status: 'refunded', provider: 'stripe', amount: (ch.amount_refunded || ch.amount || 0) / 100 }, base)
      break
    }
    case 'charge.dispute.created': {
      const d = event.data.object as Stripe.Dispute
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: d.id, status: 'disputed', provider: 'stripe', amount: (d.amount || 0) / 100 }, base)
      break
    }
    default:
      break
  }

  return Response.json({ received: true })
}
```

**Redaction (Rule 7).** No `email`, `pan`, `cvc`, `cardholder_name`,
`billing_details.*` is ever forwarded to `substrate:pay`. Only
`{rail, from, to, ref, status, provider, planId, amount}` crosses the boundary.

**Local dev.**
```bash
stripe login
stripe listen --forward-to http://localhost:4321/api/pay/webhook
# copy the whsec_... it prints into web/dev.vars as STRIPE_WEBHOOK_SECRET
stripe trigger payment_intent.succeeded
```

**Prod registration.** In Stripe Dashboard → Webhooks → add endpoint
`https://<domain>/api/pay/webhook` with events:
`payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`,
`charge.dispute.created`. Copy signing secret → `wrangler secret put STRIPE_WEBHOOK_SECRET`.

> **Note.** `web/wrangler.toml` adds `PUBLIC_STRIPE_PUBLISHABLE_KEY` as a
> public var. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are secrets:
> ```
> wrangler secret put STRIPE_SECRET_KEY
> wrangler secret put STRIPE_WEBHOOK_SECRET
> ```
> `web/dev.vars` carries all three for local dev.

---

## Edits (2)

### `web/src/components/Chat.tsx`

Add a lazy `<PayPanel>` and a **sticky** intent state — the panel mounts on
the first matching user message and stays mounted (a "show me pricing" intent
shouldn't toggle off when the user types "I don't want to pay later"). Future
cycle replaces this with a model-callable `showPricing` tool returning a UI
part; for v1 a sticky regex is sufficient.

```tsx
const PayPanel = lazy(() => import('@/components/pay/PayPanel').then(m => ({ default: m.PayPanel })))
// …
const [showPay, setShowPay] = useState(false)
useEffect(() => {
  if (showPay) return
  const last = messages[messages.length - 1]
  if (last?.role !== 'user') return
  if (/\b(buy|upgrade|pay|subscribe|pricing|plans?)\b/i.test(getMessageText(last))) setShowPay(true)
}, [messages, showPay])

// …inside the conversation render, after MessageList:
{showPay && (
  <Suspense fallback={null}>
    <PayPanel onComplete={(piId) => sendMessage({ text: `Payment ${piId} confirmed — plan activates shortly.` })} />
  </Suspense>
)}
```

`STARTERS` gains `'Show pricing'` so users have a one-click path in.

`client:idle` on the chat island is preserved — `PayPanel` itself is lazy,
Stripe.js loads only when a plan is picked.

> **Future:** swap intent detection for a tool-call. Define `showPricing` as
> an `ai-sdk` tool returning `{type: 'pricing'}`; render `<PayPanel>` when
> the assistant message contains that part. Cleaner, model-driven, no regex.

### `web/wrangler.toml`

Add to `[vars]`:
```toml
PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_..."
```
And document the secret:
```
# wrangler secret put STRIPE_SECRET_KEY
```

---

## Dependencies

```bash
cd web
bun add stripe @stripe/stripe-js @stripe/react-stripe-js
```

`stripe` is server-only (used in API route). `@stripe/stripe-js` +
`@stripe/react-stripe-js` are client. `loadStripe()` lazy-fetches the
Stripe.js script — won't ship until `PayPanel` mounts.

---

## Design rules (mandatory — `.claude/rules/design.md`)

The post-tool-use design hook will reject the diff if any of these slip in.
The port from `one.ie` uses some banned tokens; rewrite during port:

| Banned in port source | Replace with |
|---|---|
| `bg-muted/50`, `text-muted-foreground` | `bg-foreground`, `text-font/60` |
| `border-destructive bg-destructive/10` `<Alert>` | inline `<div className="bg-destructive/10 text-destructive p-3 rounded-md">` |
| `--color-primary-mid` (CSS var) | `--color-primary` |
| `text-primary` for icons | `<Icon icon={…} />` inherits via `currentColor` |
| Inline lucide SVG / unicode glyphs | `import { X } from 'lucide-react'` + `<Icon>` |

Stripe Elements styles itself via the `appearance` object passed to
`<Elements>` — that's already wired to the CSS vars, so the embedded
PaymentElement matches the card surface automatically.

---

## UI signals (`.claude/rules/ui.md`)

Every onClick emits `ui:pay:*` before its handler.

| Receiver | Payload |
|---|---|
| `ui:pay:plan` | `{ planId, amount }` |
| `ui:pay:card-submit` | — (already in ported form) |
| `ui:pay:success` | `{ paymentIntentId, planId, amount }` (emit in `onSuccess`) |
| `ui:pay:error` | `{ message }` |

---

## Verify (W4 exit scalars)

**Bundle baseline.** Before any code change, capture the baseline:
```bash
cd web && bun run build
ls -la dist/_worker.js/*.js dist/client/_astro/*.js | sort -k5 -n > /tmp/bundle-before.txt
```
After the cycle, re-measure. Gate: `/chat` initial-chunk delta ≤ 0 KB
(PayPanel is lazy, must not load until intent fires). Total client JS
delta acceptable up to ~8 KB for the new pay/* chunk (not on /chat path).

**Build + smoke**
```bash
cd web
bun run build                       # must succeed
bun run preview                     # serves locally
stripe listen --forward-to http://localhost:4321/api/pay/webhook   # parallel terminal
```

**Manual checks** (test-mode keys):

1. `/chat` loads, Lighthouse Performance ≥ 95 (baseline 100). DevTools Network: no `stripe.js` request on initial load.
2. Type `pricing` → `PayPanel` mounts → two cards render. Stripe.js still not loaded.
3. Click `Pro` → POST to `/api/pay/create-intent` returns `{clientSecret, amount}` → Stripe.js loads → `PaymentElement` renders inside the card.
4. Click `Team` → second create-intent call (different idempotency key) → form remounts at $99.
5. Click `Pro` again → **no** new create-intent call (cached `clientSecret` reused).
6. Card `4242 4242 4242 4242` · future expiry · any CVC · any ZIP → confirmation message in chat with PI ref.
7. Card `4000 0000 0000 9995` (insufficient funds) → inline error rendered, panel stays interactive.
8. Card `4000 0027 6000 3184` (3DS required) → SCA modal renders, complete → success.
9. `stripe trigger payment_intent.succeeded` → webhook returns 200 → `substrate:pay` signal POSTs to `/api/signal` (check Worker logs).
10. `stripe trigger charge.refunded` → 200 → refund signal emitted with `tags: ['pay','card','refund']`.
11. Tamper test: `curl -X POST /api/pay/webhook -d 'foo'` → 400 invalid signature.
12. `bash .claude/hooks/design-check.sh` → zero violations.
13. Network panel: no `email`/`pan`/`cvc` field appears in any outbound `/api/signal` body (Rule 7 redaction).

---

## Out of scope (later cycles)

- **Subscriptions** (recurring billing) — uses `stripe.subscriptions` + `customer.subscription.*` events, separate flow.
- **Entitlement write** in webhook — the `payment_intent.succeeded` handler currently TODOs the plan-active write. Lands when there's a user record to attach to.
- **Customer binding** (`stripe.customers` ↔ unit) — out until auth ships.
- **AddressElement / shipping** — not needed for digital plans.
- **Apple Pay / Google Pay express buttons** — `automatic_payment_methods: enabled` surfaces wallets if the domain is verified in Stripe; explicit `<ExpressCheckout>` UI is later.
- **Multi-currency** — locked to `usd` v1.
- **Model-driven `showPricing` tool** — replaces sticky regex intent in a later cycle.
- **TypeDB persistence of payments** — `substrate:pay` signal is the path-strengthening trigger; full payment ledger entity is later.
- **Refund / dispute UI** — webhook records them as signals; admin UI is a separate plan.

---

## File tree (after this cycle)

```
web/
├── src/
│   ├── components/
│   │   ├── Chat.tsx                     (edit: add PayPanel lazy + intent check)
│   │   └── pay/                         (new)
│   │       ├── PayPanel.tsx             (new)
│   │       ├── PriceCards.tsx           (new)
│   │       ├── StripeProvider.tsx       (port from one.ie)
│   │       └── StripeCheckoutForm.tsx   (port from one.ie, minus AddressElement)
│   └── pages/
│       └── api/
│           └── pay/
│               ├── create-intent.ts     (new, CF Worker, idempotency + fetch http client)
│               └── webhook.ts           (new, async signature verify, 4 events → substrate:pay)
├── wrangler.toml                        (edit: add PUBLIC_STRIPE_PUBLISHABLE_KEY var)
├── dev.vars                             (edit: add 3 stripe keys for local dev)
└── package.json                         (edit: + stripe, @stripe/stripe-js, @stripe/react-stripe-js)
```

5 new files · 4 edits · 0 schema changes · 0 deletions.

**Secrets to provision before deploy:**
```
wrangler secret put STRIPE_SECRET_KEY      # sk_test_... then sk_live_...
wrangler secret put STRIPE_WEBHOOK_SECRET  # whsec_... from Stripe Dashboard webhook endpoint
```

---

## Close

When done, append to `one/learnings.md`:

```
- 2026-MM-DD · cycle 1 · gate · stripe inline pay panel ported to /chat (2-card pick → Elements form), Lighthouse held · rubric=0.NN · source=cycle
```

And tag pheromone `mode:lean` `lifecycle:construction`.

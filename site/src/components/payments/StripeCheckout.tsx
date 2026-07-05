import { useEffect, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe as StripeJs, type StripePaymentElementOptions } from '@stripe/stripe-js'
import { CreditCard, Check, Lock } from 'lucide-react'

/**
 * StripeCheckout — REAL Stripe Elements, not a preview.
 *
 * The flexible alternative to PhysicalCardCheckout.tsx: mounts Stripe's
 * single, all-in-one PaymentElement (cards, wallets, bank redirects —
 * whatever's enabled in the merchant's Stripe dashboard) against a
 * PaymentIntent from this site's own /api/pay/create-intent, themed
 * entirely through Stripe's appearance API mapped to the site's design
 * tokens. Reach for this when you want broad payment-method coverage with
 * minimal custom code; reach for PhysicalCardCheckout.tsx when you want a
 * bespoke, card-only, on-brand entry experience. /payments currently wires
 * up PhysicalCardCheckout — this component ships as the other option.
 *
 * Inline-style chrome (Tailwind classNames don't compile in React islands
 * here — see PaymentLinkGenerator.tsx).
 */

const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  primary: 'var(--color-primary)',
}

const AMOUNT_CENTS = 2500

let stripePromise: Promise<StripeJs | null> | null = null
function getStripe(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

const elementOptions: StripePaymentElementOptions = {
  layout: 'tabs',
  terms: { card: 'never' },
}

function CheckoutForm({ amountCents }: { amountCents: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paidId, setPaidId] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    setErr(null)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      })
      if (error) setErr(error.message ?? 'Payment failed')
      else if (paymentIntent?.status === 'succeeded') setPaidId(paymentIntent.id)
      else if (paymentIntent) setErr(`Unexpected status: ${paymentIntent.status}`)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Payment error')
    } finally {
      setBusy(false)
    }
  }

  if (paidId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 9999,
            background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
            color: C.primary,
            flexShrink: 0,
          }}
        >
          <Check size={16} />
        </span>
        <div style={{ minWidth: 0 }}>
          <strong style={{ fontSize: '0.9rem', color: C.font }}>Payment succeeded</strong>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', fontFamily: "'SF Mono','Fira Code',monospace", color: C.muted, overflowWrap: 'anywhere' }}>
            {paidId}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <PaymentElement options={elementOptions} onReady={() => setReady(true)} />
      {err && (
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-destructive)',
            background: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)',
            borderRadius: 8,
            padding: '0.5rem 0.7rem',
            margin: 0,
          }}
        >
          {err}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !ready || busy}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.6rem 1rem',
          background: C.primary,
          color: C.bg,
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: !stripe || !ready || busy ? 'default' : 'pointer',
          opacity: !stripe || !ready || busy ? 0.7 : 1,
        }}
      >
        <Lock size={13} />
        {busy ? 'Processing…' : `Pay $${(amountCents / 100).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function StripeCheckout({
  publishableKey,
  amountCents = AMOUNT_CENTS,
  planId,
}: {
  publishableKey: string
  amountCents?: number
  /** A named plan from lib/plan-pricing.ts — the server resolves and
   *  returns its own price, overriding amountCents. */
  planId?: string
}) {
  const [stripe, setStripe] = useState<StripeJs | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [resolvedCents, setResolvedCents] = useState(amountCents)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    getStripe(publishableKey).then((s) => {
      if (s) setStripe(s)
      else setErr('Failed to load Stripe.')
    })
    fetch('/api/pay/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planId ? { planId } : { amountCents }),
    })
      .then(async (r) => {
        const json = (await r.json()) as { clientSecret?: string; amountCents?: number; error?: string }
        if (!r.ok || !json.clientSecret) throw new Error(json.error ?? `${r.status}`)
        setClientSecret(json.clientSecret)
        if (json.amountCents) setResolvedCents(json.amountCents)
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
  }, [publishableKey, amountCents, planId])

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.bg,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.4rem 1.4rem 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 9999,
              background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
              color: C.primary,
              flexShrink: 0,
            }}
          >
            <CreditCard size={14} />
          </span>
          <strong style={{ fontSize: '1rem', color: C.font }}>Card checkout</strong>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: C.primary,
              border: `1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)`,
              borderRadius: 6,
              padding: '0.15rem 0.5rem',
            }}
          >
            Live · test mode
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>
          Real Stripe Elements — try 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </div>

      <div style={{ padding: '1rem 1.4rem 1.4rem' }}>
        {err ? (
          <p
            style={{
              fontSize: '0.78rem',
              color: '#e5484d',
              background: 'color-mix(in srgb, #e5484d 10%, transparent)',
              borderRadius: 8,
              padding: '0.5rem 0.7rem',
              margin: 0,
            }}
          >
            {err}
          </p>
        ) : stripe && clientSecret ? (
          <Elements
            stripe={stripe}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: 'var(--color-primary)',
                  colorBackground: 'var(--color-foreground)',
                  colorText: 'var(--color-font)',
                  fontFamily: 'system-ui, sans-serif',
                  borderRadius: '8px',
                },
              },
              loader: 'auto',
            }}
          >
            <CheckoutForm amountCents={resolvedCents} />
          </Elements>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                border: `3px solid ${C.primary}`,
                borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: '0.9rem 1.4rem' }}>
        <p style={{ fontSize: '0.78rem', color: C.muted, margin: 0 }}>
          Funds settle straight to your own Stripe account — this starter never touches them.
        </p>
      </div>
    </div>
  )
}

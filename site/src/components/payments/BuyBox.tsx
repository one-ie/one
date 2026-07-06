import { lazy, Suspense, useState } from 'react'
import { CreditCard, Wallet, ArrowLeft } from 'lucide-react'
import PaymentLinkGenerator from './PaymentLinkGenerator'
import CardCheckoutPreview from './CardCheckoutPreview'

/**
 * BuyBox — the one decision a buyer makes: card or crypto.
 *
 * A shop converts when there's exactly one obvious next action. Two big
 * buttons, no form to scan first — click either and THAT flow mounts in
 * place. Stripe (@stripe/stripe-js + @stripe/react-stripe-js, genuinely
 * heavy) only ever loads after the "Buy with card" click via lazy() —
 * never on page load, never on scroll-into-view. That's stricter than the
 * old "keep Stripe below the fold" rule (a live iframe tanks Lighthouse
 * a11y/best-practices even off-screen if it's mounted): here it doesn't
 * exist in the DOM at all until the buyer asks for it, so this box can
 * sit anywhere on the page, fold or no fold.
 *
 * Inline-style pattern, matching every other payments island on this site.
 */

const PhysicalCardCheckout = lazy(() => import('./PhysicalCardCheckout'))

const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  primary: 'var(--color-primary)',
  tertiary: 'var(--color-tertiary)',
}

type Mode = 'choose' | 'crypto' | 'card'

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontSize: '0.8rem', fontWeight: 600, color: C.muted,
      }}
    >
      <ArrowLeft size={13} /> Back
    </button>
  )
}

export default function BuyBox({
  planId,
  catalogProduct,
  stripePublishableKey,
  stripeLive,
}: {
  planId?: string
  catalogProduct?: { slug: string; cents: number; label: string }
  stripePublishableKey?: string
  /** Whether STRIPE_SECRET_KEY + the publishable key are both configured —
   *  same switch /payments and /products/[slug] already compute. */
  stripeLive: boolean
}) {
  const [mode, setMode] = useState<Mode>('choose')

  if (mode === 'crypto') {
    return (
      <div>
        <BackLink onClick={() => setMode('choose')} />
        <PaymentLinkGenerator showHeader={false} planId={planId} catalogProduct={catalogProduct} />
      </div>
    )
  }

  if (mode === 'card') {
    return (
      <div>
        <BackLink onClick={() => setMode('choose')} />
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: C.muted, fontSize: '0.85rem' }}>Loading card checkout…</div>}>
          {stripeLive && stripePublishableKey ? (
            <PhysicalCardCheckout publishableKey={stripePublishableKey} planId={planId} catalogProduct={catalogProduct} />
          ) : (
            <CardCheckoutPreview />
          )}
        </Suspense>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <button
        type="button"
        onClick={() => setMode('card')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.9rem 1.1rem', borderRadius: 12,
          border: `1px solid ${C.border}`, background: C.bg, color: C.font,
          fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
          transition: 'border-color 120ms ease, transform 120ms ease',
        }}
      >
        <span
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 9999, flexShrink: 0,
            background: 'color-mix(in oklab, var(--color-tertiary) 14%, transparent)', color: C.tertiary,
          }}
        >
          <CreditCard size={16} />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          Buy with card
          <span style={{ fontSize: '0.74rem', fontWeight: 500, color: C.muted }}>Visa, Mastercard, Amex — via Stripe</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => setMode('crypto')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.9rem 1.1rem', borderRadius: 12,
          border: `1px solid ${C.border}`, background: C.bg, color: C.font,
          fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
          transition: 'border-color 120ms ease, transform 120ms ease',
        }}
      >
        <span
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 9999, flexShrink: 0,
            background: 'color-mix(in oklab, var(--color-primary) 14%, transparent)', color: C.primary,
          }}
        >
          <Wallet size={16} />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          Buy with crypto
          <span style={{ fontSize: '0.74rem', fontWeight: 500, color: C.muted }}>SUI, ETH, SOL, BTC — straight to the wallet</span>
        </span>
      </button>
    </div>
  )
}

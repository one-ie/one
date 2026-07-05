import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import {
  loadStripe,
  type Stripe as StripeJs,
  type StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Lock, ShieldCheck } from 'lucide-react'

/**
 * PhysicalCardCheckout — real Stripe Elements, dressed as a physical card.
 *
 * Uses Stripe's SPLIT elements (CardNumber / CardExpiry / CardCvc) instead of
 * the single PaymentElement so each secure iframe can be positioned onto a
 * real card face and its text styled to look embossed. The chip, contactless
 * icon, and brand mark are our own DOM; the number/expiry/CVC text lives
 * inside Stripe's iframes (PCI stays with Stripe — we never see a digit).
 *
 * Refinements: the card tilts toward the pointer with a specular highlight
 * that tracks the cursor; the active field lights an underline; the brand
 * mark cross-fades; and it flips to its back when the CVC is focused. Confirmed
 * via stripe.confirmCardPayment against a PaymentIntent minted by this site's
 * /api/pay/create-intent. Card chrome is inline-styled (Tailwind classNames
 * don't compile in React islands here — see PaymentLinkGenerator).
 */

const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  primary: 'var(--color-primary)',
}

const DANGER = '#e5484d'

let stripePromise: Promise<StripeJs | null> | null = null
function getStripe(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// White embossed text inside the Stripe iframes, over the dark card face.
const elementStyle = {
  base: {
    color: '#ffffff',
    fontFamily: "'SF Mono', ui-monospace, 'Fira Code', 'Roboto Mono', monospace",
    fontSize: '17px',
    fontWeight: '500' as const,
    fontSmoothing: 'antialiased',
    letterSpacing: '0.13em',
    iconColor: '#ffffff',
    '::placeholder': { color: 'rgba(255,255,255,0.42)' },
  },
  invalid: { color: '#ffd9d9', iconColor: '#ffd9d9' },
  complete: { color: '#ffffff' },
}

// ── Brand marks ─────────────────────────────────────────────────────────────
function BrandMark({ brand }: { brand: string }) {
  const common: React.CSSProperties = { height: 30, display: 'block' }
  if (brand === 'visa')
    return (
      <svg viewBox="0 0 48 16" style={{ ...common, width: 52 }} aria-label="Visa">
        <text x="0" y="13" fontFamily="Georgia, 'Times New Roman', serif" fontSize="15" fontStyle="italic" fontWeight="700" fill="#ffffff" letterSpacing="1">VISA</text>
      </svg>
    )
  if (brand === 'mastercard')
    return (
      <svg viewBox="0 0 48 30" style={{ ...common, width: 48 }} aria-label="Mastercard">
        <circle cx="19" cy="15" r="12" fill="#eb001b" opacity="0.95" />
        <circle cx="30" cy="15" r="12" fill="#f79e1b" opacity="0.9" />
        <path d="M24.5 6a12 12 0 0 1 0 18 12 12 0 0 1 0-18z" fill="#ff5f00" />
      </svg>
    )
  if (brand === 'amex')
    return (
      <svg viewBox="0 0 52 30" style={{ ...common, width: 50 }} aria-label="American Express">
        <rect x="0" y="2" width="52" height="26" rx="3" fill="#1f72cd" />
        <text x="26" y="14" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="6.5" fontWeight="700" fill="#ffffff">AMERICAN</text>
        <text x="26" y="22" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="6.5" fontWeight="700" fill="#ffffff">EXPRESS</text>
      </svg>
    )
  if (brand === 'discover')
    return (
      <svg viewBox="0 0 60 16" style={{ ...common, width: 60 }} aria-label="Discover">
        <text x="0" y="13" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">DISC</text>
        <circle cx="40" cy="9" r="5" fill="#f68121" />
        <text x="46" y="13" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">VER</text>
      </svg>
    )
  // unknown / empty — quiet generic mark
  return (
    <svg viewBox="0 0 48 30" style={{ ...common, width: 44 }} aria-hidden="true">
      <rect x="1" y="8" width="46" height="15" rx="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
      <rect x="1" y="12" width="46" height="3.5" fill="rgba(255,255,255,0.5)" />
    </svg>
  )
}

// Metallic EMV chip.
function Chip() {
  return (
    <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="chipg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e7a8" />
          <stop offset="0.5" stopColor="#d9b45b" />
          <stop offset="1" stopColor="#b8912f" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="45" height="35" rx="6" fill="url(#chipg)" stroke="rgba(0,0,0,0.18)" />
      <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.1" fill="none">
        <path d="M0 12 H14 M0 24 H14 M32 12 H46 M32 24 H46" />
        <rect x="14" y="7" width="18" height="22" rx="3.5" fill="rgba(255,255,255,0.12)" />
        <path d="M23 0 V7 M23 29 V36" />
      </g>
    </svg>
  )
}

// Contactless-pay waves.
function Contactless() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      <g stroke="rgba(255,255,255,0.85)" strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 8a8 8 0 0 1 0 8" />
        <path d="M8 5.5a12 12 0 0 1 0 13" />
        <path d="M12 3a16 16 0 0 1 0 18" />
      </g>
    </svg>
  )
}

const microLabel: React.CSSProperties = {
  fontSize: '0.52rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  margin: '0 0 0.15rem',
  fontFamily: "'SF Mono', ui-monospace, monospace",
}

// Underline that lights up under the focused field (inset shadow → no reflow).
const fieldWrap = (active: boolean): React.CSSProperties => ({
  boxShadow: active ? 'inset 0 -2px 0 rgba(255,255,255,0.75)' : 'inset 0 -2px 0 transparent',
  transition: 'box-shadow 0.22s ease',
  paddingBottom: 2,
})

// Shared card-face background — dark, derived from the theme's primary so it
// re-themes while staying dark enough for white embossed text.
const cardFace: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 18,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  overflow: 'hidden',
  background:
    'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 82%, #05070d) 0%, color-mix(in oklab, var(--color-primary) 46%, #0a0e16) 48%, #0a0e16 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 60px rgba(0,0,0,0.35)',
}

// Static diagonal sheen + a soft tertiary glow, and a specular highlight that
// tracks the cursor via the --mx/--my custom props set on the card wrapper.
function FaceSheen() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.14) 46%, rgba(255,255,255,0) 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(220px circle at var(--mx, 50%) var(--my, 32%), rgba(255,255,255,0.22), rgba(255,255,255,0) 60%)',
          pointerEvents: 'none',
          transition: 'background 0.05s linear',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-tertiary) 55%, transparent), transparent 70%)',
          filter: 'blur(6px)',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

function CardForm({ clientSecret, amountCents }: { clientSecret: string; amountCents: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [brand, setBrand] = useState('unknown')
  const [flipped, setFlipped] = useState(false)
  const [focus, setFocus] = useState<'number' | 'name' | 'expiry' | 'cvc' | null>(null)
  const [name, setName] = useState('')
  const [done, setDone] = useState({ number: false, expiry: false, cvc: false })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paidId, setPaidId] = useState<string | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const reduced = useRef(false)
  useEffect(() => {
    reduced.current = prefersReducedMotion()
  }, [])

  const ready = done.number && done.expiry && done.cvc && name.trim().length > 1
  const amount = `$${(amountCents / 100).toFixed(2)}`

  function resetTilt() {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
    wrapRef.current?.style.setProperty('--mx', '50%')
    wrapRef.current?.style.setProperty('--my', '32%')
  }

  // Flip disables tilt (a tilted, mirrored back looks wrong).
  useEffect(() => {
    if (flipped) resetTilt()
  }, [flipped])

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced.current || flipped || paidId) return
    const el = wrapRef.current
    if (!el || !tiltRef.current) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    tiltRef.current.style.transform = `rotateX(${(0.5 - py) * 11}deg) rotateY(${(px - 0.5) * 13}deg)`
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  function focusCvc() {
    setFlipped(true)
    elements?.getElement(CardCvcElement)?.focus()
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return
    const card = elements.getElement(CardNumberElement)
    if (!card) return
    setBusy(true)
    setErr(null)
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card, billing_details: { name: name.trim() } },
      })
      if (error) setErr(error.message ?? 'Payment failed')
      else if (paymentIntent?.status === 'succeeded') {
        setPaidId(paymentIntent.id)
        setFlipped(false)
        resetTilt()
      } else if (paymentIntent) setErr(`Unexpected status: ${paymentIntent.status}`)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Payment error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* ── The card ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        {/* Perspective + drop-shadow wrapper. The shadow lives HERE, never on
            the rotating element: a `filter` on a preserve-3d node flattens it
            and breaks backface-visibility (the back shows a mirrored front). */}
        <div
          ref={wrapRef}
          onPointerMove={onPointerMove}
          onPointerLeave={resetTilt}
          style={{
            perspective: '1400px',
            filter: 'drop-shadow(0 22px 40px rgba(0,0,0,0.32))',
            animation: 'pc-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          <div ref={tiltRef} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s ease-out', willChange: 'transform' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1.586 / 1',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                transform: flipped ? 'rotateY(180deg)' : 'none',
              }}
            >
              {/* FRONT */}
              <div style={cardFace}>
                <FaceSheen />
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 'clamp(1rem, 4.5%, 1.4rem)',
                    color: '#fff',
                  }}
                >
                  {/* top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.28em' }}>ONE</span>
                    <Contactless />
                  </div>

                  {/* chip */}
                  <div style={{ position: 'absolute', top: '38%', left: 'clamp(1rem, 4.5%, 1.4rem)' }}>
                    <Chip />
                  </div>

                  {/* number */}
                  <div style={{ marginTop: 'auto' }}>
                    <p style={microLabel} id="pc-num-label">Card number</p>
                    <div aria-labelledby="pc-num-label" style={fieldWrap(focus === 'number')}>
                      <CardNumberElement
                        options={{ style: elementStyle, showIcon: false, placeholder: '1234  5678  9012  3456' }}
                        onFocus={() => { setFocus('number'); setFlipped(false) }}
                        onBlur={() => setFocus(null)}
                        onChange={(ev: StripeCardNumberElementChangeEvent) => {
                          setBrand(ev.brand || 'unknown')
                          setDone((d) => ({ ...d, number: ev.complete }))
                          setErr(ev.error ? ev.error.message : null)
                        }}
                      />
                    </div>
                  </div>

                  {/* bottom row: holder · expiry · brand */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <label style={microLabel} htmlFor="pc-name">Card holder</label>
                      <div style={fieldWrap(focus === 'name')}>
                        <input
                          id="pc-name"
                          type="text"
                          autoComplete="cc-name"
                          placeholder="YOUR NAME"
                          aria-label="Cardholder name"
                          value={name}
                          onChange={(e) => setName(e.target.value.toUpperCase())}
                          onFocus={() => { setFocus('name'); setFlipped(false) }}
                          onBlur={() => setFocus(null)}
                          style={{
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            color: '#fff',
                            fontFamily: "'SF Mono', ui-monospace, monospace",
                            fontSize: '0.86rem',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: 0,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ width: '5.4rem', flexShrink: 0 }}>
                      <p style={microLabel} id="pc-exp-label">Expires</p>
                      <div aria-labelledby="pc-exp-label" style={fieldWrap(focus === 'expiry')}>
                        <CardExpiryElement
                          options={{ style: elementStyle }}
                          onFocus={() => { setFocus('expiry'); setFlipped(false) }}
                          onBlur={() => setFocus(null)}
                          onChange={(ev) => setDone((d) => ({ ...d, expiry: ev.complete }))}
                        />
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, paddingBottom: '0.1rem', position: 'relative', width: 60, height: 30 }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={brand}
                          initial={{ opacity: 0, scale: 0.7, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: -4 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          style={{ position: 'absolute', right: 0, bottom: 0 }}
                        >
                          <BrandMark brand={brand} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK */}
              <div style={{ ...cardFace, transform: 'rotateY(180deg)' }}>
                <FaceSheen />
                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', color: '#fff' }}>
                  {/* magnetic stripe */}
                  <div style={{ height: '18%', marginTop: '9%', background: 'linear-gradient(#12151c, #05070c)' }} />
                  {/* signature + cvc */}
                  <div style={{ padding: 'clamp(0.9rem, 4.5%, 1.3rem)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        height: 34,
                        borderRadius: 4,
                        background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.82) 0 6px, rgba(230,230,230,0.82) 6px 12px)',
                      }}
                    />
                    <div style={{ width: '4.6rem', flexShrink: 0 }}>
                      <p style={{ ...microLabel, textAlign: 'right' }} id="pc-cvc-label">CVC</p>
                      <div
                        aria-labelledby="pc-cvc-label"
                        style={{
                          background: 'rgba(255,255,255,0.14)',
                          border: `1px solid ${focus === 'cvc' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)'}`,
                          borderRadius: 6,
                          padding: '0.35rem 0.5rem',
                          transition: 'border-color 0.22s ease',
                        }}
                      >
                        <CardCvcElement
                          options={{ style: elementStyle, placeholder: '•••' }}
                          onFocus={() => { setFocus('cvc'); setFlipped(true) }}
                          onBlur={() => { setFocus(null); setFlipped(false) }}
                          onChange={(ev) => setDone((d) => ({ ...d, cvc: ev.complete }))}
                        />
                      </div>
                    </div>
                  </div>
                  <p style={{ marginTop: 'auto', padding: '0 clamp(0.9rem, 4.5%, 1.3rem) clamp(0.9rem, 4.5%, 1.3rem)', fontSize: '0.56rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
                    Secured by Stripe · this starter never sees your card number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approved stamp on success — overlays the card, outside the flip. */}
        <AnimatePresence>
          {paidId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 18, background: 'rgba(6,9,14,0.42)', backdropFilter: 'blur(1px)', pointerEvents: 'none' }}
            >
              <motion.div
                initial={{ scale: 1.6, opacity: 0, rotate: -22 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.1rem',
                  border: '2.5px solid #34d17d',
                  borderRadius: 10,
                  color: '#34d17d',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  fontSize: '1.05rem',
                  textTransform: 'uppercase',
                  background: 'rgba(20,40,30,0.35)',
                }}
              >
                <Check size={20} strokeWidth={3} /> Approved
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{'@keyframes pc-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } } @media (prefers-reduced-motion: reduce) { [style*="pc-in"] { animation: none !important } }'}</style>

      {/* helper: flip to enter CVC (works for mouse users) */}
      {!paidId && (
        <button
          type="button"
          onClick={flipped ? () => setFlipped(false) : focusCvc}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: '-0.35rem 0 0',
            color: C.muted,
            fontSize: '0.74rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {flipped ? '↩ Back to front' : 'Enter CVC ↻'}
        </button>
      )}

      {err && (
        <p style={{ fontSize: '0.78rem', color: DANGER, background: 'color-mix(in srgb, #e5484d 10%, transparent)', borderRadius: 8, padding: '0.5rem 0.7rem', margin: 0 }}>
          {err}
        </p>
      )}

      {!paidId && (
        <button
          type="submit"
          disabled={!stripe || !ready || busy}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1rem',
            background: C.primary,
            color: C.bg,
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: !stripe || !ready || busy ? 'default' : 'pointer',
            opacity: !stripe || !ready || busy ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <Lock size={14} />
          {busy ? 'Processing…' : `Pay ${amount}`}
        </button>
      )}

      {paidId && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: `1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)`, borderRadius: 12, padding: '0.85rem 1rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 9999, background: C.primary, color: C.bg, flexShrink: 0 }}>
            <Check size={17} />
          </span>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: '0.9rem', color: C.font }}>Paid {amount}</strong>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', fontFamily: "'SF Mono','Fira Code',monospace", color: C.muted, overflowWrap: 'anywhere' }}>{paidId}</p>
          </div>
        </motion.div>
      )}
    </form>
  )
}

export default function PhysicalCardCheckout({
  publishableKey,
  amountCents = 2500,
}: {
  publishableKey: string
  amountCents?: number
}) {
  const [stripe, setStripe] = useState<StripeJs | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    getStripe(publishableKey).then((s) => {
      if (s) setStripe(s)
      else setErr('Failed to load Stripe.')
    })
    fetch('/api/pay/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountCents }),
    })
      .then(async (r) => {
        const json = (await r.json()) as { clientSecret?: string; error?: string }
        if (!r.ok || !json.clientSecret) throw new Error(json.error ?? `${r.status}`)
        setClientSecret(json.clientSecret)
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
  }, [publishableKey, amountCents])

  const options = useMemo(() => ({ appearance: { theme: 'stripe' as const } }), [])

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.bg, overflow: 'hidden' }}>
      <div style={{ padding: '1.4rem 1.4rem 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 9999, background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', color: C.primary, flexShrink: 0 }}>
            <ShieldCheck size={14} />
          </span>
          <strong style={{ fontSize: '1rem', color: C.font }}>Card checkout</strong>
          <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.primary, border: `1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)`, borderRadius: 6, padding: '0.15rem 0.5rem' }}>
            Live · test mode
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>
          Real Stripe Elements — try 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </div>

      <div style={{ padding: '1rem 1.4rem 1.4rem' }}>
        {err ? (
          <p style={{ fontSize: '0.78rem', color: DANGER, background: 'color-mix(in srgb, #e5484d 10%, transparent)', borderRadius: 8, padding: '0.5rem 0.7rem', margin: 0 }}>{err}</p>
        ) : stripe && clientSecret ? (
          <Elements stripe={stripe} options={options}>
            <CardForm clientSecret={clientSecret} amountCents={amountCents} />
          </Elements>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 9999, border: `3px solid ${C.primary}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
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

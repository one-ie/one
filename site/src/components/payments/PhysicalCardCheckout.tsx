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
 * PhysicalCardCheckout — real Stripe Elements, dressed as a physical card,
 * built to be filled.
 *
 * Stripe's SPLIT elements (CardNumber / CardExpiry / CardCvc) sit on ONE card
 * face — nothing hidden behind a flip, since a hidden field costs completions.
 * Each field is a tappable "well" with a visible border so it reads as an
 * input; a pulsing ring walks the eye to the next empty field; progress chips
 * + a step-naming CTA keep momentum. The card leans toward the pointer with a
 * specular highlight that tracks the cursor. PCI stays with Stripe (the
 * iframes) — we never see a digit. Confirmed via stripe.confirmCardPayment
 * against a PaymentIntent from /api/pay/create-intent.
 *
 * Card chrome is inline-styled (Tailwind classNames don't compile in React
 * islands here — see PaymentLinkGenerator); only keyframes + ::placeholder
 * live in a literal <style> block, which is fine (not a Tailwind utility).
 */

const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  primary: 'var(--color-primary)',
}

const DANGER = 'var(--color-destructive)'
const OK = '#34d17d'

let stripePromise: Promise<StripeJs | null> | null = null
function getStripe(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// White embossed text inside the Stripe iframes, over the dark card face.
const elementStyle = {
  base: {
    color: '#ffffff',
    fontFamily: "'SF Mono', ui-monospace, 'Fira Code', 'Roboto Mono', monospace",
    fontSize: '16px',
    fontWeight: '500' as const,
    fontSmoothing: 'antialiased',
    letterSpacing: '0.08em',
    iconColor: '#ffffff',
    '::placeholder': { color: 'rgba(255,255,255,0.55)' },
  },
  invalid: { color: '#ffd9d9', iconColor: '#ffd9d9' },
  complete: { color: '#ffffff' },
}

type Field = 'number' | 'name' | 'expiry' | 'cvc'

// ── Brand marks ─────────────────────────────────────────────────────────────
function BrandMark({ brand }: { brand: string }) {
  const common: React.CSSProperties = { height: 26, display: 'block' }
  if (brand === 'visa')
    return (
      <svg viewBox="0 0 48 16" style={{ ...common, width: 46 }} aria-label="Visa">
        <text x="0" y="13" fontFamily="Georgia, 'Times New Roman', serif" fontSize="15" fontStyle="italic" fontWeight="700" fill="#ffffff" letterSpacing="1">VISA</text>
      </svg>
    )
  if (brand === 'mastercard')
    return (
      <svg viewBox="0 0 48 30" style={{ ...common, width: 42 }} aria-label="Mastercard">
        <circle cx="19" cy="15" r="12" fill="#eb001b" opacity="0.95" />
        <circle cx="30" cy="15" r="12" fill="#f79e1b" opacity="0.9" />
        <path d="M24.5 6a12 12 0 0 1 0 18 12 12 0 0 1 0-18z" fill="#ff5f00" />
      </svg>
    )
  if (brand === 'amex')
    return (
      <svg viewBox="0 0 52 30" style={{ ...common, width: 44 }} aria-label="American Express">
        <rect x="0" y="2" width="52" height="26" rx="3" fill="#1f72cd" />
        <text x="26" y="14" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="6.5" fontWeight="700" fill="#ffffff">AMERICAN</text>
        <text x="26" y="22" textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="6.5" fontWeight="700" fill="#ffffff">EXPRESS</text>
      </svg>
    )
  if (brand === 'discover')
    return (
      <svg viewBox="0 0 60 16" style={{ ...common, width: 54 }} aria-label="Discover">
        <text x="0" y="13" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">DISC</text>
        <circle cx="40" cy="9" r="5" fill="#f68121" />
        <text x="46" y="13" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">VER</text>
      </svg>
    )
  return (
    <svg viewBox="0 0 48 30" style={{ ...common, width: 40 }} aria-hidden="true">
      <rect x="1" y="8" width="46" height="15" rx="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
      <rect x="1" y="12" width="46" height="3.5" fill="rgba(255,255,255,0.5)" />
    </svg>
  )
}

function Chip() {
  return (
    <svg width="38" height="30" viewBox="0 0 46 36" aria-hidden="true" style={{ display: 'block' }}>
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

function Contactless() {
  return (
    <svg width="17" height="21" viewBox="0 0 20 24" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 8a8 8 0 0 1 0 8" />
        <path d="M8 5.5a12 12 0 0 1 0 13" />
        <path d="M12 3a16 16 0 0 1 0 18" />
      </g>
    </svg>
  )
}

const cardFace: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 18,
  overflow: 'hidden',
  background:
    'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 82%, #05070d) 0%, color-mix(in oklab, var(--color-primary) 46%, #0a0e16) 48%, #0a0e16 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 60px rgba(0,0,0,0.35)',
}

function FaceSheen() {
  return (
    <>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.13) 46%, rgba(255,255,255,0) 60%)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(220px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.2), rgba(255,255,255,0) 60%)', pointerEvents: 'none', transition: 'background 0.05s linear' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--color-tertiary) 55%, transparent), transparent 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
    </>
  )
}

function CardForm({ clientSecret, amountCents }: { clientSecret: string; amountCents: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [brand, setBrand] = useState('unknown')
  const [focus, setFocus] = useState<Field | null>(null)
  const [name, setName] = useState('')
  const [done, setDone] = useState({ number: false, expiry: false, cvc: false })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paidId, setPaidId] = useState<string | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const reducedMotion = useMemo(prefersReducedMotion, [])

  const nameFilled = name.trim().length > 1
  const filledCount = (done.number ? 1 : 0) + (nameFilled ? 1 : 0) + (done.expiry ? 1 : 0) + (done.cvc ? 1 : 0)
  const ready = filledCount === 4
  const amount = `$${(amountCents / 100).toFixed(2)}`
  const nextField: Field | null = !done.number ? 'number' : !nameFilled ? 'name' : !done.expiry ? 'expiry' : !done.cvc ? 'cvc' : null

  function resetTilt() {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
    wrapRef.current?.style.setProperty('--mx', '50%')
    wrapRef.current?.style.setProperty('--my', '30%')
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || paidId) return
    const el = wrapRef.current
    if (!el || !tiltRef.current) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    tiltRef.current.style.transform = `rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 11}deg)`
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  function focusField(f: Field | null) {
    if (f === 'number') elements?.getElement(CardNumberElement)?.focus()
    else if (f === 'name') nameRef.current?.focus()
    else if (f === 'expiry') elements?.getElement(CardExpiryElement)?.focus()
    else if (f === 'cvc') elements?.getElement(CardCvcElement)?.focus()
  }

  // Tappable input "well" — visible border so it reads as a field; a pulsing
  // ring marks the next empty one; brighter on focus.
  function well(field: Field): React.CSSProperties {
    const active = focus === field
    const isNext = nextField === field && !active
    return {
      background: active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
      border: `1px solid ${active ? 'rgba(255,255,255,0.92)' : isNext ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.26)'}`,
      borderRadius: 10,
      padding: '0.34rem 0.55rem',
      cursor: 'text',
      transition: 'background 0.2s ease, border-color 0.2s ease',
      animation: isNext && !reducedMotion ? 'pc-pulse 1.9s ease-out infinite' : undefined,
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!ready) {
      focusField(nextField)
      return
    }
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
        resetTilt()
      } else if (paymentIntent) setErr(`Unexpected status: ${paymentIntent.status}`)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Payment error')
    } finally {
      setBusy(false)
    }
  }

  const cta = busy
    ? 'Processing…'
    : ready
      ? `Pay ${amount} securely`
      : nextField === 'name'
        ? 'Add your name →'
        : nextField === 'expiry'
          ? 'Add expiry date →'
          : nextField === 'cvc'
            ? 'Add security code →'
            : 'Start — enter card number →'

  const steps: { k: Field; label: string; ok: boolean }[] = [
    { k: 'number', label: 'Card', ok: done.number },
    { k: 'name', label: 'Name', ok: nameFilled },
    { k: 'expiry', label: 'Expiry', ok: done.expiry },
    { k: 'cvc', label: 'CVC', ok: done.cvc },
  ]

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
      <style>{`
        @keyframes pc-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pc-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.34) } 70% { box-shadow: 0 0 0 6px rgba(255,255,255,0) } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0) } }
        .pc-name::placeholder { color: rgba(255,255,255,0.5); letter-spacing: 0.04em }
        @media (prefers-reduced-motion: reduce) { .pc-anim { animation: none !important } }
      `}</style>

      {/* ── The card ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <div
          ref={wrapRef}
          onPointerMove={onPointerMove}
          onPointerLeave={resetTilt}
          className="pc-anim"
          style={{ perspective: '1400px', filter: 'drop-shadow(0 22px 40px rgba(0,0,0,0.32))', animation: reducedMotion ? undefined : 'pc-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both' }}
        >
          <div ref={tiltRef} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s ease-out', willChange: 'transform' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1.6 / 1', minHeight: 236 }}>
              <div style={cardFace}>
                <FaceSheen />
                <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', padding: 'clamp(0.85rem, 3.6%, 1.15rem)', color: '#fff' }}>
                  {/* top group: brand + chip */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.28em' }}>ONE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Contactless />
                        <div style={{ position: 'relative', width: 48, height: 26 }}>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={brand}
                              initial={{ opacity: 0, scale: 0.7, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.7, y: 4 }}
                              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                              style={{ position: 'absolute', right: 0, top: 0 }}
                            >
                              <BrandMark brand={brand} />
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}><Chip /></div>
                  </div>

                  {/* weighted spacers seat the fields in the lower third — near the
                      bottom (where it reads best) but off the very edge */}
                  <div style={{ flex: 2.6 }} />

                  {/* field group: number, then name · expiry · cvc — nothing hidden */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="pc-anim" style={well('number')} onClick={() => focusField('number')}>
                      <CardNumberElement
                        options={{ style: elementStyle, showIcon: false, placeholder: '1234  5678  9012  3456' }}
                        onFocus={() => setFocus('number')}
                        onBlur={() => setFocus(null)}
                        onChange={(ev: StripeCardNumberElementChangeEvent) => {
                          setBrand(ev.brand || 'unknown')
                          setDone((d) => ({ ...d, number: ev.complete }))
                          setErr(ev.error ? ev.error.message : null)
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.5rem' }}>
                    <div className="pc-anim" style={{ ...well('name'), flex: 1, minWidth: 0 }} onClick={() => focusField('name')}>
                      <input
                        ref={nameRef}
                        id="pc-name"
                        className="pc-name"
                        type="text"
                        autoComplete="cc-name"
                        placeholder="Name on card"
                        aria-label="Cardholder name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocus('name')}
                        onBlur={() => setFocus(null)}
                        style={{ width: '100%', border: 'none', background: 'transparent', color: '#fff', fontFamily: "'SF Mono', ui-monospace, monospace", fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.02em', padding: 0, outline: 'none' }}
                      />
                    </div>
                    <div className="pc-anim" style={{ ...well('expiry'), width: '4.4rem', flexShrink: 0 }} onClick={() => focusField('expiry')}>
                      <CardExpiryElement
                        options={{ style: elementStyle }}
                        onFocus={() => setFocus('expiry')}
                        onBlur={() => setFocus(null)}
                        onChange={(ev) => setDone((d) => ({ ...d, expiry: ev.complete }))}
                      />
                    </div>
                    <div className="pc-anim" style={{ ...well('cvc'), width: '3.4rem', flexShrink: 0 }} onClick={() => focusField('cvc')}>
                      <CardCvcElement
                        options={{ style: elementStyle, placeholder: 'CVC' }}
                        onFocus={() => setFocus('cvc')}
                        onBlur={() => setFocus(null)}
                        onChange={(ev) => setDone((d) => ({ ...d, cvc: ev.complete }))}
                      />
                    </div>
                  </div>
                  </div>

                  {/* small bottom spacer → keeps a slim margin below the fields */}
                  <div style={{ flex: 1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approved stamp on success */}
        <AnimatePresence>
          {paidId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 18, background: 'rgba(6,9,14,0.42)', backdropFilter: 'blur(1px)', pointerEvents: 'none' }}>
              <motion.div
                initial={{ scale: 1.6, opacity: 0, rotate: -22 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem', border: `2.5px solid ${OK}`, borderRadius: 10, color: OK, fontWeight: 800, letterSpacing: '0.14em', fontSize: '1.05rem', textTransform: 'uppercase', background: 'rgba(20,40,30,0.35)' }}
              >
                <Check size={20} strokeWidth={3} /> Approved
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Progress chips ───────────────────────────────────────── */}
      {!paidId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {steps.map((s) => {
            const isNext = nextField === s.k
            return (
              <button
                key={s.k}
                type="button"
                onClick={() => focusField(s.k)}
                aria-label={`${s.label}${s.ok ? ' complete' : ''}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  padding: '0.32rem 0.4rem',
                  borderRadius: 7,
                  border: `1px solid ${s.ok ? 'color-mix(in srgb, var(--color-primary) 40%, transparent)' : isNext ? 'color-mix(in srgb, var(--color-primary) 55%, transparent)' : C.border}`,
                  background: s.ok ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : isNext ? 'color-mix(in srgb, var(--color-primary) 7%, transparent)' : 'transparent',
                  color: s.ok ? C.primary : isNext ? C.font : C.muted,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.ok ? <Check size={11} strokeWidth={3} /> : null}
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      {err && (
        <p style={{ fontSize: '0.78rem', color: DANGER, background: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)', borderRadius: 8, padding: '0.5rem 0.7rem', margin: 0 }}>{err}</p>
      )}

      {!paidId && (
        <>
          <button
            type="submit"
            disabled={busy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.82rem 1rem',
              background: C.primary,
              color: C.bg,
              border: 'none',
              borderRadius: 11,
              fontWeight: 700,
              fontSize: '0.94rem',
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.7 : 1,
              boxShadow: ready ? '0 8px 20px -8px color-mix(in srgb, var(--color-primary) 70%, transparent)' : 'none',
              transition: 'box-shadow 0.25s ease, opacity 0.2s ease',
            }}
          >
            {ready && !busy && <Lock size={15} />}
            {cta}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', fontSize: '0.72rem', color: C.muted }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={12} /> Secured by Stripe</span>
            <span>·</span>
            <span>Test mode — no real charge</span>
          </div>
        </>
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
  planId,
}: {
  publishableKey: string
  amountCents?: number
  /** A named plan from lib/plan-pricing.ts — the server resolves and
   *  returns its own price, overriding amountCents, so a plan's charge can
   *  never drift from or be spoofed away from its real price. */
  planId?: string
}) {
  const [stripe, setStripe] = useState<StripeJs | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [resolvedCents, setResolvedCents] = useState(amountCents)
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

  const options = useMemo(() => ({ appearance: { theme: 'stripe' as const } }), [])
  const amount = `$${(resolvedCents / 100).toFixed(2)}`

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.bg, overflow: 'hidden' }}>
      <div style={{ padding: '1.4rem 1.4rem 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 9999, background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', color: C.primary, flexShrink: 0 }}>
            <ShieldCheck size={14} />
          </span>
          <strong style={{ fontSize: '1rem', color: C.font }}>Pay by card</strong>
          <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.primary, border: `1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)`, borderRadius: 6, padding: '0.15rem 0.5rem' }}>
            Live · test mode
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>
          Fill the card to pay {amount} in seconds — test mode, so no real charge. Use <strong style={{ color: C.font, fontWeight: 600 }}>4242 4242 4242 4242</strong>, any future date, any CVC.
        </p>
      </div>

      <div style={{ padding: '1rem 1.4rem 1.4rem' }}>
        {err ? (
          <p style={{ fontSize: '0.78rem', color: DANGER, background: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)', borderRadius: 8, padding: '0.5rem 0.7rem', margin: 0 }}>{err}</p>
        ) : stripe && clientSecret ? (
          <Elements stripe={stripe} options={options}>
            <CardForm clientSecret={clientSecret} amountCents={resolvedCents} />
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

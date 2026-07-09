import { useState } from 'react'
import { motion } from 'motion/react'
import { CreditCard, KeyRound } from 'lucide-react'

/**
 * CardCheckoutPreview — an honest preview of the card rail, not a working
 * checkout. This starter ships /api/pay/create-intent + /api/pay/webhook
 * fail-closed (503 until STRIPE_SECRET_KEY is set) — this component mirrors
 * that shape visually without pretending Stripe Elements is wired here.
 * Submitting shows exactly what a visitor would see today: an honest nudge
 * to add a key, not a staged success state.
 *
 * Inline-style pattern, matching PaymentLinkGenerator.tsx (see its comment —
 * Tailwind utility classNames don't render inside React islands here).
 */

const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  onFg: 'var(--color-on-foreground)', // text/icons ON a C.fg fill — a theme can fill foreground with a saturated brand tone
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  tertiary: 'var(--color-tertiary)',
  primary: 'var(--color-primary)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.7rem',
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  background: C.fg,
  color: C.onFg,
  fontSize: '0.9rem',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.3rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: C.muted,
}

export default function CardCheckoutPreview() {
  const [nudge, setNudge] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNudge(true)
    setTimeout(() => setNudge(false), 2400)
  }

  return (
    <div
      style={{
        position: 'relative',
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
              background: C.fg,
              color: C.onFg,
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
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '0.15rem 0.5rem',
            }}
          >
            Preview
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>What it looks like once you wire your own Stripe key.</p>
      </div>

      <div style={{ padding: '1rem 1.4rem 1.4rem' }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-label="Card checkout preview, not functional">
          <div>
            <label style={labelStyle}>Card number</label>
            <input type="text" inputMode="numeric" placeholder="4242 4242 4242 4242" disabled style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={labelStyle}>Expiry</label>
              <input type="text" placeholder="MM / YY" disabled style={inputStyle} />
            </div>
            <div style={{ width: '5.5rem' }}>
              <label style={labelStyle}>CVC</label>
              <input type="text" placeholder="•••" disabled style={inputStyle} />
            </div>
          </div>

          {nudge ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: C.onFg,
                background: C.fg,
                borderRadius: 8,
                padding: '0.5rem 0.7rem',
                margin: 0,
              }}
            >
              <KeyRound size={14} style={{ flexShrink: 0 }} />
              <span>
                Add <code style={{ fontFamily: "'SF Mono','Fira Code',monospace", color: C.tertiary }}>STRIPE_SECRET_KEY</code> to make this real.
              </span>
            </motion.p>
          ) : (
            <button
              type="submit"
              style={{
                marginTop: '0.15rem',
                padding: '0.6rem 1rem',
                background: C.fg,
                color: C.onFg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Pay $25.00
            </button>
          )}
        </form>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: '0.9rem 1.4rem' }}>
        <p style={{ fontSize: '0.78rem', color: C.muted, margin: 0 }}>
          Funds settle straight to your own Stripe account — this starter never touches them.
        </p>
      </div>
    </div>
  )
}

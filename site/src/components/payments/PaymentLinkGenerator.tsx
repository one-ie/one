import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Copy, RotateCcw, Send } from 'lucide-react'
import { PLANS } from '../../lib/plan-pricing'

/**
 * PaymentLinkGenerator — a real, working crypto payment link creator.
 *
 * Posts straight to this site's own /api/pay/link, which calls pay.one.ie's
 * payment_link_create protocol against the wallet configured in .dev.vars.
 * No mock data path: a failure here is a real failure (usually "no wallet
 * configured yet" — see wallet.astro), not a staged demo state.
 *
 * Styled with inline styles against the site's 6 CSS-custom-property design
 * tokens, matching every other React island on this site (LifecycleScene,
 * ScrollScene, CountUp) — Tailwind utility classNames inside .tsx files are
 * not picked up by this project's content scan (verified live 2026-07-04:
 * zero .bg-card/.rounded-xl rules ever reach the compiled stylesheet, for
 * shadcn's own ui/*.tsx primitives too, not just new components), so this
 * is the one styling approach that actually renders in a React island here.
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

const CHAINS = ['SUI', 'ETH', 'SOL', 'BTC']

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; url: string; qr?: string }

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

export default function PaymentLinkGenerator({
  showHeader = true,
  planId,
  catalogProduct,
}: {
  showHeader?: boolean
  /** A named plan from lib/plan-pricing.ts — pre-fills and locks amount +
   *  product (the server resolves and enforces the real price regardless
   *  of these fields, so they must never be editable while a plan drives
   *  them — that would show a price the link wouldn't actually charge). */
  planId?: string
  /** A catalog product from src/content/products/*.md, resolved server-side
   *  in payments.astro (content collections can't be read from a client
   *  island). Same lock-the-form posture as planId — the server enforces
   *  the real price via resolveProduct() regardless of these display values. */
  catalogProduct?: { slug: string; cents: number; label: string }
}) {
  const plan = planId ? PLANS[planId] : undefined
  const locked = plan ?? catalogProduct
  const [amount, setAmount] = useState(locked ? String(locked.cents / 100) : '25')
  const [product, setProduct] = useState(locked ? locked.label : '')
  const [state, setState] = useState<State>({ status: 'idle' })
  const [copied, setCopied] = useState(false)
  const autoFired = useRef(false)

  async function createLink() {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/pay/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          planId
            ? { planId }
            : catalogProduct
              ? { productId: catalogProduct.slug }
              : { amountCents: Math.round(Number(amount) * 100), product: product || 'Payment' },
        ),
      })
      const json = (await res.json()) as { url?: string; qr?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? `${res.status}`)
      setState({ status: 'success', url: json.url, qr: json.qr })
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
    }
  }

  // Locked mode (a plan or catalog product) has nothing left to confirm — the
  // price is fixed and already shown by the page around this component, so
  // the link is created the moment this mounts instead of behind one more
  // "are you sure" click. Ref-guarded so React StrictMode / re-renders never
  // double-fire it.
  useEffect(() => {
    if (locked && !autoFired.current) {
      autoFired.current = true
      void createLink()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void createLink()
  }

  function reset() {
    setState({ status: 'idle' })
    setCopied(false)
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.bg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {showHeader && (
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
              <Send size={14} />
            </span>
            <strong style={{ fontSize: '1rem', color: C.font }}>Create a payment link</strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>Real, signed, live against pay.one.ie — not a mock.</p>
        </div>
      )}

      <div style={{ padding: showHeader ? '1rem 1.4rem 1.4rem' : '1.4rem' }}>
        <AnimatePresence mode="wait" initial={false}>
          {state.status !== 'success' && locked ? (
            // Locked mode (a plan or catalog product): nothing to confirm — the
            // price is fixed and already shown by the calling page, so the link
            // is created automatically (see the mount effect above). One less
            // click between "I want this" and the actual payment page.
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem', borderRadius: 8, background: C.fg,
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.onFg }}>{locked.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: C.onFg }}>${(locked.cents / 100).toFixed(2)}</span>
              </div>

              {state.status === 'error' ? (
                <>
                  <p
                    style={{
                      fontSize: '0.78rem', color: 'var(--color-destructive)',
                      background: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)',
                      borderRadius: 8, padding: '0.5rem 0.7rem', margin: 0,
                    }}
                  >
                    {state.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => void createLink()}
                    style={{
                      padding: '0.6rem 1rem', background: C.primary, color: C.bg, border: 'none',
                      borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                    }}
                  >
                    Try again
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: C.muted, padding: '0.4rem 0' }}>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    style={{
                      display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                      border: `2px solid ${C.border}`, borderTopColor: C.primary,
                    }}
                  />
                  Preparing your payment…
                </div>
              )}
            </motion.div>
          ) : state.status !== 'success' ? (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '6.5rem', flexShrink: 0 }}>
                  <label htmlFor="pl-amount" style={labelStyle}>
                    Amount (USD)
                  </label>
                  <input
                    id="pl-amount"
                    type="number"
                    min={1}
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={state.status === 'loading'}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label htmlFor="pl-product" style={labelStyle}>
                    For
                  </label>
                  <input
                    id="pl-product"
                    type="text"
                    placeholder="Invoice, service, product…"
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    disabled={state.status === 'loading'}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {CHAINS.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontFamily: "'SF Mono','Fira Code',monospace",
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: C.tertiary,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      padding: '0.15rem 0.5rem',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              {state.status === 'error' && (
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
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={state.status === 'loading'}
                style={{
                  marginTop: '0.15rem',
                  padding: '0.6rem 1rem',
                  background: C.primary,
                  color: C.bg,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: state.status === 'loading' ? 'default' : 'pointer',
                  opacity: state.status === 'loading' ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                {state.status === 'loading' ? 'Creating…' : 'Create link'}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              {/* Link out to pay.one.ie's own hosted checkout, rather than embed it —
                  crypto wallets (mobile apps, browser extensions) routinely refuse to
                  connect from inside an iframe, and a real navigation is one less thing
                  that can silently break (iframe sizing, postMessage, cross-origin). */}
              {state.qr && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
                  <img
                    src={state.qr}
                    alt="Scan to pay with your phone"
                    style={{ width: 160, height: 160, borderRadius: 12, border: `1px solid ${C.border}` }}
                  />
                </div>
              )}

              <a
                href={state.url}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.7rem 1rem',
                  background: C.primary,
                  color: C.bg,
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Open payment page <ArrowRight size={15} />
              </a>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.76rem', color: C.muted, marginRight: 'auto' }}>Or scan the code / share the link</span>
                <button
                  type="button"
                  onClick={() => copyUrl(state.url)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    background: C.fg,
                    color: C.onFg,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    border: 'none',
                    background: 'transparent',
                    color: C.muted,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={13} /> New
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

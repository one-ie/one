import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  lighthouseDate: string
  /** [Performance, Accessibility, Best Practices, SEO] — stock mobile preset */
  mobileScores: [number, number, number, number]
  /** [Performance, Accessibility, Best Practices, SEO] — desktop preset */
  desktopScores: [number, number, number, number]
  pageWeightKB: number
}

const RING_LABELS = ['Performance', 'Accessibility', 'Best Practices', 'SEO']

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useAnimationTrigger(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setActive(true); return }
    // Re-arms on every viewport entry/exit — no disconnect() — so the showcase
    // replays each time a visitor scrolls back to it, not just the first time.
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  const replay = useCallback(() => {
    setActive(false)
    setTimeout(() => setActive(true), 80)
  }, [])

  return { ref, active, replay }
}

function useCountUp(target: number, duration: number, active: boolean, delayMs = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) { setCount(0); return }
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(tick)
        else setCount(target)
      }
      requestAnimationFrame(tick)
    }, delayMs)
    return () => clearTimeout(t)
  }, [target, duration, active, delayMs])
  return count
}

function readLoadMs(): number {
  if (typeof performance === 'undefined') return 0
  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (entries.length > 0 && entries[0].loadEventEnd > 0) return Math.round(entries[0].loadEventEnd)
  const t = (performance as unknown as { timing?: PerformanceTiming }).timing
  if (t?.loadEventEnd && t.navigationStart) {
    const diff = t.loadEventEnd - t.navigationStart
    return diff > 0 ? diff : 0
  }
  return 0
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shared card panel surface — L1 depth, border, card shadow. Fades + rises in on entry, staggered by `delay`. */
function Panel({ children, className = '', active = true, delay = 0 }: {
  children: React.ReactNode; className?: string; active?: boolean; delay?: number
}) {
  return (
    <div
      className={`rounded-2xl border p-7 md:p-9 space-y-6 bg-background ${className}`}
      style={{
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.97)',
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/** Lighthouse score ring — animated gauge with count-up. */
function Ring({ score, label, active, delay = 0 }: {
  score: number; label: string; active: boolean; delay?: number
}) {
  const r = 40
  const circ = 2 * Math.PI * r
  const count = useCountUp(score, 1100, active, delay)
  const offset = active ? circ * (1 - score / 100) : circ
  const strokeColor = score >= 90
    ? 'var(--color-success)'
    : score >= 70
      ? 'var(--color-secondary)'
      : 'var(--color-primary)'

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="figure"
      aria-label={`${label}: ${score}`}
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(0.85)',
        transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
      }}
    >
      <div className="relative w-[104px] h-[104px] md:w-[116px] md:h-[116px]">
        <svg viewBox="0 0 104 104" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle
            cx="52" cy="52" r={r}
            fill="none"
            strokeWidth="8"
            style={{ stroke: 'color-mix(in srgb, var(--color-font) 9%, transparent)' }}
          />
          <circle
            cx="52" cy="52" r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              stroke: strokeColor,
              strokeDasharray: circ,
              strokeDashoffset: offset,
              filter: `drop-shadow(0 0 8px color-mix(in srgb, ${strokeColor} 55%, transparent))`,
              transition: active
                ? `stroke-dashoffset 1.3s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
                : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-2xl md:text-3xl font-bold tabular-nums leading-none">{count}</span>
        </div>
      </div>
      <span className="text-xs text-font/40 text-center leading-snug max-w-[92px]">{label}</span>
    </div>
  )
}

function NetworkBar({ label, score, active, delay = 0 }: {
  label: string; score: number; active: boolean; delay?: number
}) {
  const accent = score >= 90 ? 'var(--color-success)' : 'var(--color-primary)'
  return (
    <div
      className="flex items-center gap-4"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateX(0)' : 'translateX(-10px)',
        transition: `opacity 450ms ease ${delay}ms, transform 450ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <span className="text-sm shrink-0 text-right leading-tight text-font/60" style={{ width: '96px' }}>
        {label}
      </span>
      <div
        className="flex-1 h-9 rounded-[8px] overflow-hidden"
        style={{ background: 'color-mix(in srgb, var(--color-font) 7%, transparent)' }}
      >
        <div
          className="h-full rounded-[8px] flex items-center justify-end px-3"
          style={{
            width: active ? `max(${score}%, 4px)` : '0px',
            background: accent,
            boxShadow: active ? `0 0 16px color-mix(in srgb, ${accent} 50%, transparent)` : 'none',
            transition: active ? `width 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms` : 'width 0s',
          }}
        >
          <span
            className="text-xs font-bold text-on-primary whitespace-nowrap"
            style={{ opacity: active && score > 12 ? 1 : 0, transitionDelay: `${delay + 700}ms`, transition: 'opacity 300ms ease' }}
          >
            {score}
          </span>
        </div>
      </div>
    </div>
  )
}

function LiveReceipt({ lighthouseDate, pageWeightKB, active, delay = 0 }: {
  lighthouseDate: string; pageWeightKB: number; active: boolean; delay?: number
}) {
  const [loadMs, setLoadMs] = useState<number>(0)

  useEffect(() => {
    const ms = readLoadMs()
    if (ms > 0) { setLoadMs(ms); return }
    const handler = () => setLoadMs(readLoadMs() || Math.round(performance.now()))
    window.addEventListener('load', handler)
    return () => window.removeEventListener('load', handler)
  }, [])

  const loadDisplay = loadMs > 0 ? `${(loadMs / 1000).toFixed(2)}s` : '—'

  return (
    <div
      className="rounded-2xl border p-7 md:p-9 space-y-5 font-mono"
      style={{
        background: 'var(--color-foreground)',
        borderColor: 'var(--color-border)',
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.97)',
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <p className="text-xs uppercase tracking-widest text-font/40">Live — your browser measured this</p>
      <div className="flex items-baseline justify-between">
        <span className="text-base text-font/60">This page loaded in</span>
        <span className="text-3xl font-bold tabular-nums text-primary">{loadDisplay}</span>
      </div>
      <div
        className="flex items-baseline justify-between border-t pt-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-base text-font/60">JS + assets transferred</span>
        <span className="text-3xl font-bold tabular-nums text-primary">{pageWeightKB} KB</span>
      </div>
      <p
        className="text-xs text-font/40 pt-1 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        Lighthouse measured <time dateTime={lighthouseDate}>{lighthouseDate}</time>
      </p>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function SpeedShowcase({ lighthouseDate, mobileScores, desktopScores, pageWeightKB }: Props) {
  const { ref, active, replay } = useAnimationTrigger(0.15)

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="space-y-10">

      {/* Header */}
      <header
        className="max-w-3xl"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-font/40">Speed</p>
          <button
            onClick={() => { emitClick('speed', 'replay'); replay() }}
            aria-label="Replay animations"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-[opacity,filter] duration-[120ms] hover:brightness-110 text-font/60"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-background)',
            }}
          >
            <RotateCcw size={11} strokeWidth={2} aria-hidden="true" />
            Replay
          </button>
        </div>
        <h2 className="text-5xl lg:text-6xl font-semibold leading-[1.03] tracking-tight">
          Speed is a{' '}
          <span className="text-tertiary">measurement</span>.{' '}
          Not a claim.
        </h2>
        <p className="mt-6 text-lg md:text-xl text-font/60 leading-relaxed">
          This page times itself while you read it: page load, transfer weight, latest audit —
          dated, reproducible, measured on the build actually shipping. Re-run the command below
          against your own clone.
        </p>
      </header>

      {/* Four panels */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Panel 1 — Lighthouse rings (mobile, stock preset) */}
        <Panel active={active} delay={0}>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-font/40">Lighthouse · Slow 4G</span>
            <span className="text-xs text-font/40" aria-hidden="true">—</span>
            <span className="text-xs text-font/40">
              measured <time dateTime={lighthouseDate}>{lighthouseDate}</time>
            </span>
          </div>
          <div className="flex justify-around" role="list" aria-label="Lighthouse scores, mobile preset">
            {mobileScores.map((score, i) => (
              <Ring
                key={RING_LABELS[i]}
                score={score}
                label={RING_LABELS[i]}
                active={active}
                delay={i * 130}
              />
            ))}
          </div>
          <div className="pt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-base text-font/60">
              Lighthouse's harshest default: throttled mobile CPU + Slow 4G.
            </p>
          </div>
        </Panel>

        {/* Panel 2 — desktop vs mobile performance */}
        <Panel active={active} delay={90}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-font/40">Performance score</span>
          </div>
          <div className="space-y-4" role="list" aria-label="Performance score by network condition">
            <NetworkBar label="Desktop" score={desktopScores[0]} active={active} delay={0} />
            <NetworkBar label="Slow 4G" score={mobileScores[0]} active={active} delay={110} />
          </div>
          <p className="text-xs text-font/40 pt-1">
            Same build, same page, two throttling presets — the gap is the network, not the code.
          </p>
        </Panel>

        {/* Panel 3 — Live receipt (L2 surface — foreground bg) */}
        <LiveReceipt lighthouseDate={lighthouseDate} pageWeightKB={pageWeightKB} active={active} delay={180} />

        {/* Panel 4 — accessibility / best practices / seo, desktop */}
        <Panel active={active} delay={270}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-font/40">Desktop · fast network</span>
          </div>
          <div className="flex justify-around" role="list" aria-label="Lighthouse scores, desktop preset">
            {desktopScores.map((score, i) => (
              <Ring
                key={RING_LABELS[i]}
                score={score}
                label={RING_LABELS[i]}
                active={active}
                delay={i * 110}
              />
            ))}
          </div>
          <p className="text-xs text-font/40 pt-1">
            Same page, unthrottled — what a broadband visitor actually sees.
          </p>
        </Panel>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'

interface Props {
  /** [Performance, Accessibility, Best Practices, SEO] */
  scores: [number, number, number, number]
  /** Small honest caption under the rings — real numbers only. */
  caption?: string
}

const LABELS = ['Perf', 'A11y', 'Best', 'SEO']

function useCountUp(target: number, duration: number, active: boolean, delayMs = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - p) ** 3
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

function Ring({ score, label, active, delay = 0 }: { score: number; label: string; active: boolean; delay?: number }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const count = useCountUp(score, 900, active, delay)
  const offset = active ? circ * (1 - score / 100) : circ
  const stroke = score >= 90 ? 'var(--color-success)' : score >= 70 ? 'var(--color-secondary)' : 'var(--color-primary)'

  return (
    <div className="lr-ring" style={{ opacity: active ? 1 : 0, transition: `opacity 400ms ease ${delay}ms` }}>
      <div className="lr-ring-svg">
        <svg viewBox="0 0 88 88" className="lr-svg" aria-hidden="true">
          <circle cx="44" cy="44" r={r} fill="none" strokeWidth="7" style={{ stroke: 'color-mix(in srgb, var(--color-font) 10%, transparent)' }} />
          <circle
            cx="44" cy="44" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
            style={{
              stroke, strokeDasharray: circ, strokeDashoffset: offset,
              transition: active ? `stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms` : 'none',
            }}
          />
        </svg>
        <span className="lr-count">{count}</span>
      </div>
      <span className="lr-label">{label}</span>
    </div>
  )
}

export function LighthouseRings({ scores, caption }: Props) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setActive(true), reduced ? 0 : 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="lr">
      <div className="lr-rings" role="list" aria-label="Lighthouse scores, desktop">
        {scores.map((s, i) => (
          <Ring key={LABELS[i]} score={s} label={LABELS[i]} active={active} delay={i * 100} />
        ))}
      </div>
      {caption && <p className="lr-caption">{caption}</p>}
    </div>
  )
}

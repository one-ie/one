import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

/**
 * ProofTerminal — an animated replay of a REAL proof run.
 *
 * The steps and timings are captured from an actual execution of
 * pay/tools/agent-onboarding-lifecycle-demo.ts against production — this
 * component animates the replay (rows land in sequence, clock counts up),
 * it does not simulate or invent results. Playback is time-compressed;
 * the printed timestamps are the genuine measured ones.
 *
 * Inline styles per this repo's island convention (Tailwind classNames
 * don't compile inside React islands — see PaymentLinkGenerator.tsx).
 */

const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  tertiary: 'var(--color-tertiary)',
  primary: 'var(--color-primary)',
}

const mono = "'SF Mono','Fira Code',monospace"

export interface ProofStep {
  /** Real elapsed seconds at which this step completed */
  t: number
  ok: boolean
  label: string
  detail: string
}

interface Props {
  command: string
  steps: ProofStep[]
  verdict: string
  /** Seconds of playback per step row. Default 0.55 */
  cadenceS?: number
}

export default function ProofTerminal({ command, steps, verdict, cadenceS = 0.55 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const [reduced, setReduced] = useState(false)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setShown(steps.length + 1)
      return
    }
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(i)
      if (i > steps.length) clearInterval(id)
    }, cadenceS * 1000)
    return () => clearInterval(id)
  }, [inView, reduced, steps.length, cadenceS])

  return (
    <div
      ref={ref}
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.bg,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.8rem 1.1rem',
          borderBottom: `1px solid ${C.border}`,
          background: C.fg,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#e5484d' }} />
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#f5a524' }} />
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#30a46c' }} />
        <span
          style={{
            marginLeft: '0.5rem',
            fontFamily: mono,
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          live proof · recorded run
        </span>
      </div>

      <div style={{ padding: '1.1rem 1.25rem', fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.7 }}>
        <div style={{ color: C.muted, overflowWrap: 'anywhere', marginBottom: '0.6rem' }}>
          <span style={{ color: C.primary }}>$</span> {command}
        </div>

        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={shown > i ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: shown > i || reduced ? 'flex' : 'none',
              gap: '0.75rem',
              alignItems: 'baseline',
              padding: '0.2rem 0',
            }}
          >
            <span style={{ color: C.muted, fontSize: '0.68rem', minWidth: '3.6rem', textAlign: 'right', flexShrink: 0 }}>
              {s.t.toFixed(1)}s
            </span>
            <span style={{ color: s.ok ? C.primary : '#e5484d', flexShrink: 0 }}>{s.ok ? '✓' : '✗'}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ color: C.font }}>{s.label}</span>
              <span style={{ color: C.muted }}> — {s.detail}</span>
            </span>
          </motion.div>
        ))}

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={shown > steps.length ? { opacity: 1 } : {}}
          transition={{ duration: 0.35 }}
          style={{
            display: shown > steps.length || reduced ? 'block' : 'none',
            marginTop: '0.7rem',
            paddingTop: '0.7rem',
            borderTop: `1px solid ${C.border}`,
            color: C.primary,
            fontWeight: 700,
          }}
        >
          {verdict}
        </motion.div>
      </div>
    </div>
  )
}

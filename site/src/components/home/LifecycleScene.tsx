import { motion, useTransform, type MotionValue } from 'motion/react'
import ScrollScene from '@/components/motion/ScrollScene'

/**
 * LifecycleScene — a signature ScrollScene for the homepage.
 *
 * A sticky panel that scrubs the clone → configure → ship lifecycle as you
 * scroll. Each phase lights up cumulatively and gets an accent line while it
 * is the "active" step; a rail tracks overall progress. All colour comes from
 * the 6 design tokens, so it re-tints with the active theme. Every value is
 * driven by scroll progress — no autoplay, so the content reads at any
 * scroll position (reduced-motion friendly: nothing moves on its own).
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

const PHASES = [
  {
    n: '01',
    title: 'Clone the template',
    body: 'Astro 6, React 19, Tailwind 4 and shadcn/ui — wired and ready.',
    cmd: 'npm create one-app@latest my-site',
  },
  {
    n: '02',
    title: 'Configure one.config.ts',
    body: 'Set your brand tokens, choose plugins, point at your backend.',
    cmd: "primary: 'hsl(216 55% 25%)'",
  },
  {
    n: '03',
    title: 'Ship to Cloudflare',
    body: 'Global edge, zero cold starts, a generous free tier.',
    cmd: 'wrangler deploy',
  },
]

const mono = "'SF Mono','Fira Code',monospace"

function Phase({
  progress,
  i,
  phase,
}: {
  progress: MotionValue<number>
  i: number
  phase: (typeof PHASES)[number]
}) {
  const a = i / PHASES.length
  const b = (i + 1) / PHASES.length
  // NOTE: Motion drives these through the native WAAPI ScrollTimeline, which
  // treats each input range as keyframe offsets — they MUST stay within [0,1]
  // and strictly increase. Keep every boundary clamped; never go negative or
  // past 1, and never chain a scroll transform into another.
  // Cumulative light — ramps up as you reach the phase, then stays lit.
  const opacity = useTransform(progress, [a, a + 0.08], [0.5, 1])
  const y = useTransform(progress, [a, a + 0.08], [18, 0])
  // Active window — peaks while this phase is the current step (derived
  // straight from progress, not from another motion value).
  const active = useTransform(progress, [a, a + 0.05, b - 0.05, b], [0, 1, 1, 0])
  const scale = useTransform(progress, [a, a + 0.05, b - 0.05, b], [1, 1.02, 1.02, 1])

  return (
    <motion.div
      style={{
        opacity,
        y,
        scale,
        position: 'relative',
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '1.6rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflow: 'hidden',
      }}
    >
      {/* active accent line — opacity interpolates cleanly; colour stays a token */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: C.primary,
          opacity: active,
        }}
      />
      <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', color: C.primary, lineHeight: 1 }}>
        {phase.n}
      </div>
      <strong style={{ fontSize: '1rem', color: C.font }}>{phase.title}</strong>
      <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: C.muted, margin: 0, flex: 1 }}>{phase.body}</p>
      <pre
        style={{
          background: C.fg,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '0.5rem 0.7rem',
          margin: 0,
          fontSize: '0.74rem',
          fontFamily: mono,
          color: C.tertiary,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <code>{phase.cmd}</code>
      </pre>
    </motion.div>
  )
}

function Stage({ progress }: { progress: MotionValue<number> }) {
  const railWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '64rem',
        margin: '0 auto',
        padding: '0 1.5rem',
        width: '100%',
      }}
    >
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.primary,
          margin: '0 0 0.75rem',
        }}
      >
        Get started in minutes
      </p>
      <h2
        style={{
          fontSize: 'clamp(2rem, 4.5vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 1.12,
          color: C.font,
          margin: '0 0 2.25rem',
        }}
      >
        From clone to production.
        <br />
        Scroll to watch it ship.
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {PHASES.map((phase, i) => (
          <Phase key={phase.n} progress={progress} i={i} phase={phase} />
        ))}
      </div>

      {/* progress rail */}
      <div style={{ marginTop: '2.25rem', height: 3, background: C.border, borderRadius: 9999, overflow: 'hidden' }}>
        <motion.div style={{ width: railWidth, height: '100%', background: C.primary }} />
      </div>
    </div>
  )
}

export default function LifecycleScene() {
  return <ScrollScene height="280vh">{(progress) => <Stage progress={progress} />}</ScrollScene>
}

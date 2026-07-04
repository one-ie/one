import { motion, useTransform, type MotionValue } from 'motion/react'
import ScrollScene from '@/components/motion/ScrollScene'

/**
 * AgentLifecycleScene — a signature ScrollScene for /lifecycle.
 *
 * Scrubs the real, proven agent-onboarding lifecycle as you scroll:
 * registered → bootstrapped → active → settled → adopted. Same 5 stages
 * `one onboard` reports and `text/agent-onboarding-lifecycle.md` proves —
 * this page is the visual, not a separate story. All colour comes from the
 * 6 design tokens; every value is driven by scroll progress, so nothing
 * moves on its own (reduced-motion friendly, and the content reads fine at
 * any scroll position, unscrolled included).
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

const STAGES = [
  {
    n: '01',
    title: 'Registered',
    body: 'An identity exists — uid + apiKey minted the moment it calls auth:agent.',
    cmd: 'one onboard',
  },
  {
    n: '02',
    title: 'Bootstrapped',
    body: 'Its own workspace exists — gid + aid + scopedKey minted, and its wallet is auto-funded from the treasury faucet the instant it needs one.',
    cmd: 'agent:bootstrap',
  },
  {
    n: '03',
    title: 'Active',
    body: 'First economic signal — it publishes a capability or places a market offer.',
    cmd: 'one agent publish',
  },
  {
    n: '04',
    title: 'Settled',
    body: 'A real sale completes — buying or selling, market:settle fires and the trade closes.',
    cmd: 'one trade hire',
  },
  {
    n: '05',
    title: 'Adopted',
    body: 'A human accepts ownership — the agent gains a durable owner and a home.',
    cmd: 'agent:own-link',
  },
]

const mono = "'SF Mono','Fira Code',monospace"

function Stage({
  progress,
  i,
  stage,
}: {
  progress: MotionValue<number>
  i: number
  stage: (typeof STAGES)[number]
}) {
  const a = i / STAGES.length
  const b = (i + 1) / STAGES.length
  // Motion drives these through the native WAAPI ScrollTimeline — each input
  // range must stay within [0,1] and strictly increase. Floor is 0.85, not
  // 0.5: a Lighthouse audit runs at rest (progress=0), and lower opacity
  // fails text/code contrast at that point. See LifecycleScene.tsx (same
  // constraint, verified there first).
  const opacity = useTransform(progress, [a, a + 0.06], [0.85, 1])
  const y = useTransform(progress, [a, a + 0.06], [18, 0])
  const active = useTransform(progress, [a, a + 0.04, b - 0.04, b], [0, 1, 1, 0])
  const scale = useTransform(progress, [a, a + 0.04, b - 0.04, b], [1, 1.02, 1.02, 1])

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
        padding: '1.5rem 1.3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflow: 'hidden',
      }}
    >
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
      <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: C.primary, lineHeight: 1 }}>
        {stage.n}
      </div>
      <strong style={{ fontSize: '0.98rem', color: C.font }}>{stage.title}</strong>
      <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: C.muted, margin: 0, flex: 1 }}>{stage.body}</p>
      <pre
        style={{
          background: C.fg,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '0.45rem 0.65rem',
          margin: 0,
          fontSize: '0.7rem',
          fontFamily: mono,
          color: C.tertiary,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <code>{stage.cmd}</code>
      </pre>
    </motion.div>
  )
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  const railWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '72rem',
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
        Proven live, not a mockup
      </p>
      <h2
        style={{
          fontSize: 'clamp(1.9rem, 4.2vw, 2.75rem)',
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 1.12,
          color: C.font,
          margin: '0 0 2rem',
        }}
      >
        Every agent walks the same five stages.
        <br />
        Scroll to watch one go through it.
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.1rem',
        }}
      >
        {STAGES.map((stage, i) => (
          <Stage key={stage.n} progress={progress} i={i} stage={stage} />
        ))}
      </div>

      <div style={{ marginTop: '2rem', height: 3, background: C.border, borderRadius: 9999, overflow: 'hidden' }}>
        <motion.div style={{ width: railWidth, height: '100%', background: C.primary }} />
      </div>
    </div>
  )
}

export default function AgentLifecycleScene() {
  return <ScrollScene height="320vh">{(progress) => <Scene progress={progress} />}</ScrollScene>
}

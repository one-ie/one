import { useTransform, motion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { ease } from '@/lib/motion'

interface Props {
  progress: MotionValue<number>
}

const STEPS = [
  { label: 'Signal arrives',      icon: '◈', color: 'var(--color-primary)' },
  { label: 'Path selected',       icon: '⟶', color: 'var(--color-secondary)' },
  { label: 'Handler executes',    icon: '⚡', color: 'var(--color-tertiary)' },
  { label: 'Pheromone deposited', icon: '✓', color: 'var(--color-primary)' },
]

function Step({ label, icon, color, isActive, isDone }: {
  label: string; icon: string; color: string
  isActive: boolean; isDone: boolean
}) {
  return (
    <motion.div
      animate={{
        opacity: isDone || isActive ? 1 : 0.25,
        x: isActive ? 6 : 0,
      }}
      transition={{ duration: 0.3, ease: ease.out }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        background: isActive
          ? `color-mix(in srgb, ${color} 10%, var(--color-foreground))`
          : 'transparent',
        border: `1px solid ${isActive ? color : 'var(--color-border)'}`,
        marginBottom: '0.75rem',
        transition: 'border-color 200ms',
      }}
    >
      <motion.span
        animate={{ scale: isActive ? 1.3 : 1, color: isDone || isActive ? color : 'var(--color-muted)' }}
        transition={{ duration: 0.2 }}
        style={{ fontSize: '1.4rem', width: '1.75rem', textAlign: 'center', display: 'block' }}
      >
        {isDone ? '✓' : icon}
      </motion.span>
      <span style={{ fontSize: '1rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
      {isActive && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginLeft: 'auto',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color,
          }}
        >
          active
        </motion.span>
      )}
    </motion.div>
  )
}

export default function CounterDemo({ progress }: Props) {
  const stepIndex = useTransform(progress, [0, 0.85], [0, STEPS.length - 0.01])

  // We need to use the MotionValue in a way that triggers re-renders
  // Use a derived motion value for the display number
  const displayPct = useTransform(progress, [0, 1], [0, 100])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(2rem, 6vw, 6rem)',
        maxWidth: '700px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <p style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-primary)',
        marginBottom: '0.5rem',
      }}>
        ScrollScene — scrubbed progress
      </p>

      <h2 style={{
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginBottom: '2.5rem',
      }}>
        One signal. Four steps.<br />Scroll to advance.
      </h2>

      <StepsRenderer stepIndex={stepIndex} />

      <ProgressBar displayPct={displayPct} />
    </div>
  )
}

function StepsRenderer({ stepIndex }: { stepIndex: MotionValue<number> }) {
  // Motion values don't trigger re-renders by default — we subscribe
  const [idx, setIdx] = React.useState(0)

  React.useEffect(() => {
    return stepIndex.on('change', (v) => setIdx(Math.floor(v)))
  }, [stepIndex])

  return (
    <div>
      {STEPS.map((step, i) => (
        <Step
          key={step.label}
          {...step}
          isActive={i === idx}
          isDone={i < idx}
        />
      ))}
    </div>
  )
}

function ProgressBar({ displayPct }: { displayPct: MotionValue<number> }) {
  const [pct, setPct] = React.useState(0)

  React.useEffect(() => {
    return displayPct.on('change', (v) => setPct(Math.round(v)))
  }, [displayPct])

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.78rem',
        color: 'var(--color-muted)',
      }}>
        <span>scroll progress</span>
        <span>{pct}%</span>
      </div>
      <div style={{
        height: '3px',
        background: 'var(--color-foreground)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: '2px',
            width: `${pct}%`,
          }}
          transition={{ duration: 0, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

// Need React import for hooks
import React from 'react'

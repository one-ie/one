import React, { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { ease } from '@/lib/motion'

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
      animate={{ opacity: isDone || isActive ? 1 : 0.25, x: isActive ? 6 : 0 }}
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
            textTransform: 'uppercase' as const,
            color,
          }}
        >
          active
        </motion.span>
      )}
    </motion.div>
  )
}

function ProgressTracker({ progress }: { progress: MotionValue<number> }) {
  const [pct, setPct] = useState(0)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      setPct(Math.round(v * 100))
      setIdx(Math.min(Math.floor(v * STEPS.length * 0.99), STEPS.length - 1))
    })
    return unsub
  }, [progress])

  return (
    <>
      {STEPS.map((step, i) => (
        <Step key={step.label} {...step} isActive={i === idx} isDone={i < idx} />
      ))}

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
          <div style={{
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: '2px',
            width: `${pct}%`,
            transition: 'width 60ms linear',
          }} />
        </div>
      </div>
    </>
  )
}

interface Props {
  /** Height of the scroll track — more = more scrub time */
  height?: string
  className?: string
}

export default function ScrollCounter({ height = '280vh', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <div ref={ref} style={{ height, contain: 'layout paint' }}>
      <div
        className={className}
        style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}
      >
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(2rem, 6vw, 6rem)',
          maxWidth: '700px',
          margin: '0 auto',
          width: '100%',
        }}>
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

          <ProgressTracker progress={scrollYProgress} />
        </div>
      </div>
    </div>
  )
}

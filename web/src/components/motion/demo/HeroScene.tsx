import { motion } from 'motion/react'
import { ease, duration } from '@/lib/motion'

const DOTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (i % 6) * 18 + 4,
  y: Math.floor(i / 6) * 22 + 4,
  delay: i * 0.03,
  size: i % 3 === 0 ? 6 : 3,
}))

const LINES = [
  { x1: '22%', y1: '26%', x2: '55%', y2: '48%', delay: 0.4 },
  { x1: '55%', y1: '48%', x2: '76%', y2: '26%', delay: 0.55 },
  { x1: '40%', y1: '70%', x2: '55%', y2: '48%', delay: 0.65 },
  { x1: '22%', y1: '26%', x2: '40%', y2: '70%', delay: 0.75 },
]

export default function HeroScene() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', opacity: 0.25 }}
      >
        {/* animated connection lines */}
        {LINES.map((l, i) => (
          <motion.line
            key={i}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            stroke="var(--color-primary)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: l.delay, duration: duration.slow, ease: ease.out }}
          />
        ))}

        {/* node dots */}
        {DOTS.map((d) => (
          <motion.circle
            key={d.id}
            cx={`${d.x}%`}
            cy={`${d.y}%`}
            r={d.size * 0.15}
            fill="var(--color-primary)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: d.size === 6 ? 1 : 0.5 }}
            transition={{
              delay: d.delay,
              ...ease.spring,
            }}
          />
        ))}
      </svg>

      {/* radial glow */}
      <motion.div
        style={{
          position: 'absolute',
          right: '15%',
          top: '20%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: ease.out, delay: 0.2 }}
      />
    </div>
  )
}

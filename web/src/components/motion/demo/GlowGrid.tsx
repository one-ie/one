import { motion } from 'motion/react'

const NODES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  x: (i % 3) * 33 + 16,
  y: Math.floor(i / 3) * 33 + 16,
  delay: i * 0.05,
}))

export default function GlowGrid() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
      aria-hidden
    >
      {NODES.map((n) => (
        <motion.circle
          key={n.id}
          cx={`${n.x}%`}
          cy={`${n.y}%`}
          r="2.5"
          fill="var(--color-secondary)"
          initial={{ opacity: 0.15, scale: 0.6 }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.6, 1.2, 0.6] }}
          transition={{
            delay: n.delay,
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  )
}

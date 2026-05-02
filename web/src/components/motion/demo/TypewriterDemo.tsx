import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ease } from '@/lib/motion'

const WORDS = ['Signals', 'Paths', 'Strength', 'Learning', 'Highways']

export default function TypewriterDemo() {
  const [selected, setSelected] = useState(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Word switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {WORDS.map((w, i) => (
          <motion.button
            key={w}
            onClick={() => setSelected(i)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={ease.spring}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              border: `1px solid ${i === selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: i === selected
                ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-background))'
                : 'var(--color-background)',
              color: i === selected ? 'var(--color-primary)' : 'var(--color-muted)',
              fontSize: '0.85rem',
              fontWeight: i === selected ? 600 : 400,
              cursor: 'pointer',
              transition: 'border-color 120ms, background 120ms',
            }}
          >
            {w}
          </motion.button>
        ))}
      </div>

      {/* Animated label */}
      <div
        style={{
          position: 'relative',
          height: '5rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.h3
            key={selected}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.32, ease: ease.out }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-primary)',
              position: 'absolute',
              margin: 0,
            }}
          >
            {WORDS[selected]}
          </motion.h3>
        </AnimatePresence>
      </div>

      {/* Spring-animated progress dots */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {WORDS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === selected ? 28 : 8,
              background: i === selected
                ? 'var(--color-primary)'
                : 'var(--color-border)',
            }}
            transition={ease.spring}
            style={{
              height: 8,
              borderRadius: 4,
            }}
          />
        ))}
      </div>

      {/* Layout animation demo */}
      <div
        style={{
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <p style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '1rem' }}>
          Spring motion — hover &amp; tap the buttons above
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['scale', 'border', 'color', 'blur', 'layout'].map((feat) => (
            <motion.span
              key={feat}
              layout
              whileHover={{ scale: 1.06 }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
                fontSize: '0.78rem',
                fontWeight: 500,
              }}
            >
              {feat}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  )
}

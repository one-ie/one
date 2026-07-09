import { useState, useRef, useEffect } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from 'motion/react'
import type { MotionValue } from 'motion/react'
import { ease, duration as dur } from '@/lib/motion'
import ScrollScene from './ScrollScene'

// ─── design tokens (CSS vars) ─────────────────────────────────────────────
const C = {
  bg:       'var(--color-background)',
  fg:       'var(--color-foreground)',
  onFg:     'var(--color-on-foreground)', // text/icons ON a C.fg fill — a theme can fill foreground with a saturated brand tone
  border:   'var(--color-border)',
  font:     'var(--color-font)',
  muted:    'var(--color-muted)',
  primary:  'var(--color-primary)',
  secondary:'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  r:        { sm: '6px', md: '10px', lg: '16px' },
}

// ─── shared micro-components ──────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{
      background: C.fg, border: `1px solid ${C.border}`,
      borderRadius: C.r.md, padding: '0.95rem 1.2rem',
      fontSize: '0.77rem', lineHeight: 1.65,
      fontFamily: "'SF Mono','Fira Code',monospace",
      overflow: 'auto', margin: 0, color: C.tertiary,
    }}>
      <code>{code}</code>
    </pre>
  )
}

function ReplayBtn({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
      transition={ease.spring}
      style={{
        padding: '0.35rem 0.8rem', borderRadius: C.r.md,
        border: `1px solid ${C.border}`, background: C.bg,
        color: C.muted, fontSize: '0.73rem', fontWeight: 600,
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      ↺ Replay
    </motion.button>
  )
}

// ─── panel 1 — Reveal ────────────────────────────────────────────────────

const REVEAL_VARIANTS = [
  { dist: 12, d: 0.32, label: 'sm · fast',       color: C.secondary },
  { dist: 24, d: 0.48, label: 'md · base',        color: C.primary, active: true },
  { dist: 48, d: 0.72, label: 'lg · slow',        color: C.tertiary },
]

export function RevealPanel() {
  const [k, setK] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.83rem', color: C.muted, lineHeight: 1.55 }}>
          Fade + translate on viewport entry. Fires once via <code style={{ color: C.tertiary }}>viewport: once</code>.
        </p>
        <ReplayBtn onClick={() => setK(k + 1)} />
      </div>
      <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {REVEAL_VARIANTS.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: v.dist }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: v.d, ease: ease.out }}
            style={{
              padding: '0.8rem 1rem', borderRadius: C.r.md,
              border: `1px solid ${v.active ? v.color : C.border}`,
              background: v.active ? `color-mix(in srgb, ${v.color} 10%, ${C.bg})` : C.bg,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <code style={{ fontSize: '0.8rem', color: v.color }}>{v.label}</code>
            <span style={{ fontSize: '0.7rem', color: C.muted }}>y: {v.dist}px · {v.d}s</span>
          </motion.div>
        ))}
      </div>
      <CodeBlock code={`<Reveal client:visible dist="md" speed="base" delay={0.1}>\n  <HeroHeadline />\n</Reveal>`} />
    </div>
  )
}

// ─── panel 2 — Stagger ───────────────────────────────────────────────────

const SIGNAL_STEPS = [
  'Signal arrives', 'Path selected', 'Handler executes',
  'Result marks the path', 'Highway hardens', 'Loop closes',
]
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = {
  hidden: { opacity: 0, x: -14 },
  show:   { opacity: 1, x: 0, transition: { duration: dur.base, ease: ease.out } },
}

export function StaggerPanel() {
  const [k, setK] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.83rem', color: C.muted }}>
          One parent — all children stagger via <code style={{ color: C.tertiary }}>staggerChildren</code>.
        </p>
        <ReplayBtn onClick={() => setK(k + 1)} />
      </div>
      <motion.div key={k} variants={container} initial="hidden" animate="show">
        {SIGNAL_STEPS.map((label, i) => (
          <motion.div
            key={label} variants={item}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 0',
              borderBottom: i < SIGNAL_STEPS.length - 1 ? `1px solid ${C.border}` : 'none',
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: `color-mix(in srgb, ${C.primary} 14%, ${C.fg})`,
              border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.62rem', fontWeight: 700, color: C.primary,
            }}>{i + 1}</span>
            <span style={{ fontSize: '0.86rem' }}>{label}</span>
          </motion.div>
        ))}
      </motion.div>
      <CodeBlock code={`<Stagger client:visible stagger={0.08}>\n  {items.map(i => <Card key={i} />)}\n</Stagger>`} />
    </div>
  )
}

// ─── panel 3 — Parallax ─────────────────────────────────────────────────
// Three visually distinct layers at genuine depth: dot field → orbs → card.
// A coordinate readout + per-layer speed badge makes the concept legible.

const ORBS = [
  { x: '22%',  y: '38%', r: 34, color: C.primary,   opacity: 0.85 },
  { x: '64%',  y: '58%', r: 22, color: C.secondary,  opacity: 0.75 },
  { x: '76%',  y: '22%', r: 16, color: C.tertiary,   opacity: 0.70 },
  { x: '42%',  y: '72%', r: 12, color: C.primary,    opacity: 0.50 },
]

function DotGrid() {
  const pts: { cx: number; cy: number }[] = []
  for (let x = 0; x <= 200; x += 20)
    for (let y = 0; y <= 200; y += 20)
      pts.push({ cx: x, cy: y })
  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '140%', height: '140%', top: '-20%', left: '-20%' }}
      aria-hidden
    >
      {pts.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={1.2} fill={C.primary} opacity={0.22} />
      ))}
    </svg>
  )
}

function CoordReadout({ rx, ry }: { rx: ReturnType<typeof useSpring>; ry: ReturnType<typeof useSpring> }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const u1 = rx.on('change', v => setCoords(c => ({ ...c, x: v })))
    const u2 = ry.on('change', v => setCoords(c => ({ ...c, y: v })))
    return () => { u1(); u2() }
  }, [rx, ry])
  const fmt = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2)
  return (
    <div style={{
      position: 'absolute', bottom: '0.9rem', right: '0.9rem',
      fontFamily: "'SF Mono','Fira Code',monospace",
      fontSize: '0.62rem', color: C.muted,
      background: `color-mix(in srgb, ${C.bg} 85%, transparent)`,
      border: `1px solid ${C.border}`,
      borderRadius: C.r.sm, padding: '0.25rem 0.5rem',
      backdropFilter: 'blur(4px)',
      lineHeight: 1.8,
    }}>
      x {fmt(coords.x)}<br />y {fmt(coords.y)}
    </div>
  )
}

export function ParallaxPanel() {
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  // Spring-smooth the normalised -1…+1 mouse position
  const sx = useSpring(rawX, { stiffness: 55, damping: 16 })
  const sy = useSpring(rawY, { stiffness: 55, damping: 16 })

  // Layer offsets — far moves most, near moves least
  const farX  = useTransform(sx, [-1, 1], [-48, 48])
  const farY  = useTransform(sy, [-1, 1], [-48, 48])
  const midX  = useTransform(sx, [-1, 1], [-22, 22])
  const midY  = useTransform(sy, [-1, 1], [-22, 22])
  const nearX = useTransform(sx, [-1, 1], [ -8,  8])
  const nearY = useTransform(sy, [-1, 1], [ -8,  8])

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    rawX.set((e.clientX - r.left) / r.width  * 2 - 1)
    rawY.set((e.clientY - r.top)  / r.height * 2 - 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* layer legend */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { label: 'Far',  speed: '4×', color: C.border },
          { label: 'Mid',  speed: '2×', color: C.secondary },
          { label: 'Near', speed: '1×', color: C.primary },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: C.muted }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            {l.label} <span style={{ color: l.color, fontWeight: 700 }}>{l.speed}</span>
          </div>
        ))}
        <p style={{ margin: 0, fontSize: '0.72rem', color: C.muted, marginLeft: 'auto' }}>
          Move cursor over canvas
        </p>
      </div>

      {/* canvas */}
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => { rawX.set(0); rawY.set(0) }}
        style={{
          position: 'relative', height: '264px',
          borderRadius: C.r.lg, border: `1px solid ${C.border}`,
          background: C.fg, overflow: 'hidden', cursor: 'crosshair',
          userSelect: 'none',
        }}
      >
        {/* ── Layer 0: dot field (far) ── */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, x: farX, y: farY,
            willChange: 'transform',
          }}
        >
          <DotGrid />
        </motion.div>

        {/* ── Layer 1: glowing orbs (mid) ── */}
        <motion.div
          style={{ position: 'absolute', inset: 0, x: midX, y: midY, willChange: 'transform' }}
        >
          {ORBS.map((o, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: o.x, top: o.y,
              width: o.r * 2, height: o.r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, color-mix(in srgb, ${o.color} 80%, white) 0%, color-mix(in srgb, ${o.color} 30%, transparent) 60%, transparent 80%)`,
              opacity: o.opacity,
              transform: 'translate(-50%,-50%)',
              boxShadow: `0 0 ${o.r * 1.5}px color-mix(in srgb, ${o.color} 35%, transparent)`,
            }} />
          ))}
          {/* connecting lines between orbs — gives a graph / network feel */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
            {[[0,1],[1,2],[2,3],[0,3]].map(([a,b], i) => (
              <line
                key={i}
                x1={ORBS[a].x} y1={ORBS[a].y}
                x2={ORBS[b].x} y2={ORBS[b].y}
                stroke={C.border} strokeWidth={0.8} opacity={0.6}
              />
            ))}
          </svg>
        </motion.div>

        {/* ── Layer 2: near card ── */}
        <motion.div
          style={{
            position: 'absolute', top: '1rem', left: '1rem',
            x: nearX, y: nearY, willChange: 'transform',
          }}
        >
          <div style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: C.r.md,
            padding: '0.5rem 0.8rem',
            fontSize: '0.73rem', fontWeight: 600,
            boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary }} />
            Near · 1×
          </div>
        </motion.div>

        {/* ── live coordinate readout ── */}
        <CoordReadout rx={sx} ry={sy} />
      </div>

      <CodeBlock code={`<Parallax client:visible speed={60} direction="up">\n  <BackgroundGrid />\n</Parallax>`} />
    </div>
  )
}

// ─── panel 4 — ScrollScene ────────────────────────────────────────────────

const SCENE_STEPS = ['Signal enters', 'Route resolves', 'Handler fires', 'Loop closes']

export function ScrollScenePanel() {
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const t0 = performance.now(), dur = 3400
    let raf: number
    const tick = (now: number) => {
      setProgress(((now - t0) % dur) / dur)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  const activeIdx = Math.min(Math.floor(progress * SCENE_STEPS.length), SCENE_STEPS.length - 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.83rem', color: C.muted }}>
          Sticky pin exposes <code style={{ color: C.tertiary }}>progress 0→1</code> as a MotionValue to all children.
        </p>
        <motion.button
          onClick={() => setRunning(r => !r)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} transition={ease.spring}
          style={{
            padding: '0.35rem 0.8rem', borderRadius: C.r.md, flexShrink: 0,
            border: `1px solid ${C.border}`, background: C.bg,
            color: C.muted, fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {running ? '⏸ Pause' : '▶ Play'}
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {SCENE_STEPS.map((label, i) => {
          const isActive = i === activeIdx
          const isDone = i < activeIdx
          return (
            <motion.div
              key={label}
              animate={{ opacity: isDone || isActive ? 1 : 0.28 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.9rem', borderRadius: C.r.md,
                border: `1px solid ${isActive ? C.primary : C.border}`,
                background: isActive ? `color-mix(in srgb, ${C.primary} 8%, ${C.bg})` : C.bg,
                transition: 'border-color 180ms, background 180ms',
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.25 : 1 }}
                style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: isDone || isActive ? C.primary : C.border,
                  boxShadow: isActive ? `0 0 8px ${C.primary}` : 'none',
                }}
              />
              <span style={{ fontSize: '0.86rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, color: C.primary }}
                >
                  active
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: C.muted, marginBottom: '0.4rem' }}>
          <span>progress</span><span>{Math.round(progress * 100)}%</span>
        </div>
        <div style={{ height: 2, background: C.fg, borderRadius: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: C.primary, borderRadius: 1,
            width: `${progress * 100}%`, transition: 'width 30ms linear',
          }} />
        </div>
      </div>

      <CodeBlock code={`<ScrollScene client:visible height="250vh">\n  {(p) => <Scene progress={p} />}\n</ScrollScene>`} />
    </div>
  )
}

// ─── standalone — the real ScrollScene, scrubbed by actual page scroll ────
// (The panel above fakes progress with a timer so it can loop inside a tab.
// This mounts the same SCENE_STEPS driven by useScroll — genuine, not simulated.)

function LifecycleSceneBody({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    return progress.on('change', (v) => {
      setActive(Math.min(SCENE_STEPS.length - 1, Math.floor(v * SCENE_STEPS.length)))
    })
  }, [progress])

  const barWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '2.25rem',
      padding: '0 clamp(1.5rem, 6vw, 4rem)',
    }}>
      <p style={{
        margin: 0, fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: C.primary,
      }}>
        Scroll to advance
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: 560 }}>
        {SCENE_STEPS.map((label, i) => {
          const isActive = i === active
          const isDone = i < active
          return (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.15rem 1.4rem', borderRadius: C.r.lg,
                border: `1px solid ${isActive ? C.primary : C.border}`,
                background: isActive ? `color-mix(in srgb, ${C.primary} 8%, ${C.bg})` : C.bg,
                opacity: isDone || isActive ? 1 : 0.32,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'opacity 220ms ease, transform 220ms ease, border-color 220ms ease, background 220ms ease',
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: isDone || isActive ? C.primary : C.border,
                boxShadow: isActive ? `0 0 10px ${C.primary}` : 'none',
              }} />
              <span style={{ fontSize: '1.05rem', fontWeight: isActive ? 700 : 500, color: C.font }}>{label}</span>
              {isActive && (
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: C.primary }}>
                  active
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ height: 2, background: C.fg, borderRadius: 1, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: C.primary, borderRadius: 1, width: barWidth }} />
        </div>
      </div>
    </div>
  )
}

export function LifecycleScrollScene() {
  return (
    <ScrollScene height="240vh">
      {(progress) => <LifecycleSceneBody progress={progress} />}
    </ScrollScene>
  )
}

// ─── panel 5 — Spring ─────────────────────────────────────────────────────

const SPRING_CONFIGS = [
  { label: 'Default', stiffness: 380,  damping: 32, color: C.primary },
  { label: 'Bouncy',  stiffness: 600,  damping: 12, color: C.tertiary },
  { label: 'Slow',    stiffness: 80,   damping: 20, color: C.secondary },
  { label: 'Snappy',  stiffness: 1000, damping: 60, color: C.primary },
]
const CORNERS = [[-80,-40],[80,-40],[-80,40],[80,40]] as const

export function SpringPanel() {
  const [cfg, setCfg] = useState(0)
  const [ci, setCi] = useState(0)
  const { stiffness, damping } = SPRING_CONFIGS[cfg]

  const x = useSpring(CORNERS[ci][0], { stiffness, damping })
  const y = useSpring(CORNERS[ci][1], { stiffness, damping })

  useEffect(() => { x.set(CORNERS[ci][0]); y.set(CORNERS[ci][1]) }, [ci, x, y]) // eslint-disable-line

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <p style={{ margin: 0, fontSize: '0.83rem', color: C.muted }}>
        Pick a spring config then hit <strong style={{ color: C.font }}>Shoot</strong>.
      </p>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {SPRING_CONFIGS.map((c, i) => (
          <motion.button
            key={c.label} onClick={() => setCfg(i)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={ease.spring}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: '9999px', cursor: 'pointer',
              border: `1px solid ${cfg === i ? c.color : C.border}`,
              background: cfg === i ? `color-mix(in srgb, ${c.color} 12%, ${C.bg})` : C.bg,
              color: cfg === i ? c.color : C.muted,
              fontSize: '0.77rem', fontWeight: cfg === i ? 600 : 400,
              transition: 'border-color 120ms, background 120ms, color 120ms',
            }}
          >
            {c.label}
          </motion.button>
        ))}
      </div>

      <div style={{
        position: 'relative', height: '148px',
        background: C.fg, borderRadius: C.r.lg, border: `1px solid ${C.border}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div style={{ x, y, willChange: 'transform' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: SPRING_CONFIGS[cfg].color,
            boxShadow: `0 0 18px color-mix(in srgb, ${SPRING_CONFIGS[cfg].color} 55%, transparent)`,
          }} />
        </motion.div>
        <div style={{ position: 'absolute', bottom: '0.6rem', right: '0.75rem', fontSize: '0.62rem', color: C.muted }}>
          k={stiffness} · d={damping}
        </div>
      </div>

      <motion.button
        onClick={() => setCi(c => (c + 1) % CORNERS.length)}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={ease.spring}
        style={{
          padding: '0.55rem 1.1rem', borderRadius: C.r.md, cursor: 'pointer',
          border: `1px solid ${SPRING_CONFIGS[cfg].color}`,
          background: `color-mix(in srgb, ${SPRING_CONFIGS[cfg].color} 12%, ${C.bg})`,
          color: SPRING_CONFIGS[cfg].color, fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-start',
        }}
      >
        Shoot →
      </motion.button>

      <CodeBlock code={`// ease.spring — the ONE system default\n{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }`} />
    </div>
  )
}

// ─── panel 6 — Tokens ─────────────────────────────────────────────────────

function EaseCurve({ type, k }: { type: 'out' | 'inout' | 'spring'; k: number }) {
  const paths = {
    out:    'M 4,44 C 18,44 40,4 60,4',
    inout:  'M 4,44 C 22,44 38,4 60,4',
    spring: 'M 4,44 C 14,44 24,0 38,5 C 46,8 52,6 60,4',
  }
  return (
    <svg viewBox="0 0 64 48" style={{ width: '100%', height: 44, overflow: 'visible' }} aria-hidden>
      <line x1="4" y1="44" x2="60" y2="44" stroke={C.border} strokeWidth="0.5" />
      <line x1="4" y1="44" x2="4"  y2="4"  stroke={C.border} strokeWidth="0.5" />
      <motion.path
        key={k}
        d={paths[type]} fill="none" stroke={C.primary} strokeWidth="1.75" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
      />
    </svg>
  )
}

export function TokensPanel() {
  const [k, setK] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.83rem', color: C.muted }}>
          Four numbers that make everything feel like the same product.
        </p>
        <ReplayBtn onClick={() => setK(k + 1)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.65rem' }}>
        {(['out', 'inout', 'spring'] as const).map(t => (
          <div key={t} style={{
            background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: C.r.md, padding: '0.85rem',
            display: 'flex', flexDirection: 'column', gap: '0.3rem',
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.secondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t}
            </span>
            <EaseCurve type={t} k={k} />
            <span style={{ fontSize: '0.62rem', color: C.muted }}>
              {t === 'out' ? '[0.22, 1, 0.36, 1]' : t === 'inout' ? '[0.65, 0, 0.35, 1]' : 'k=380 d=32'}
            </span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: C.secondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
          Duration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {[
            { label: 'fast', ms: 320, pct: 35 },
            { label: 'base', ms: 480, pct: 52, active: true },
            { label: 'slow', ms: 720, pct: 76 },
          ].map(({ label, ms, pct, active }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.7rem', color: C.muted, width: 32 }}>{label}</span>
              <div style={{ flex: 1, height: 5, background: C.fg, borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  key={k}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: ms / 1000, ease: ease.out, delay: 0.1 }}
                  style={{
                    height: '100%', borderRadius: 3,
                    background: active ? C.primary : `color-mix(in srgb, ${C.primary} 38%, transparent)`,
                  }}
                />
              </div>
              <span style={{ fontSize: '0.67rem', color: C.muted, width: 38 }}>{ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── tab definitions ──────────────────────────────────────────────────────

export const TABS = [
  {
    id: 'reveal', label: 'Reveal', tag: 'whileInView',
    desc: 'Fade + translate on viewport entry. One-shot.',
    Panel: RevealPanel,
  },
  {
    id: 'stagger', label: 'Stagger', tag: 'staggerChildren',
    desc: 'Rhythm for free — one parent staggers all children.',
    Panel: StaggerPanel,
  },
  {
    id: 'parallax', label: 'Parallax', tag: 'useScroll',
    desc: 'Depth through mouse-tracked layer separation.',
    Panel: ParallaxPanel,
  },
  {
    id: 'scene', label: 'ScrollScene', tag: 'scrubbed',
    desc: 'Sticky pin exposes scroll progress 0→1 to children.',
    Panel: ScrollScenePanel,
  },
  {
    id: 'spring', label: 'Spring', tag: 'physics',
    desc: 'Natural snap. Interactive elements, hover states.',
    Panel: SpringPanel,
  },
  {
    id: 'tokens', label: 'Tokens', tag: 'design',
    desc: 'Ease · duration · distance — one source of truth.',
    Panel: TokensPanel,
  },
]

// Tab item height in px (padding top + bottom + label line + tag line + gap)
const TAB_H   = 54
const TAB_PAD = 6   // strip padding

// ─── main component ───────────────────────────────────────────────────────

export default function FeatureTabs() {
  const [active, setActive] = useState(0)
  const tab = TABS[active]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '196px 1fr',
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: C.r.lg,
      overflow: 'hidden',
      boxShadow: '0 4px 40px rgba(0,0,0,0.18)',
    }}>

      {/* ── tab strip ──────────────────────────────────────────────── */}
      <div style={{
        borderRight: `1px solid ${C.border}`,
        background: C.fg,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* strip header */}
        <div style={{
          padding: '0.9rem 1rem 0.5rem',
          fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: `color-mix(in oklab, ${C.onFg} 65%, transparent)`,
          borderBottom: `1px solid ${C.border}`,
        }}>
          6 Capabilities
        </div>

        {/* buttons */}
        <div style={{ position: 'relative', padding: `${TAB_PAD}px` }}>
          {/* sliding accent bar */}
          <motion.div
            animate={{ y: active * TAB_H }}
            transition={ease.spring}
            style={{
              position: 'absolute',
              left: TAB_PAD,
              top: TAB_PAD + 4,
              width: 2,
              height: TAB_H - 8,
              background: C.primary,
              borderRadius: '0 2px 2px 0',
            }}
          />

          {TABS.map((t, i) => {
            const isActive = active === i
            return (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.1rem',
                  width: '100%', height: TAB_H,
                  padding: '0 0.75rem 0 1rem',
                  border: 'none', borderRadius: C.r.sm, cursor: 'pointer',
                  textAlign: 'left', background: 'transparent',
                  transition: 'background 120ms',
                  ...(isActive && {
                    background: `color-mix(in srgb, ${C.primary} 8%, ${C.bg})`,
                  }),
                  justifyContent: 'center',
                }}
              >
                <span style={{
                  fontSize: '0.82rem', fontWeight: isActive ? 600 : 400,
                  // Inactive sits on the strip's own C.fg fill (can be a
                  // saturated brand tone); active gets its own light
                  // color-mix(primary, C.bg) background above, so primary
                  // text stays correctly paired there.
                  color: isActive ? C.primary : C.onFg,
                  letterSpacing: isActive ? '-0.01em' : '0',
                  transition: 'color 120ms',
                }}>
                  {t.label}
                </span>
                <span style={{
                  fontSize: '0.63rem', fontWeight: 500,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  // Full primary, no alpha — any transparency drops this 10px
                  // tag below 4.5:1 on dark surfaces (65% → 3.2, 85% → 4.4,
                  // both verified via Lighthouse). Size carries the hierarchy.
                  color: isActive ? C.primary : `color-mix(in oklab, ${C.onFg} 65%, transparent)`,
                  transition: 'color 120ms',
                }}>
                  {t.tag}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── panel ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* persistent panel header — stays put across tab switches */}
        <div style={{
          padding: '1rem 1.5rem 0.85rem',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'baseline', gap: '0.75rem',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active + '-header'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: ease.out }}
              style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flex: 1 }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 700, color: C.font }}>{tab.label}</span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: C.primary,
                background: `color-mix(in srgb, ${C.primary} 10%, ${C.fg})`,
                border: `1px solid color-mix(in srgb, ${C.primary} 20%, transparent)`,
                borderRadius: '9999px', padding: '0.15rem 0.5rem',
              }}>
                {tab.tag}
              </span>
              <span style={{ fontSize: '0.78rem', color: C.muted, marginLeft: 'auto' }}>{tab.desc}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* animated panel content */}
        <div style={{ padding: '1.4rem 1.5rem', flex: 1, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: ease.out }}
            >
              <tab.Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}

import { TABS } from './FeatureTabs'

// ─── design tokens (CSS vars) — same palette FeatureTabs uses ────────────
const C = {
  bg: 'var(--color-background)',
  fg: 'var(--color-foreground)',
  border: 'var(--color-border)',
  font: 'var(--color-font)',
  muted: 'var(--color-muted)',
  primary: 'var(--color-primary)',
  r: { lg: '16px' },
}

/**
 * MotionShowcase — the six motion primitives broken out of FeatureTabs'
 * tab-switcher into their own always-visible cards, side by side. Same
 * panel components (Reveal, Stagger, Parallax, ScrollScene, Spring,
 * Tokens) FeatureTabs uses on /motion — reused here, not rebuilt.
 */
export default function MotionShowcase() {
  return (
    <div className="motion-showcase">
      {TABS.map((t) => (
        <div
          key={t.id}
          className="motion-showcase__card"
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: C.r.lg,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem 0.85rem',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.65rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.font }}>{t.label}</span>
            <span
              style={{
                fontSize: '0.63rem',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: C.primary,
                background: `color-mix(in srgb, ${C.primary} 10%, ${C.fg})`,
                border: `1px solid color-mix(in srgb, ${C.primary} 20%, transparent)`,
                borderRadius: '9999px',
                padding: '0.15rem 0.5rem',
              }}
            >
              {t.tag}
            </span>
          </div>
          <div style={{ padding: '1.25rem 1.25rem 1.4rem' }}>
            <t.Panel />
          </div>
        </div>
      ))}
    </div>
  )
}

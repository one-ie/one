// Ported verbatim from one.ie/web/src/components/cro/LandingFeatures.tsx
import type { LucideIcon } from 'lucide-react'
import { IconBadge, type IconBadgeTone } from './IconBadge'

const BRAND_TOKENS = new Set(['primary', 'secondary', 'tertiary'])

export interface LandingFeature {
  headline: string
  body: string
  icon?: LucideIcon
  tone?: IconBadgeTone
}

interface LandingFeaturesProps {
  title?: string
  subtitle?: string
  features: LandingFeature[]
  columns?: 2 | 3
  bgToken?: string
}

export function LandingFeatures({
  title = 'What you get',
  subtitle,
  features,
  columns = 3,
  bgToken,
}: LandingFeaturesProps) {
  const hasBgToken = !!bgToken && bgToken !== 'none'
  const isBrandToken = hasBgToken && BRAND_TOKENS.has(bgToken)

  const gridClass = columns === 2 ? 'grid sm:grid-cols-2 gap-8' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-8'

  return (
    <section
      className={`px-6 py-24 ${hasBgToken ? '' : 'bg-foreground/30'}${isBrandToken ? ' text-on-primary' : ''}`}
      style={hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : undefined}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-3">{title}</h2>
        {subtitle && <p className="text-font/60 text-center mb-14 max-w-xl mx-auto">{subtitle}</p>}
        {!subtitle && <div className="mb-14" />}
        <div className={gridClass}>
          {features.map((f) => (
            <article
              key={f.headline}
              className="bg-background rounded-2xl p-6 border flex flex-col gap-4"
              style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
            >
              {f.icon && <IconBadge icon={f.icon} tone={f.tone ?? 'primary'} size="md" />}
              <div>
                <h3 className="font-semibold text-base mb-2">{f.headline}</h3>
                <p className="text-sm text-font/60 leading-relaxed">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

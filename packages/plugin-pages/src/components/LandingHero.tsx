// Ported from one.ie/web/src/components/cro/LandingHero.tsx — hrefs additionally
// wrapped in safeHref() (see ../lib/safe-url.ts): this package renders to public,
// no-login visitors on any external site, so an unsanitized javascript:/data:
// URL in stored page content would execute in every visitor's browser.
import { ArrowRight } from 'lucide-react'
import { Icon } from './Icon'
import { emitClick } from '../lib/ui-signal'
import { safeHref } from '../lib/safe-url'

const BRAND_TOKENS = new Set(['primary', 'secondary', 'tertiary'])

interface CTA {
  label: string
  href: string
}

interface LandingHeroProps {
  eyebrow?: string
  headline: string
  highlight?: string
  subhead: string
  primaryCta: CTA
  secondaryCta?: CTA
  frictionText?: string
  visual?: string
  bgToken?: string
}

export function LandingHero({
  eyebrow,
  headline,
  highlight,
  subhead,
  primaryCta,
  secondaryCta,
  frictionText = 'No credit card · 2-minute setup',
  visual,
  bgToken,
}: LandingHeroProps) {
  const hasBgToken = !!bgToken && bgToken !== 'none'
  const isBrandToken = hasBgToken && BRAND_TOKENS.has(bgToken)

  return (
    <section
      className={`px-6 pt-24 pb-20 md:pt-32 md:pb-28${isBrandToken ? ' text-on-primary' : ''}`}
      style={hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : undefined}
    >
      <div className="max-w-4xl mx-auto text-center">
        {eyebrow && (
          <p
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground border text-xs font-medium text-font/60 mb-8 tracking-wide uppercase"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {eyebrow}
          </p>
        )}

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.96]">
          {headline}
          {highlight && (
            <>
              {' '}
              <span className="text-tertiary">{highlight}</span>
            </>
          )}
        </h1>

        <p className="text-xl sm:text-2xl text-font/60 mb-10 max-w-2xl mx-auto leading-snug">
          {subhead}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <a
            href={safeHref(primaryCta.href) ?? '#'}
            onClick={() => emitClick('ui:landing:primary-cta', { page: headline })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-medium text-base hover:brightness-110 transition"
          >
            {primaryCta.label}
            <Icon icon={ArrowRight} size="md" />
          </a>
          {secondaryCta && (
            <a
              href={safeHref(secondaryCta.href) ?? '#'}
              onClick={() => emitClick('ui:landing:secondary-cta', { page: headline })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-font rounded-full font-medium text-base hover:text-font/70 transition border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {secondaryCta.label}
            </a>
          )}
        </div>

        {frictionText && <p className="text-sm text-font/40">{frictionText}</p>}

        {visual && (
          <div className="mt-14 mx-auto max-w-3xl">
            <div
              className="bg-foreground rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-pop)' }}
            >
              <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span className="w-3 h-3 rounded-full bg-destructive/40" />
                <span className="w-3 h-3 rounded-full bg-tertiary/40" />
                <span className="w-3 h-3 rounded-full bg-primary/40" />
              </div>
              <div className="px-6 py-8 text-sm text-font/50 italic text-left">{visual}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Ported from one.ie/web/src/components/cro/SecondaryCTA.tsx — hrefs additionally
// wrapped in safeHref() (see ../lib/safe-url.ts): public, no-login render surface.
import { ArrowRight } from 'lucide-react'
import { Icon } from './Icon'
import { emitClick } from '../lib/ui-signal'
import { safeHref } from '../lib/safe-url'

const BRAND_TOKENS = new Set(['primary', 'secondary', 'tertiary'])

interface SecondaryCTAProps {
  headline: string
  subhead?: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  frictionText?: string
  bgToken?: string
}

export function SecondaryCTA({
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  frictionText = 'No credit card · 2-minute setup',
  bgToken,
}: SecondaryCTAProps) {
  const hasBgToken = !!bgToken && bgToken !== 'none'
  const isBrandToken = hasBgToken && BRAND_TOKENS.has(bgToken)

  return (
    <section
      className={`px-6 py-24${isBrandToken ? ' text-on-primary' : ''}`}
      style={hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : undefined}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{headline}</h2>
        {subhead && <p className="text-font/60 mb-10 text-lg leading-snug">{subhead}</p>}
        {!subhead && <div className="mb-10" />}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <a
            href={safeHref(primaryCta.href) ?? '#'}
            onClick={() => emitClick('ui:landing:secondary-cta', { section: 'bottom-cta' })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-medium text-base hover:brightness-110 transition"
          >
            {primaryCta.label}
            <Icon icon={ArrowRight} size="md" />
          </a>
          {secondaryCta && (
            <a
              href={safeHref(secondaryCta.href) ?? '#'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-font rounded-full font-medium text-base hover:text-font/70 transition border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
        {frictionText && <p className="text-sm text-font/40">{frictionText}</p>}
      </div>
    </section>
  )
}

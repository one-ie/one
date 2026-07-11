// Ported verbatim from one.ie/web/src/components/cro/Testimonials.tsx
const BRAND_TOKENS = new Set(['primary', 'secondary', 'tertiary'])

interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
}

interface TestimonialsProps {
  title?: string
  testimonials: Testimonial[]
  bgToken?: string
}

export function Testimonials({ title = 'What agencies say', testimonials, bgToken }: TestimonialsProps) {
  const hasBgToken = !!bgToken && bgToken !== 'none'
  const isBrandToken = hasBgToken && BRAND_TOKENS.has(bgToken)

  return (
    <section
      className={`px-6 py-24${isBrandToken ? ' text-on-primary' : ''}`}
      style={hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : undefined}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-14">{title}</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="bg-foreground rounded-2xl p-6 border flex flex-col gap-4"
              style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-sm leading-relaxed text-font/80 flex-1">&quot;{t.quote}&quot;</p>
              <footer className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="font-semibold text-sm text-font">{t.name}</p>
                <p className="text-xs text-font/50">
                  {t.role} · {t.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

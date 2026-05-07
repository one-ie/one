import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type BrandPaletteData = Extract<CardProps['data'], { kind: 'brand-palette' }>

export function BrandPalette({ data, onAction }: CardProps) {
  const d = data as BrandPaletteData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <h3 className="text-base font-bold text-font">Brand Palette</h3>
      </header>

      <div
        className="mx-5 mt-4 p-4 bg-foreground rounded-xl border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg border"
            style={{ background: d.primary, borderColor: 'var(--color-border)' }}
          />
          <div
            className="w-12 h-12 rounded-lg border"
            style={{ background: d.secondary, borderColor: 'var(--color-border)' }}
          />
          <div
            className="w-12 h-12 rounded-lg border"
            style={{ background: d.tertiary, borderColor: 'var(--color-border)' }}
          />
        </div>
      </div>

      <footer
        className="flex items-center justify-end gap-3 px-5 py-4 mt-auto border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
          onClick={() => {
            emitClick('ui:card:brand-palette:apply')
            onAction('apply', { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary })
          }}
        >
          Apply
        </button>
      </footer>
    </article>
  )
}

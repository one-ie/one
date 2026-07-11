// Ported verbatim from one.ie/web/src/components/ui/IconBadge.tsx
import type { LucideIcon } from 'lucide-react'

export type IconBadgeTone = 'primary' | 'secondary' | 'tertiary' | 'neutral'
export type IconBadgeSize = 'sm' | 'md' | 'lg'

const BOX: Record<IconBadgeSize, string> = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
}
const PX: Record<IconBadgeSize, number> = { sm: 16, md: 20, lg: 24 }

interface ToneStyle {
  background: string
  borderColor: string
  color: string
}

const tone = (name: 'primary' | 'secondary' | 'tertiary'): ToneStyle => ({
  background: `color-mix(in oklab, var(--color-${name}) 14%, var(--color-foreground))`,
  borderColor: `color-mix(in oklab, var(--color-${name}) 28%, var(--color-border))`,
  color: `var(--color-${name})`,
})

const TONE: Record<IconBadgeTone, ToneStyle> = {
  primary: tone('primary'),
  secondary: tone('secondary'),
  tertiary: tone('tertiary'),
  neutral: {
    background: 'var(--color-foreground)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-font)',
  },
}

interface Props {
  icon: LucideIcon
  tone?: IconBadgeTone
  size?: IconBadgeSize
  className?: string
  'aria-label'?: string
}

export function IconBadge({
  icon: I,
  tone: t = 'tertiary',
  size = 'md',
  className = '',
  'aria-label': label,
}: Props) {
  return (
    <div
      className={`${BOX[size]} flex-shrink-0 inline-flex items-center justify-center rounded-xl border ${className}`}
      style={TONE[t]}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <I size={PX[size]} strokeWidth={1.75} />
    </div>
  )
}

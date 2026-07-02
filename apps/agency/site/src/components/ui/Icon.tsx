import type { LucideIcon } from 'lucide-react'

export type IconSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE: Record<IconSize, number> = { sm: 14, md: 16, lg: 20, xl: 24 }

interface IconProps {
  icon: LucideIcon
  size?: IconSize
  className?: string
  'aria-label'?: string
}

export function Icon({ icon: I, size = 'md', className, 'aria-label': label }: IconProps) {
  return (
    <I
      size={SIZE[size]}
      strokeWidth={1.5}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  )
}

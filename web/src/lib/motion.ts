import { useEffect, useState } from 'react'

export const ease = {
  out:    [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut:  [0.65, 0, 0.35, 1] as [number, number, number, number],
  spring: { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.8 },
} as const

export const duration = {
  fast:  0.32,
  base:  0.48,
  slow:  0.72,
} as const

export const distance = {
  sm: 12,
  md: 24,
  lg: 48,
} as const

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

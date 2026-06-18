import { useRef } from 'react'
import { useScroll, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { ease } from '@/lib/motion'

interface Props {
  /** Height of the scroll track. More height = more scrub time. Default: '200vh' */
  height?: string
  /** Render prop receives scroll progress 0→1 */
  children: (progress: import('motion/react').MotionValue<number>) => ReactNode
  /** Tailwind/CSS classes for the outer sticky wrapper */
  className?: string
}

export default function ScrollScene({ height = '200vh', children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <div ref={ref} style={{ height, contain: 'layout paint' }}>
      <div
        className={className}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {children(scrollYProgress)}
      </div>
    </div>
  )
}

// Convenience: animate a value from `from` to `to` over the full scene progress
export function useSceneValue(
  progress: import('motion/react').MotionValue<number>,
  from: number,
  to: number,
) {
  return useTransform(progress, [0, 1], [from, to])
}

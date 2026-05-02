import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/lib/motion'

interface Props {
  children: ReactNode
  /** How many pixels to travel over the full element scroll range. Default: 60 */
  speed?: number
  /** Direction: 'up' moves element against scroll, 'down' moves with. Default: up */
  direction?: 'up' | 'down'
  /** Tailwind/CSS classes for the wrapper */
  className?: string
}

export default function Parallax({ children, speed = 60, direction = 'up', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const yRange: [number, number] = direction === 'up'
    ? [speed / 2, -speed / 2]
    : [-speed / 2, speed / 2]

  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : yRange)

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y, willChange: 'transform' }}>
        {children}
      </motion.div>
    </div>
  )
}

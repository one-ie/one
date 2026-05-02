import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ease, duration, distance, usePrefersReducedMotion } from '@/lib/motion'

interface Props {
  children: ReactNode
  /** How far to travel before entering. Default: md (24px) */
  dist?: keyof typeof distance
  /** Animation duration preset. Default: base */
  speed?: keyof typeof duration
  /** Delay in seconds */
  delay?: number
  /** Tailwind/CSS classes applied to the wrapper */
  className?: string
}

export default function Reveal({ children, dist = 'md', speed = 'base', delay = 0, className }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : distance[dist] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{
        duration: duration[speed],
        delay,
        ease: ease.out,
      }}
    >
      {children}
    </motion.div>
  )
}

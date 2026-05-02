import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ease, duration, distance, usePrefersReducedMotion } from '@/lib/motion'

interface Props {
  children: ReactNode
  /** Seconds between each child's reveal */
  stagger?: number
  /** Distance each child travels. Default: sm */
  dist?: keyof typeof distance
  /** Tailwind/CSS classes for the wrapper */
  className?: string
}

const container = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

export default function Stagger({ children, stagger = 0.08, dist = 'sm', className }: Props) {
  const reduced = usePrefersReducedMotion()

  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : distance[dist] },
    show:   { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  }

  return (
    <motion.div
      className={className}
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-48px' }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={item}>{children}</motion.div>
      }
    </motion.div>
  )
}

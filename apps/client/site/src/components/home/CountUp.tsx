import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'motion/react'
import { ease, usePrefersReducedMotion } from '@/lib/motion'

/**
 * CountUp — tallies a metric from 0 to its value when it scrolls into view.
 *
 * Accepts the final string ("4,217", "3.2 days", "94%", "< 80 KB"), parses the
 * leading prefix + number + trailing suffix, and animates only the number —
 * preserving commas, decimals, and units. Fires once, respects reduced motion.
 */

interface Props {
  value: string
  /** Seconds for the tally. Default 1.4 */
  durationS?: number
}

function parse(value: string) {
  const m = value.match(/^(\D*?)([\d,]*\.?\d+)(.*)$/)
  if (!m) return null
  const hasComma = m[2].includes(',')
  const raw = m[2].replace(/,/g, '')
  return {
    prefix: m[1],
    target: parseFloat(raw),
    decimals: raw.includes('.') ? raw.split('.')[1].length : 0,
    suffix: m[3],
    hasComma,
  }
}

function fmt(n: number, decimals: number, hasComma: boolean) {
  const fixed = n.toFixed(decimals)
  if (!hasComma) return fixed
  const [int, dec] = fixed.split('.')
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec ? `${withCommas}.${dec}` : withCommas
}

export default function CountUp({ value, durationS = 1.4 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduced = usePrefersReducedMotion()
  const parsed = parse(value)

  const [display, setDisplay] = useState(
    parsed ? `${parsed.prefix}${fmt(0, parsed.decimals, parsed.hasComma)}${parsed.suffix}` : value,
  )

  useEffect(() => {
    if (!parsed) return
    if (reduced) {
      setDisplay(value)
      return
    }
    if (!inView) return
    const controls = animate(0, parsed.target, {
      duration: durationS,
      ease: ease.out,
      onUpdate: (v) => setDisplay(`${parsed.prefix}${fmt(v, parsed.decimals, parsed.hasComma)}${parsed.suffix}`),
    })
    return () => controls.stop()
  }, [inView, reduced])

  return <span ref={ref}>{display}</span>
}

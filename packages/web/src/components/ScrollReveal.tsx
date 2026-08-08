'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}

/**
 * Scroll-triggered reveal wrapper.
 * Visible pop effect: slides up 60px, fades in, slight scale.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 60,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        scale: 0.96,
        filter: 'blur(4px)',
        ...directionMap[direction],
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, scale: 0.96, filter: 'blur(4px)', ...directionMap[direction] }
      }
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

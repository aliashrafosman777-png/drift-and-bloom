// @ts-nocheck
"use client"

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const smoothEase = [0.22, 1, 0.36, 1]

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

export const fadeLeft = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0 },
}

export const fadeRight = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1 },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

export const pageTransition = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export function Reveal({
  as = 'div',
  children,
  className = '',
  variant = fadeUp,
  delay = 0,
  duration = 0.38,
  once = true,
  ...props
}) {
  const Component = motion[as] || motion.div
  const shouldReduceMotion = useReducedMotion()

  return (
    <Component
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once, margin: '-40px' }}
      variants={variant}
      transition={{ duration, delay, ease: smoothEase }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

export const Stagger = React.forwardRef(function Stagger({ as = 'div', children, className = '', ...props }, ref) {
  const Component = motion[as] || motion.div
  const shouldReduceMotion = useReducedMotion()

  return (
    <Component
      ref={ref}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
})

export function PageMotion({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="visible"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.32, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

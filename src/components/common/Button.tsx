// @ts-nocheck
"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)

const VARIANTS: Record<string, string> = {
  primary: 'bg-olive text-cream hover:bg-olive-dark border border-olive shadow-sm hover:shadow-lift',
  outline: 'bg-transparent text-olive border border-olive hover:bg-olive hover:text-cream',
  sage: 'bg-sage text-white hover:bg-sage-600 border border-sage shadow-sm hover:shadow-lift',
  ghost: 'bg-transparent text-charcoal border border-charcoal/20 hover:border-charcoal hover:bg-white/60',
  light: 'bg-cream text-olive border border-cream hover:bg-beige-dark',
}

const SIZES: Record<string, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
}

const motionProps = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

type ButtonProps = {
  children: React.ReactNode
  to?: string
  href?: string
  state?: Record<string, unknown>
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  className?: string
  disabled?: boolean
  fullWidth?: boolean
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>

function withQueryState(href: string, state?: Record<string, unknown>) {
  if (!state || Object.keys(state).length === 0) return href
  const [path, existingQuery = ''] = href.split('?')
  const params = new URLSearchParams(existingQuery)
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export default function Button({
  children,
  to,
  state,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const classes = `relative overflow-hidden inline-flex items-center justify-center gap-2 font-medium uppercase tracking-label rounded-full transition duration-300 ease-out ${SIZES[size]} ${VARIANTS[variant]} ${
    fullWidth ? 'w-full' : ''
  } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`

  const nextHref = href || to

  if (nextHref) {
    return (
      <MotionLink href={withQueryState(nextHref, state)} className={classes} {...motionProps} {...(props as Record<string, unknown>)}>
        <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
      </MotionLink>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...(!disabled ? motionProps : {})}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}

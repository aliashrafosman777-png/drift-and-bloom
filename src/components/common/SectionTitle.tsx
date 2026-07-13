// @ts-nocheck
"use client"

import React from 'react'

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
}) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center'
  const titleColor = light ? 'text-cream' : 'text-charcoal'
  const descColor = light ? 'text-cream/70' : 'text-charcoal/60'

  return (
    <div className={`flex flex-col ${alignment} mb-10`}>
      {eyebrow && (
        <span className="text-gold-dark text-xs sm:text-sm tracking-label uppercase mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl ${titleColor}`}>{title}</h2>
      <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
        <span className="flex-1 h-px bg-gold/40" />
        <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
        <span className="flex-1 h-px bg-gold/40" />
      </div>
      {description && (
        <p className={`mt-4 max-w-2xl text-sm sm:text-base ${descColor}`}>{description}</p>
      )}
    </div>
  )
}

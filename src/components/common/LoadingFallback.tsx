// @ts-nocheck
"use client"

import React from 'react'
import Container from './Container'

export default function LoadingFallback({ label = 'Preparing your experience...' }) {
  return (
    <Container className="py-16 sm:py-24" role="status" aria-live="polite">
      <div className="mx-auto max-w-md rounded-3xl border border-gold/15 bg-white/70 p-6 shadow-soft">
        <div className="mb-4 h-3 w-24 animate-pulse rounded-full bg-gold/25" />
        <div className="mb-3 h-8 w-3/4 animate-pulse rounded-full bg-beige-dark" />
        <div className="space-y-2">
          <div className="h-3 animate-pulse rounded-full bg-beige-dark" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-beige-dark" />
        </div>
        <p className="sr-only">{label}</p>
      </div>
    </Container>
  )
}

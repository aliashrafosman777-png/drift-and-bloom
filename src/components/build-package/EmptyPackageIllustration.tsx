// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Fish, Leaf, Sparkles } from 'lucide-react'

export default function EmptyPackageIllustration() {
  return (
    <div className="rounded-3xl border border-dashed border-gold/35 bg-beige/40 p-6 text-center">
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-cream shadow-soft"
      >
        <Leaf className="text-olive" size={30} strokeWidth={1.5} />
        <Fish className="absolute bottom-5 right-5 text-brown" size={16} strokeWidth={1.5} />
        <Sparkles className="absolute right-5 top-5 text-gold" size={14} />
      </motion.div>
      <p className="font-serif text-2xl text-charcoal">Start building your personalized package.</p>
      <p className="mt-2 text-sm text-charcoal/55">Choose your first candle, plant, or fish tank.</p>
    </div>
  )
}

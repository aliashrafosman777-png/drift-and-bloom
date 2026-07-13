// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Package categories">
      {categories.map((cat) => {
        const isActive = active === cat.id
        return (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="tab"
            aria-selected={isActive}
            className={`relative shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap border transition duration-300 ${
              isActive
                ? 'bg-olive text-cream border-olive shadow-soft'
                : 'bg-white/40 text-charcoal/70 border-charcoal/15 hover:border-gold/50 hover:bg-white'
            }`}
          >
            {cat.label}
          </motion.button>
        )
      })}
    </div>
  )
}

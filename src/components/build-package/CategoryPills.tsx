// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'

export default function CategoryPills({ categories, activeIndex, selectedItems, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="tablist" aria-label="Package categories">
      {categories.map((category, index) => {
        const isActive = index === activeIndex
        const selectedCount = selectedItems[category.id]?.reduce((sum, line) => sum + line.quantity, 0) || 0
        const isCompleted = selectedCount > 0

        return (
          <motion.button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`package-products-${category.id}`}
            onClick={() => onSelect(index)}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative overflow-hidden rounded-[24px] border p-5 text-left shadow-soft transition duration-300 ${
              isActive
                ? 'border-gold/55 bg-cream shadow-lift ring-2 ring-gold/20'
                : isCompleted
                  ? 'border-olive/25 bg-white/75 hover:border-gold/40 hover:bg-cream hover:shadow-lift'
                  : 'border-charcoal/10 bg-white/60 hover:border-gold/35 hover:bg-cream hover:shadow-lift'
            }`}
          >
            <span className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition duration-300 group-hover:bg-gold/20" />
            {category.image && (
              <span className="relative mb-5 block overflow-hidden rounded-[18px] bg-beige/70 shadow-soft">
                <OptimizedImage
                  src={category.image}
                  alt={`${category.label} category`}
                  className="h-32 w-full object-cover transition duration-700 ease-out group-hover:scale-105 sm:h-36"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-olive/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              </span>
            )}
            <span className="relative flex items-start justify-between gap-4">
              <span>
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-beige/65 text-2xl shadow-soft" aria-hidden="true">
                  {category.emoji || '✦'}
                </span>
                <span className="block font-serif text-3xl leading-none text-charcoal">{category.label}</span>
                <span className="mt-2 block text-sm leading-relaxed text-charcoal/55">{category.description}</span>
              </span>
              {isCompleted && (
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isActive ? 'bg-olive text-cream' : 'bg-olive/10 text-olive'}`}>
                  <Check size={14} strokeWidth={1.8} />
                </span>
              )}
            </span>
            {selectedCount > 0 && (
              <span className="relative mt-5 inline-flex rounded-full border border-olive/15 bg-olive/5 px-3 py-1 text-[11px] uppercase tracking-label text-olive">
                {selectedCount} selected
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

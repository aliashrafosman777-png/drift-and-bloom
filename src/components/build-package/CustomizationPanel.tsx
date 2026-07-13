// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Palette, Sparkles } from 'lucide-react'

export const CUSTOMIZATION_OPTIONS = {
  plants: [
    { id: 'potColor', label: 'Pot color', icon: Palette, options: ['Warm Ivory', 'Sage Green', 'Terracotta'] },
    { id: 'potSize', label: 'Pot size', icon: Sparkles, options: ['Small', 'Medium', 'Statement'] },
    { id: 'stones', label: 'Decorative stones', icon: Sparkles, options: ['Natural Pebbles', 'White Stones', 'No Stones'] },
  ],
  candles: [
    { id: 'scent', label: 'Scent', icon: Sparkles, options: ['Lavender Calm', 'Vanilla Amber', 'Ocean Breeze'] },
    { id: 'size', label: 'Size', icon: Sparkles, options: ['Small Ritual', 'Classic', 'Large'] },
    { id: 'container', label: 'Container style', icon: Palette, options: ['Matte Cream', 'Smoked Glass', 'Ceramic Jar'] },
  ],
  fish: [
    { id: 'fishType', label: 'Fish type', icon: Sparkles, options: ['Betta Male', 'Betta Female', 'Premium Betta'] },
    { id: 'aquariumSize', label: 'Aquarium size', icon: Sparkles, options: ['Desk Bowl', 'Medium Tank', 'Premium Tank'] },
    { id: 'decorations', label: 'Decorations', icon: Palette, options: ['Soft Sand', 'Natural Stones', 'Botanical Setup'] },
  ],
}

export const createDefaultCustomizations = () =>
  Object.fromEntries(
    Object.entries(CUSTOMIZATION_OPTIONS).map(([categoryId, groups]) => [
      categoryId,
      Object.fromEntries(groups.map((group) => [group.id, group.options[0]])),
    ]),
  )

export default function CustomizationPanel({ category, values, onChange }) {
  const groups = CUSTOMIZATION_OPTIONS[category.id] || []

  return (
    <motion.section
      id="package-customize"
      aria-labelledby="package-customize-title"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-gold/15 bg-white/70 p-5 shadow-soft backdrop-blur sm:p-6"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-label text-gold-dark">Step 3</p>
          <h2 id="package-customize-title" className="font-serif text-3xl text-charcoal sm:text-4xl">
            Customize your {category.singular}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/58">
            Choose the finishing details that make your package feel personal and ready for your space.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {groups.map(({ id, label, icon: Icon, options }) => (
          <div key={id} className="rounded-2xl border border-charcoal/5 bg-cream/70 p-4 shadow-soft">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-olive shadow-soft">
                <Icon size={16} strokeWidth={1.6} />
              </span>
              <h3 className="font-serif text-2xl text-charcoal">{label}</h3>
            </div>
            <div className="space-y-2" role="radiogroup" aria-label={label}>
              {options.map((option) => {
                const active = values?.[id] === option
                return (
                  <motion.button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange(category.id, id, option)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex w-full items-center justify-between rounded-full border px-4 py-3 text-left text-sm transition duration-300 ${
                      active
                        ? 'border-olive bg-olive text-cream shadow-soft ring-2 ring-olive/15'
                        : 'border-charcoal/10 bg-white text-charcoal/65 hover:border-gold/40 hover:text-charcoal hover:shadow-soft'
                    }`}
                  >
                    <span>{option}</span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-cream bg-cream text-olive' : 'border-charcoal/20'}`}>
                      {active && <Check size={12} />}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

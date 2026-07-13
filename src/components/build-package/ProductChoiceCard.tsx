// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Minus, Plus, Sparkles } from 'lucide-react'
import Button from '../common/Button'
import OptimizedImage from '../common/OptimizedImage'

export default function ProductChoiceCard({ product, quantity = 0, onAdd, onIncrease, onDecrease }) {
  const isSelected = quantity > 0

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`group overflow-hidden rounded-[24px] border bg-white/90 shadow-card transition duration-300 hover:shadow-lift ${
        isSelected ? 'border-olive/50 ring-1 ring-olive/20' : 'border-charcoal/5 hover:border-gold/30'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_190px] lg:grid-cols-[240px_minmax(0,1fr)_210px]">
        <div className="relative overflow-hidden bg-beige md:min-h-[250px]">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="h-64 w-full object-cover transition duration-700 ease-out group-hover:scale-105 md:h-full"
            loading="lazy"
            decoding="async"
          />
          {isSelected && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-1 text-[10px] uppercase tracking-label text-cream shadow-soft">
              <Check size={12} /> {quantity} Selected
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-7">
          <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-label text-gold-dark">
            <Sparkles size={13} /> {product.shortDescription}
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl text-charcoal">{product.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2" aria-label={`${product.name} tags`}>
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-beige px-3 py-1 text-xs text-charcoal/55">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/60">{product.description}</p>
          <details className="group/story mt-4">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-olive hover:text-olive-dark">
              My Story
              <span className="h-px w-7 bg-gold/70 transition duration-300 group-open/story:w-12" />
            </summary>
            <p className="mt-3 rounded-2xl bg-beige/70 p-4 text-sm italic leading-relaxed text-charcoal/60">
              {product.story}
            </p>
          </details>
        </div>

        <div className="flex flex-col justify-between border-t border-charcoal/10 p-5 sm:p-7 md:border-l md:border-t-0">
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-label text-charcoal/40">Price</p>
            <p className="mt-1 font-serif text-2xl text-brown">EGP {product.price.toLocaleString()}</p>
          </div>

          <div className="mt-6 space-y-3">
            {isSelected && (
              <div className="flex items-center justify-between rounded-full border border-olive/20 bg-olive/5 px-2 py-1.5" aria-label={`${product.name} quantity`}>
                <button
                  type="button"
                  onClick={() => onDecrease(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-olive shadow-soft transition duration-300 hover:bg-beige"
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  <Minus size={14} />
                </button>
                <span className="font-serif text-xl text-charcoal">{quantity}</span>
                <button
                  type="button"
                  onClick={() => onIncrease(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-olive shadow-soft transition duration-300 hover:bg-beige"
                  aria-label={`Increase ${product.name} quantity`}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            <Button onClick={() => onAdd(product)} fullWidth aria-label={`Add ${product.name} to package`}>
              <Plus size={15} /> {isSelected ? 'Add Another' : 'Add to Package'}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

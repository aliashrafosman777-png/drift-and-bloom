// @ts-nocheck
"use client"

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, PackageOpen, Plus, RotateCcw, ShoppingBag, Trash2, X } from 'lucide-react'
import Button from '../common/Button'
import EmptyPackageIllustration from './EmptyPackageIllustration'
import OptimizedImage from '../common/OptimizedImage'

export default function PackageSummary({
  categories,
  selectedItems,
  selectedList,
  total,
  progress,
  customizations = {},
  onChangeCategory,
  onClear,
  onAddToCart,
  onUpdateQuantity,
  onRemove,
}) {
  const continueDisabled = !progress.hasItems

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-28 rounded-[24px] border border-gold/20 bg-cream/95 p-5 shadow-lift backdrop-blur sm:p-6"
      aria-label="Your package summary"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-label text-gold-dark">Step 4</p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal">Review Package</h2>
          <p className="mt-2 text-sm leading-relaxed text-charcoal/55">
            Preview your selected items, quantities, customization details, and live total.
          </p>
        </div>
        {selectedList.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 px-3 py-1.5 text-[11px] uppercase tracking-label text-charcoal/45 transition duration-300 hover:border-red-200 hover:text-red-500"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      <div className="mb-6 rounded-2xl bg-white/75 p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-charcoal/60">Package items</span>
          <span className="font-medium text-olive">{progress.itemCount}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-beige">
          <motion.div
            className="h-full rounded-full bg-olive"
            initial={{ width: 0 }}
            animate={{ width: `${progress.hasItems ? 100 : 12}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-3 text-xs text-charcoal/45">
          Add at least one product, then finalize your custom package.
        </p>
      </div>

      {selectedList.length === 0 ? (
        <EmptyPackageIllustration />
      ) : (
        <div className="max-h-[48vh] space-y-5 overflow-y-auto pr-1" role="list" aria-label="Selected products">
          <AnimatePresence initial={false}>
            {categories.map((category) => {
              const lines = selectedItems[category.id] || []
              if (lines.length === 0) return null
              const customizationEntries = Object.entries(customizations[category.id] || {})

              return (
                <motion.section
                  key={category.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.32 }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-[11px] uppercase tracking-label text-charcoal/45">
                      {category.emoji} Selected {category.label}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onChangeCategory(category.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-olive transition duration-300 hover:bg-olive/5"
                    >
                      <RotateCcw size={11} /> Change
                    </button>
                  </div>

                  <div className="space-y-3">
                    {lines.map(({ product, quantity }) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.32 }}
                        className="rounded-2xl border border-charcoal/5 bg-white p-3 shadow-soft"
                        role="listitem"
                      >
                        <div className="flex items-start gap-3">
                          <OptimizedImage src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-lg leading-tight text-charcoal">{product.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-label text-charcoal/40">{category.label}</p>
                            <p className="mt-2 text-sm text-brown">EGP {product.price.toLocaleString()} each</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(product.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal/35 transition duration-300 hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${product.name}`}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-charcoal/5 pt-3">
                          <div className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-beige/50 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-olive shadow-soft transition duration-300 hover:bg-beige"
                              aria-label={`Decrease ${product.name} quantity`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-5 text-center text-sm font-medium text-charcoal">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-olive shadow-soft transition duration-300 hover:bg-beige"
                              aria-label={`Increase ${product.name} quantity`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="font-serif text-xl text-charcoal">
                            EGP {(product.price * quantity).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {customizationEntries.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-gold/10 bg-beige/50 p-3">
                      <p className="mb-2 text-[11px] uppercase tracking-label text-charcoal/40">Customization</p>
                      <div className="flex flex-wrap gap-2">
                        {customizationEntries.map(([key, value]) => (
                          <span key={key} className="rounded-full bg-white px-3 py-1 text-xs text-charcoal/55 shadow-soft">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.section>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-6 border-t border-charcoal/10 pt-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-label text-charcoal/45">Package Total</p>
            <p className="mt-1 text-sm text-charcoal/50">Calculated live as quantities change.</p>
          </div>
          <p className="font-serif text-3xl text-brown">EGP {total.toLocaleString()}</p>
        </div>

        <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-label text-gold-dark">
          <PackageOpen size={14} /> Step 5
        </p>
        <Button onClick={onAddToCart} disabled={continueDisabled} fullWidth size="lg" className="group">
          <ShoppingBag size={16} /> Add Package to Cart <ArrowRight size={16} className="transition duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.aside>
  )
}

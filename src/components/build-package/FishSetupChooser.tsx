// @ts-nocheck
"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Clock, Droplets, Shell } from "lucide-react"
import { fishSubCategories } from "../../data/products"
import { useFishProducts } from "../../context/FishProductContext"
import OptimizedImage from "../common/OptimizedImage"

const subCategoryIcons = {
  aquarium: (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/20 bg-olive/8">
      <Shell size={20} className="text-olive" />
    </span>
  ),
  "aquatic-life": (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/20 bg-olive/8">
      <Droplets size={20} className="text-olive" />
    </span>
  ),
}

export default function FishSetupChooser({ onSelect }) {
  const { getFishProductsBySubCategory } = useFishProducts()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fishSubCategories.map((sub, index) => {
          // Dynamically check if there are products in this sub-category
          const products = getFishProductsBySubCategory(sub.id)
          const isComingSoon = products.length === 0

          return (
            <motion.button
              key={sub.id}
              type="button"
              onClick={() => !isComingSoon && onSelect(sub.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.12,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={isComingSoon ? {} : { y: -6, scale: 1.02 }}
              whileTap={isComingSoon ? {} : { scale: 0.98 }}
              className={`group relative flex flex-col overflow-hidden rounded-[24px] border text-left shadow-soft transition duration-300 ${
                isComingSoon
                  ? "cursor-default border-charcoal/8 bg-white/50 opacity-75"
                  : "border-charcoal/10 bg-white/80 hover:border-gold/40 hover:shadow-lift"
              }`}
              disabled={isComingSoon}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden sm:h-56">
                <OptimizedImage
                  src={sub.image}
                  alt={sub.label}
                  className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                    isComingSoon
                      ? "grayscale-[30%]"
                      : "group-hover:scale-105"
                  }`}
                  loading="lazy"
                  decoding="async"
                />
                {isComingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center bg-charcoal/25 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium uppercase tracking-label text-charcoal/70 shadow-soft">
                      <Clock size={13} /> Coming Soon
                    </span>
                  </div>
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Icon */}
                <div className="mb-4">
                  {subCategoryIcons[sub.icon] || subCategoryIcons["aquatic-life"]}
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl">
                  {sub.label}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-charcoal/58">
                  {sub.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sub.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-charcoal/8 bg-beige/60 px-3 py-1 text-xs text-charcoal/55"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Product count badge */}
                {!isComingSoon && (
                  <div className="mt-3">
                    <span className="text-xs text-olive/70">
                      {products.length} {products.length === 1 ? 'product' : 'products'} available
                    </span>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-6">
                  {isComingSoon ? (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-charcoal/12 bg-beige/50 px-6 py-3 text-sm font-medium uppercase tracking-label text-charcoal/40">
                      Coming Soon
                    </span>
                  ) : (
                    <span
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium uppercase tracking-label transition duration-300 ${
                        sub.id === "aquatic-life"
                          ? "border-olive bg-transparent text-olive group-hover:bg-olive group-hover:text-cream"
                          : "border-olive bg-olive text-cream group-hover:bg-olive-dark"
                      }`}
                    >
                      {sub.cta} <ArrowRight size={14} className="transition duration-300 group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Helper note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="flex items-start gap-3 rounded-2xl border border-olive/10 bg-olive/5 p-4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
          <Droplets size={14} />
        </span>
        <p className="text-sm leading-relaxed text-charcoal/60">
          You can start with either path. We will guide you to the most
          compatible package options.
        </p>
      </motion.div>
    </div>
  )
}


// @ts-nocheck
"use client"

import React from 'react'
import { Star, Eye } from 'lucide-react'
const packageFallbackImage = "/assets/package.png";
import OptimizedImage from '../common/OptimizedImage'
export default function ProductPreview({ form, images }) {
  const mainImage = images?.[0]?.preview || packageFallbackImage

  const name     = form.name     || 'Package Name'
  const tagline  = form.tagline  || 'Short description will appear here...'
  const price    = form.price    ? `LE ${Number(form.price).toLocaleString()}` : 'LE —'
  const discount = form.discountPrice ? `LE ${Number(form.discountPrice).toLocaleString()}` : null
  const status   = form.status   || 'active'
  const category = form.categories?.[0] || ''
  const tags     = form.tags || []

  const STATUS_COLORS = {
    active:       'bg-sage-100 text-sage-700',
    draft:        'bg-beige-dark text-charcoal/60',
    out_of_stock: 'bg-red-50 text-red-500',
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Eye size={14} className="text-charcoal/40" />
        <p className="text-xs text-charcoal/40 uppercase tracking-label">Live Preview</p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 shadow-card overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <OptimizedImage src={mainImage} alt={name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {status === 'active' && (
              <span className={`text-[10px] uppercase tracking-label px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS.active}`}>
                Active
              </span>
            )}
            {status === 'draft' && (
              <span className={`text-[10px] uppercase tracking-label px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS.draft}`}>
                Draft
              </span>
            )}
            {status === 'out_of_stock' && (
              <span className={`text-[10px] uppercase tracking-label px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS.out_of_stock}`}>
                Out of Stock
              </span>
            )}
          </div>
          {category && (
            <span className="absolute top-3 right-3 bg-olive text-cream text-[10px] uppercase tracking-label px-2.5 py-1 rounded-full">
              {category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-xl text-charcoal">{name}</h3>
          <p className="text-charcoal/55 text-sm mt-1 line-clamp-2">{tagline}</p>

          {/* Rating placeholder */}
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={12} className="text-gold fill-gold" />
            ))}
            <span className="text-charcoal/40 text-xs ml-1">5.0 (New)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-3 mb-4">
            <span className="text-brown font-semibold text-lg">{price}</span>
            {discount && (
              <span className="text-charcoal/35 text-sm line-through">{discount}</span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[10px] text-charcoal/50 bg-beige px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA button mock */}
          <div className="bg-olive text-cream text-xs uppercase tracking-label px-4 py-3 rounded-full text-center font-medium">
            View Package
          </div>
        </div>
      </div>

      <p className="text-[11px] text-charcoal/30 text-center mt-3">
        Preview updates as you type
      </p>
    </div>
  )
}

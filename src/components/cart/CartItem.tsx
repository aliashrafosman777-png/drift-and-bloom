// @ts-nocheck
"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trash2, Sprout, PawPrint, Flame, PackageCheck } from 'lucide-react'
import QuantitySelector from '../common/QuantitySelector'
import OptimizedImage from '../common/OptimizedImage'

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const itemLink = item.isCustomPackage ? '/build-your-package' : `/packages/${item.productId}`
  const title = item.isCustomPackage ? item.name : `The ${item.name} Collection`

  return (
    <motion.div layout className="group flex gap-4 sm:gap-5 py-5 border-b border-charcoal/10 last:border-b-0">
      <Link href={itemLink} className="shrink-0 overflow-hidden rounded-xl" aria-label={`Edit ${item.name}`}>
        <OptimizedImage src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover transition duration-700 group-hover:scale-105" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <Link href={itemLink} className="transition duration-300 hover:text-olive">
            <h3 className="font-serif text-base sm:text-lg text-charcoal">{title}</h3>
          </Link>
          <QuantitySelector
            size="sm"
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.quantity - 1)}
          />
        </div>

        <div className="mt-2 space-y-1 text-xs text-charcoal/55">
          {item.isCustomPackage ? (
            <>
              <p className="flex items-center gap-1.5">
                <PackageCheck size={12} className="text-sage shrink-0" /> Personalized package:
                <span className="text-charcoal/75"> {item.packageSelections?.length || 0} selected pieces</span>
              </p>
              <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {(item.packageSelections || []).map((selection) => (
                  <p key={`${selection.category}-${selection.productName}`} className="truncate text-charcoal/55">
                    <span className="text-charcoal/75">{selection.category}:</span> {selection.productName}
                    {selection.quantity ? ` × ${selection.quantity}` : ''}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <>
              {item.plantOption && (
                <p className="flex items-center gap-1.5">
                  <Sprout size={12} className="text-sage shrink-0" /> Plant Selected:{' '}
                  <span className="text-charcoal/75">{item.plantOption}</span>
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <PawPrint size={12} className="text-sage shrink-0" /> Pet-Friendly:{' '}
                <span className="text-charcoal/75">Yes</span>
              </p>
              {item.scent && (
                <p className="flex items-center gap-1.5">
                  <Flame size={12} className="text-brown shrink-0" /> Candle Scent:{' '}
                  <span className="text-charcoal/75">{item.scent}</span>
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <button type="button" onClick={onRemove} className="flex items-center gap-1.5 text-xs text-charcoal/45 hover:text-red-500 transition duration-300">
            <Trash2 size={13} /> Remove
          </button>
          <motion.p key={item.price * item.quantity} initial={{ opacity: 0.6, y: 2 }} animate={{ opacity: 1, y: 0 }} className="font-medium text-brown whitespace-nowrap">
            LE {(item.price * item.quantity).toLocaleString()}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

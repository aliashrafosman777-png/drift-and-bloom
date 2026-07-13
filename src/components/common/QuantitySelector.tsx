// @ts-nocheck
"use client"

import React from 'react'
import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({ quantity, onIncrease, onDecrease, size = 'md' }) {
  const pad = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2.5'
  return (
    <div className={`inline-flex items-center border border-charcoal/15 rounded-full ${pad} gap-4 bg-white`}>
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className="text-charcoal/70 hover:text-olive disabled:opacity-30 transition duration-300"
        disabled={quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span className="w-4 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Increase quantity"
        className="text-charcoal/70 hover:text-olive transition duration-300"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

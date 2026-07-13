// @ts-nocheck
"use client"

import React from 'react'
import { Check } from 'lucide-react'

export default function OptionButton({ text, selected, onClick, index }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative w-full text-left px-5 py-4 rounded-2xl border text-sm
        leading-snug font-medium transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/50
        ${selected
          ? 'border-olive bg-olive text-cream shadow-lift scale-[1.01]'
          : 'border-charcoal/12 bg-white/70 text-charcoal/75 hover:border-olive/40 hover:bg-white hover:text-charcoal hover:scale-[1.005] hover:shadow-card'
        }`}
    >
      <span className="flex items-start gap-3">
        {/* Letter label */}
        <span
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold mt-0.5 transition duration-200 ${
            selected
              ? 'bg-cream/20 text-cream'
              : 'bg-charcoal/8 text-charcoal/45 group-hover:bg-olive/10 group-hover:text-olive'
          }`}
        >
          {selected ? <Check size={11} strokeWidth={3} /> : String.fromCharCode(65 + index)}
        </span>
        <span className="flex-1">{text}</span>
      </span>
    </button>
  )
}

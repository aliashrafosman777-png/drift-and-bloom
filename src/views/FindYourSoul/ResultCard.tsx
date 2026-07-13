// @ts-nocheck
"use client"

import React from 'react'
import Link from 'next/link'
import { RotateCcw, ShoppingBag, Leaf, Flame, Gift, Sparkles, Heart } from 'lucide-react'

export default function ResultCard({ result, onRetake }) {
  const { main, secondary, isBlended, plant, isPetSafe } = result

  if (!main) return null

  const [p1, p2, p3] = main.palette || ['#E9EDC9', '#CCD5AE', '#B7B7A4']

  return (
    <div className="animate-scale-in w-full max-w-3xl mx-auto">

      {/* ── Soul Identity ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-lift mb-6"
        style={{
          background: `linear-gradient(135deg, ${p1}99 0%, ${p2}88 50%, ${p3}70 100%)`,
        }}
      >
        {/* Decorative bokeh blobs */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: p1 }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-25 blur-2xl"
          style={{ backgroundColor: p3 }}
        />

        <div className="relative px-8 sm:px-14 py-12 text-center">
          <p className="text-xs uppercase tracking-label text-charcoal/50 mb-2 font-medium">
            Your Soul is:
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl text-charcoal mb-1">
            {main.name}
          </h1>

          {isBlended && secondary && (
            <p className="text-base text-charcoal/60 mt-2 font-serif italic">
              with a soft touch of{' '}
              <span className="text-charcoal/80 font-semibold">{secondary.name}</span>
            </p>
          )}

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-3 my-5">
            <span className="flex-1 max-w-[80px] h-px bg-gold/40" />
            <span className="w-1.5 h-1.5 rotate-45 bg-gold shrink-0" />
            <span className="flex-1 max-w-[80px] h-px bg-gold/40" />
          </div>

          <p className="text-sm sm:text-base text-charcoal/70 max-w-md mx-auto leading-relaxed italic font-serif">
            "{main.feeling}"
          </p>

          <p className="text-sm text-charcoal/60 max-w-xl mx-auto leading-relaxed mt-4">
            {main.description}
          </p>

          {/* Mood badge */}
          <span className="inline-block mt-5 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-xs text-charcoal/60 font-medium border border-white/40">
            {main.mood}
          </span>
        </div>
      </div>

      {/* ── Recommended Package ───────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-card p-7 sm:p-9 mb-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-olive/10 text-olive flex items-center justify-center">
            <ShoppingBag size={16} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-xl text-charcoal">{main.packageName}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Plant */}
          <div className="bg-sage-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center">
                <Leaf size={14} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] uppercase tracking-label text-charcoal/45 font-medium">
                Recommended Plant
              </p>
            </div>
            <p className="text-sm text-charcoal font-medium leading-snug">{plant}</p>
            {isPetSafe && (
              <span className="inline-block mt-2 text-[10px] bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                🐾 Pet-Safe
              </span>
            )}
          </div>

          {/* Candle */}
          <div className="bg-[#FFF8F0] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brown/10 text-brown-dark flex items-center justify-center">
                <Flame size={14} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] uppercase tracking-label text-charcoal/45 font-medium">
                Candle Scent
              </p>
            </div>
            <p className="text-sm text-charcoal font-medium leading-snug">{main.candle}</p>
          </div>

          {/* Add-on */}
          <div className="bg-[#FAF5F0] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-beige-dark text-charcoal/50 flex items-center justify-center">
                <Gift size={14} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] uppercase tracking-label text-charcoal/45 font-medium">
                Add-On Touch
              </p>
            </div>
            <p className="text-sm text-charcoal font-medium leading-snug">{main.addOn}</p>
          </div>
        </div>

        {/* Inspirational line */}
        <div className="mt-6 flex items-start gap-3 bg-beige/60 rounded-2xl p-4">
          <Sparkles size={16} className="text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm text-charcoal/70 italic font-serif">{main.shortLine}</p>
        </div>
      </div>

      {/* ── Blended Secondary ─────────────────────────────────────────────── */}
      {isBlended && secondary && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={15} className="text-brown" strokeWidth={1.5} />
            <p className="text-sm font-medium text-charcoal">
              With a Soft Touch of{' '}
              <span className="font-serif italic">{secondary.name}</span>
            </p>
          </div>
          <p className="text-sm text-charcoal/60 leading-relaxed">{secondary.description}</p>
          <p className="text-xs text-charcoal/40 italic mt-2">{secondary.shortLine}</p>
        </div>
      )}

      {/* ── CTA row ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <Link
          href={`/packages/${main.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-olive hover:bg-olive-dark
            text-cream text-sm font-medium uppercase tracking-label px-6 py-4 rounded-full
            transition duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lift w-full sm:w-auto"
        >
          <ShoppingBag size={15} /> View {main.name} Package
        </Link>
        <Link
          href="/packages"
          className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-olive
            text-olive text-sm font-medium uppercase tracking-label px-6 py-4 rounded-full
            transition duration-300 hover:bg-olive hover:text-cream w-full sm:w-auto"
        >
          Browse All Packages
        </Link>
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-1.5 text-xs text-charcoal/45 hover:text-olive
            transition duration-200 underline underline-offset-2 mt-1 sm:mt-0"
        >
          <RotateCcw size={12} /> Retake Quiz
        </button>
      </div>
    </div>
  )
}

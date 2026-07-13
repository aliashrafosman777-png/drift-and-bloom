// @ts-nocheck
"use client"

import React from 'react'
import { PawPrint } from 'lucide-react'
import OptionButton from './OptionButton'
import { SECTION_LABELS } from './quizData'

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
  direction,         // 'forward' | 'backward' for slide animation class
  animKey,           // changes on question change to retrigger animation
}) {
  const sectionLabel = SECTION_LABELS[question.section] || ''
  const animClass =
    direction === 'backward' ? 'animate-slide-in-left' : 'animate-slide-in-right'

  return (
    <div
      key={animKey}
      className={`${animClass} relative bg-white/80 backdrop-blur-md rounded-3xl
        border border-white/60 shadow-lift p-7 sm:p-10`}
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        {question.isPetsQuestion && (
          <PawPrint size={14} className="text-brown" strokeWidth={1.5} />
        )}
        <span className="text-[11px] uppercase tracking-label text-gold-dark font-medium">
          {sectionLabel}
          {question.isFinale && ' · Final'}
        </span>
      </div>

      {/* Question text */}
      <h2
        className={`font-serif text-charcoal leading-tight mb-8 ${
          question.isFinale
            ? 'text-2xl sm:text-3xl'
            : 'text-xl sm:text-2xl'
        }`}
      >
        {question.text}
      </h2>

      {/* Options grid */}
      <div
        className={`grid gap-3 ${
          question.options.length <= 4
            ? 'grid-cols-1 sm:grid-cols-2'
            : question.options.length <= 6
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            index={i}
            text={opt.text}
            selected={selectedOption === i}
            onClick={() => onSelect(question.id, i)}
          />
        ))}
      </div>

      {/* Pets note */}
      {question.isPetsQuestion && (
        <p className="text-xs text-charcoal/40 mt-5 flex items-center gap-1.5">
          <PawPrint size={11} className="text-brown" />
          This answer only affects your plant recommendation — not your soul score.
        </p>
      )}

      {/* Finale note */}
      {question.isFinale && (
        <p className="text-xs text-charcoal/40 mt-5 italic">
          This is the most important question — take your time.
        </p>
      )}
    </div>
  )
}

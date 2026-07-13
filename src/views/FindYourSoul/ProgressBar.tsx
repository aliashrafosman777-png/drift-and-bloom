// @ts-nocheck
"use client"

import React from 'react'
import { SECTIONS, QUESTIONS } from './quizData'

export default function ProgressBar({ currentQuestion, totalQuestions, currentSection }) {
  const pct = Math.round((currentQuestion / totalQuestions) * 100)

  const sectionOrder = SECTIONS.map((s) => s.id)
  const currentSectionIdx = sectionOrder.indexOf(currentSection)

  return (
    <div className="w-full mb-8">
      {/* Section step pills */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-5 flex-wrap">
        {SECTIONS.map((sec, i) => {
          const idx = sectionOrder.indexOf(sec.id)
          const state =
            idx < currentSectionIdx ? 'done'
            : idx === currentSectionIdx ? 'active'
            : 'upcoming'

          return (
            <React.Fragment key={sec.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition duration-300 whitespace-nowrap ${
                  state === 'active'
                    ? 'bg-olive text-cream shadow-sm'
                    : state === 'done'
                    ? 'bg-olive/20 text-olive'
                    : 'bg-charcoal/8 text-charcoal/30'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold ${
                    state === 'done'
                      ? 'bg-olive text-cream'
                      : state === 'active'
                      ? 'bg-cream/30 text-cream'
                      : 'bg-charcoal/10 text-charcoal/25'
                  }`}
                >
                  {state === 'done' ? '✓' : sec.step}
                </span>
                <span className="hidden sm:inline">{sec.label}</span>
              </div>
              {i < SECTIONS.length - 1 && (
                <span className="w-4 sm:w-8 h-px bg-charcoal/15 self-center shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Linear fill bar */}
      <div className="relative h-1.5 bg-charcoal/8 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-sage to-olive rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-charcoal/40">Question {currentQuestion} of {totalQuestions}</p>
        <p className="text-xs text-charcoal/40">{pct}% complete</p>
      </div>
    </div>
  )
}

// @ts-nocheck
"use client"

import React from 'react'

const INCLUDES = [
  {
    label: 'Live Plant',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-9 h-9">
        <path d="M16 28 V13" />
        <path d="M16 13 C16 7 7 5 7 11 C7 18 16 15 16 13Z" />
        <path d="M16 19 C16 12 25 10 25 16 C25 22 16 20 16 19Z" />
      </svg>
    ),
  },
  {
    label: 'Scented Candle',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-9 h-9">
        <rect x="10" y="15" width="12" height="13" rx="2" />
        <path d="M16 15 V9" />
        <path d="M16 9 C16 6 19.5 5 16 2 C12.5 5 16 6 16 9Z" />
        <line x1="10" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    label: 'Story Card',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-9 h-9">
        <rect x="6" y="4" width="20" height="26" rx="2" />
        <line x1="10" y1="11" x2="22" y2="11" />
        <line x1="10" y1="16" x2="22" y2="16" />
        <line x1="10" y1="21" x2="17" y2="21" />
      </svg>
    ),
  },
  {
    label: 'Themed Packaging',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-9 h-9">
        <rect x="4" y="13" width="24" height="16" rx="2" />
        <polyline points="4,13 16,4 28,13" />
        <line x1="16" y1="4" x2="16" y2="29" />
        <path d="M4 13 Q10 11 16 7 Q22 11 28 13" />
      </svg>
    ),
  },
]

export default function PackageIncludes() {
  return (
    <div>
      <p className="font-serif text-base text-charcoal mb-5">Package Includes:</p>
      {/* Horizontal on all breakpoints; scrollable on very small screens */}
      <div className="flex items-start overflow-x-auto no-scrollbar gap-0">
        {INCLUDES.map(({ label, icon: Icon }, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center text-center flex-1 min-w-[72px] px-2">
              <div className="text-charcoal/45 mb-2.5">
                <Icon />
              </div>
              <span className="text-[11px] text-charcoal/55 font-medium whitespace-nowrap leading-snug">
                {label}
              </span>
            </div>
            {i < INCLUDES.length - 1 && (
              <span className="w-px self-stretch bg-charcoal/10 shrink-0 mt-1" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

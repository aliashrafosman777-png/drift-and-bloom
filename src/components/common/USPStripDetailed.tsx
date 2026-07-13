// @ts-nocheck
"use client"

import React from 'react'
import Container from './Container'

export default function USPStripDetailed({ items }) {
  return (
    <div className="bg-olive">
      <Container className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 py-8">
        {items.map(({ icon: Icon, label, note }) => (
          <div key={label} className="flex items-start justify-center gap-3 text-center sm:text-left sm:justify-start">
            <Icon className="text-gold shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
            <div>
              <p className="text-cream text-xs sm:text-sm font-medium">{label}</p>
              <p className="text-cream/50 text-[11px] mt-0.5">{note}</p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  )
}

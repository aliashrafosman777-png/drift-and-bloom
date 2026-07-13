// @ts-nocheck
"use client"

import React from 'react'
import { FiFeather, FiHeart, FiMail, FiGift } from 'react-icons/fi'
import Container from './Container'

const ITEMS = [
  { icon: FiFeather, label: 'Meaningful Details' },
  { icon: FiHeart, label: 'Calm & Intentional' },
  { icon: FiMail, label: 'Personalized for You' },
  { icon: FiGift, label: 'Beautifully Packaged' },
]

export default function USPStrip() {
  return (
    <div className="bg-olive">
      <Container className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 py-7">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-3">
            <Icon className="text-brown" size={20} />
            <span className="text-cream text-xs sm:text-sm uppercase tracking-label text-center">
              {label}
            </span>
          </div>
        ))}
      </Container>
    </div>
  )
}

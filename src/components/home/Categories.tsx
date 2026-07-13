// @ts-nocheck
"use client"

import React from 'react'
import Link from 'next/link'
import Container from '../common/Container'
import SectionTitle from '../common/SectionTitle'
import { heroCategories } from '../../data/products'
import OptimizedImage from '../common/OptimizedImage'

export default function Categories() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <Container>
        <SectionTitle
          eyebrow="Shop by Category"
          title="Find what your space needs"
          description="From easy-care greenery to softly scented candles, every category is a small step toward a calmer home."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
          {heroCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/packages?category=${cat.id === 'self-care' ? 'self-care' : 'all'}`}
              className="group block bg-beige rounded-2xl overflow-hidden border border-charcoal/5"
            >
              <OptimizedImage src={cat.image} alt={cat.label} className="w-full h-32 sm:h-44 object-cover" />
              <div className="p-4">
                <h3 className="font-serif text-lg text-charcoal">{cat.label}</h3>
                <p className="text-xs text-charcoal/50 mt-1 hidden sm:block">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

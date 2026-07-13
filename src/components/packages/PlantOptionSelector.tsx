// @ts-nocheck
"use client"

import React from 'react'
import { PawPrint, ShieldCheck, AlertTriangle, Sprout } from 'lucide-react'
import Container from '../common/Container'
import SectionTitle from '../common/SectionTitle'
import { getBestPlantPair } from '../../data/plants'
const plantsFallbackImage = "/assets/plants.jpeg";
import OptimizedImage from '../common/OptimizedImage'
function PlantCard({ plant, isFeatured, showPopular }) {
  const img = plant.image || plantsFallbackImage

  return (
    <div className="bg-white rounded-2xl border border-gold/15 shadow-soft overflow-hidden">
      {/* Badge row */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            plant.petSafe
              ? 'bg-sage-100 text-sage-700'
              : 'bg-[#F3E9E0] text-[#8B5E3C]'
          }`}
        >
          {plant.petSafe ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
          {plant.petSafe ? 'Pet-Friendly Option' : 'Not Pet-Friendly Option'}
        </span>
      </div>

      {/* Image */}
      <div className="relative px-5 pb-0">
        <div className="relative rounded-xl overflow-hidden" style={{ height: '260px' }}>
          <OptimizedImage
            src={img}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          {/* "Popular Choice" pill overlaid on image bottom-left */}
          {showPopular && plant.popular && (
            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal/70 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold/20 font-medium">
              Popular Choice
            </span>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="p-5 pt-4">
        <h3 className="font-serif text-2xl text-charcoal leading-tight">{plant.name}</h3>
        <p className="italic text-charcoal/45 text-sm mt-0.5">{plant.scientificName}</p>
        <p className="text-charcoal/65 text-sm mt-3 leading-relaxed">{plant.note}</p>
      </div>
    </div>
  )
}

export default function PlantOptionSelector({ product, petFriendly, onChange, quizContext = {} }) {
  // Build context from both the product and any quiz signals
  const ctx = {
    petFriendly,
    mood: quizContext.mood || product?.mood?.[0],
    collection: product?.id,
    ...quizContext,
  }

  const { petOption, nonPetOption } = getBestPlantPair(ctx)

  return (
    <section className="bg-ivory py-16 sm:py-20">
      <Container>
        <SectionTitle title="Choose Your Plant Option" />

        <p className="text-center text-charcoal/60 text-sm sm:text-base -mt-4 mb-6">
          Do you have pets at home?
        </p>

        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium border transition duration-300 ${
              petFriendly
                ? 'bg-olive text-cream border-olive shadow-sm'
                : 'bg-white text-charcoal/60 border-charcoal/15 hover:border-olive/40'
            }`}
          >
            <PawPrint size={16} strokeWidth={1.5} /> Yes, I have pets
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium border transition duration-300 ${
              !petFriendly
                ? 'bg-olive text-cream border-olive shadow-sm'
                : 'bg-white text-charcoal/60 border-charcoal/15 hover:border-olive/40'
            }`}
          >
            <PawPrint size={16} strokeWidth={1.5} /> No pets
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <PlantCard plant={petOption} isFeatured={petFriendly} showPopular={false} />
          <PlantCard plant={nonPetOption} isFeatured={!petFriendly} showPopular />
        </div>

        {/* Package includes strip */}
        <div className="mt-16">
          <PackageIncludesStrip />
        </div>
      </Container>
    </section>
  )
}

// ── Package Includes ────────────────────────────────────────────────────────
const INCLUDES = [
  {
    label: 'Live Plant',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" className="w-8 h-8">
        <path d="M16 28 V14" />
        <path d="M16 14 C16 8 8 6 8 12 C8 18 16 16 16 14Z" />
        <path d="M16 18 C16 12 24 10 24 16 C24 22 16 20 16 18Z" />
      </svg>
    ),
  },
  {
    label: 'Scented Candle',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" className="w-8 h-8">
        <rect x="10" y="14" width="12" height="14" rx="2" />
        <path d="M16 14 V8" />
        <path d="M16 8 C16 5 19 4 16 2 C13 4 16 5 16 8Z" />
        <line x1="10" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    label: 'Story Card',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" className="w-8 h-8">
        <rect x="6" y="5" width="20" height="24" rx="2" />
        <line x1="10" y1="11" x2="22" y2="11" />
        <line x1="10" y1="16" x2="22" y2="16" />
        <line x1="10" y1="21" x2="18" y2="21" />
      </svg>
    ),
  },
  {
    label: 'Themed Packaging',
    icon: () => (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" className="w-8 h-8">
        <rect x="4" y="13" width="24" height="16" rx="2" />
        <path d="M4 13 L16 4 L28 13" />
        <path d="M16 4 V29" />
        <path d="M4 13 C10 13 16 9 16 4 C16 9 22 13 28 13" />
      </svg>
    ),
  },
]

function PackageIncludesStrip() {
  return (
    <div className="text-left sm:text-center">
      <p className="font-serif text-base text-charcoal mb-5 sm:mb-6">Package Includes:</p>
      <div className="flex items-start gap-0 overflow-x-auto no-scrollbar sm:justify-center">
        {INCLUDES.map(({ label, icon: Icon }, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center text-center min-w-[90px] sm:min-w-0 sm:w-32 px-4">
              <div className="text-charcoal/50 mb-3">
                <Icon />
              </div>
              <span className="text-xs text-charcoal/60 font-medium whitespace-nowrap">{label}</span>
            </div>
            {i < INCLUDES.length - 1 && (
              <span className="w-px self-stretch bg-charcoal/10 mt-1 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

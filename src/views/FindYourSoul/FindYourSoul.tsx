// @ts-nocheck
"use client"

import React from "react";
import {
  Gift,
  Sparkles,
  Clock,
  Feather,
  Mail,
  Heart,
  PenLine,
  Package,
} from "lucide-react";
import Quiz from "./Quiz";
import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import USPStripDetailed from "../../components/common/USPStripDetailed";
const awaitSoul = "/assets/awiatsoul.png";
import OptimizedImage from '../../components/common/OptimizedImage'
const HERO_BADGES = [
  { icon: Gift, label: "Thoughtful Recommendations" },
  { icon: Sparkles, label: "100% Personalized for You" },
  { icon: Clock, label: "Takes Less Than 5 Minutes" },
];

const HOW_IT_WORKS = [
  {
    icon: PenLine,
    title: "You Answer",
    note: "Tell us about your soul through 12 gentle questions.",
  },
  {
    icon: Package,
    title: "We Match",
    note: "Our system matches you to your soul collection.",
  },
  {
    icon: Gift,
    title: "You Receive",
    note: "Unbox a moment of meaning, made just for you.",
  },
];

const USP_ITEMS = [
  {
    icon: Feather,
    label: "Meaningful Details",
    note: "Every item has a purpose",
  },
  { icon: Mail, label: "Thoughtfully Curated", note: "Handpicked with care" },
  {
    icon: Sparkles,
    label: "Made to Inspire",
    note: "Designed to uplift your day",
  },
  {
    icon: Heart,
    label: "Made for You",
    note: "Personalized just for your soul",
  },
];

export default function FindYourSoul() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-cream overflow-hidden py-14 sm:py-20">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-sage/8 blur-3xl pointer-events-none" />

        <Container className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span className="text-gold-dark text-xs tracking-label uppercase font-medium">
              Personalized Soul Quiz
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl text-charcoal mt-3 leading-tight">
              Find Your Soul
            </h1>
            <p className="text-charcoal/60 mt-5 max-w-md text-base leading-relaxed">
              A gentle 12-question journey to discover what your soul needs
              right now — and the perfect Drift & Bloom package to match.
            </p>

            <div className="flex flex-wrap gap-x-8 gap-y-5 mt-8">
              {HERO_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center w-24"
                >
                  <div className="w-12 h-12 rounded-full border border-gold/35 bg-white/60 backdrop-blur-sm flex items-center justify-center mb-2 text-olive shadow-soft">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] text-charcoal/55 leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center animate-float">
            <div className="relative">
              <OptimizedImage
                src={awaitSoul}
                alt="A curated Drift & Bloom gift package — plant, candle, and story card"
                className="w-full max-w-md rounded-3xl shadow-lift object-cover"
              />
              {/* Floating accent card */}
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-card px-4 py-3 border border-gold/15 animate-fade-in-up">
                <p className="text-xs text-charcoal/50 uppercase tracking-label">
                  Right now, you need
                </p>
                <p className="font-serif text-lg text-charcoal mt-0.5">
                  Something just for you
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Quiz ── */}
      <section className="relative bg-beige py-14 sm:py-20 overflow-hidden">
        {/* Background texture blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gold/4 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-sage/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cream/40 blur-3xl" />
        </div>

        <Container className="relative max-w-2xl">
          <Quiz />
        </Container>
      </section>

      {/* ── How It Works ── */}
      <section className="relative bg-beige pb-16 sm:pb-20 overflow-hidden">
        <Container className="relative">
          <SectionTitle title="How Your Recommendation Works" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {HOW_IT_WORKS.map(({ icon: Icon, title, note }, i) => (
              <div
                key={title}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-3 text-olive bg-white/60">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-charcoal">
                  {i + 1}. {title}
                </p>
                <p className="text-xs text-charcoal/55 mt-1.5 leading-relaxed">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <USPStripDetailed items={USP_ITEMS} />
    </>
  );
}

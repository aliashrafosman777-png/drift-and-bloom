// @ts-nocheck
"use client"

import React from "react";
import { Leaf, Gift, Heart, ArrowRight } from "lucide-react";
import Container from "../common/Container";
import Button from "../common/Button";
const findYourSoul = "/assets/findyoursoul.jpeg";
import OptimizedImage from '../common/OptimizedImage'
const STEPS = [
  { icon: Leaf, label: "Answer a few meaningful questions" },
  { icon: Gift, label: "Get a personalized package match" },
  { icon: Heart, label: "Receive a gift that feels like you" },
];

export default function FindYourSoulPromo() {
  return (
    <section className="bg-beige py-16 sm:py-20">
      <Container>
        <div className="bg-cream rounded-3xl border border-gold/15 p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          {/* Text */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <span className="text-gold-dark text-xs tracking-label uppercase">
              Take the Quiz
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mt-3">
              Find Your Soul
            </h2>
            <p className="text-charcoal/60 mt-3 text-sm sm:text-base">
              Answer a few meaningful questions to discover what your soul needs
              right now — and get a personalized package match.
            </p>
            <Button href="/find-your-soul" className="mt-6">
              Begin the Journey
            </Button>
          </div>

          {/* Notebook image */}
          <div className="w-full lg:w-1/3 flex justify-center animate-fade-in">
            <OptimizedImage
              src={findYourSoul}
              alt="A notebook that says 'Listen within' beside a lit candle"
              className="w-full max-w-xs rounded-2xl shadow-soft object-cover"
            />
          </div>

          {/* Steps */}
          <div className="w-full lg:w-1/3 flex items-start justify-center gap-2 sm:gap-4">
            {STEPS.map(({ icon: Icon, label }, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center text-center w-20 sm:w-24">
                  <div className="w-14 h-14 rounded-full border border-gold/50 flex items-center justify-center mb-3 text-olive">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs text-charcoal/60 leading-snug">
                    {label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="text-gold mt-5 shrink-0" size={16} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

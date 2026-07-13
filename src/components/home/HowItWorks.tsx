// @ts-nocheck
"use client"

import React from "react";
import { Gift, PenLine } from "lucide-react";
import Container from "../common/Container";
import SectionTitle from "../common/SectionTitle";
import Button from "../common/Button";
const howItWorksImage = "/assets/howtowork.jpeg";
import OptimizedImage from '../common/OptimizedImage'
export default function HowItWorks() {
  return (
    <section className="bg-ivory py-16 sm:py-20">
      <Container>
        <SectionTitle title="How It Works" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr] items-center gap-10 lg:gap-8">
          {/* Left column */}
          <div className="flex flex-col items-center text-center order-2 lg:order-1 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full border border-gold/50 flex items-center justify-center mb-5 text-olive">
              <Gift size={26} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-charcoal mb-3">
              Standard Packages
            </h3>
            <p className="text-charcoal/55 text-sm leading-relaxed max-w-[240px] mb-6">
              Thoughtfully crafted, ready to gift. Choose a collection that
              speaks to your moment.
            </p>
            <Button href="/packages" size="sm">
              Explore Packages
            </Button>
          </div>

          {/* Vertical divider (desktop only) */}
          <span className="hidden lg:block w-px h-64 bg-gold/30 order-1 lg:order-2" />

          {/* Center image */}
          <div className="order-1 lg:order-3 flex justify-center animate-fade-in">
            <div className="bg-white rounded-3xl shadow-soft border border-gold/15 p-3 sm:p-4 w-full max-w-sm">
              <div className="overflow-hidden rounded-[120px_120px_16px_16px] sm:rounded-[160px_160px_20px_20px] aspect-[4/5]">
                <OptimizedImage
                  src={howItWorksImage}
                  alt="A wrapped Drift & Bloom gift box with a ribbon, candle and gift card"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Vertical divider (desktop only) */}
          <span className="hidden lg:block w-px h-64 bg-gold/30 order-3 lg:order-4" />

          {/* Right column */}
          <div className="flex flex-col items-center text-center order-4 lg:order-5 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full border border-gold/50 flex items-center justify-center mb-5 text-olive">
              <PenLine size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-charcoal mb-3">
              Personalized Packages
            </h3>
            <p className="text-charcoal/55 text-sm leading-relaxed max-w-[240px] mb-6">
              Create something truly personal. Share your story and we'll craft
              a package that's uniquely yours.
            </p>
            <Button href="/find-your-soul" size="sm">
              Create Yours
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

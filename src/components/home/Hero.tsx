// @ts-nocheck
"use client"

import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Container from "../common/Container";
import Button from "../common/Button";
const homepageHeroImage = "/assets/homepage.jpeg";
import OptimizedImage from '../common/OptimizedImage'
export default function Hero() {
  return (
    <section className="bg-cream overflow-hidden">
      <Container className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-brown text-xs sm:text-sm tracking-label uppercase">
            Plant &amp; gift packages
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mt-4">
            Thoughtful gifts,
            <br />
            beautifully <span className="italic text-brown">meant.</span>
          </h1>
          <p className="text-charcoal/60 mt-5 max-w-md text-sm sm:text-base leading-relaxed">
            Meaningful packages, built from stories, colors, scents and plants —
            made to slow you down and remind someone they're loved.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Button href="/packages" size="lg">
              Explore Packages
            </Button>
            <Button href="/find-your-soul" variant="outline" size="lg">
              Find Your Soul <FiArrowRight size={14} />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 22, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.54, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative group"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold/20 to-sage/10 blur-2xl opacity-70" />
          <OptimizedImage
            src={homepageHeroImage}
            alt="A Drift & Bloom gift box with a plant, candle and gift card"
            className="relative w-full h-[500px] rounded-3xl shadow-lift object-cover transition duration-700 group-hover:scale-[1.015]"
            loading="eager"
          />
        </motion.div>
      </Container>
    </section>
  );
}

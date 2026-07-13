// @ts-nocheck
"use client"

import React from "react";
import Container from "../common/Container";
import Button from "../common/Button";
const ourStoryImg = "/assets/ourstory.jpeg";
import OptimizedImage from '../common/OptimizedImage'
export default function About() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <Container className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <OptimizedImage
          src={ourStoryImg}
          alt="Drift & Bloom packaging being prepared by hand"
          className="w-full h-auto rounded-2xl object-cover order-2 lg:order-1"
        />
        <div className="order-1 lg:order-2">
          <span className="text-brown text-xs sm:text-sm tracking-label uppercase">
            Our Story
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4">
            Packages for your soul
          </h2>
          <p className="text-charcoal/60 mt-5 text-sm sm:text-base leading-relaxed">
            Drift &amp; Bloom began with a simple belief: that a plant, a flame
            and a few honest words can hold more comfort than almost anything
            else. Every collection is hand-assembled in small batches, paired
            with a scent and a story, and packaged to feel like it was made for
            one person — because it was.
          </p>
          <p className="text-charcoal/60 mt-4 text-sm sm:text-base leading-relaxed">
            No mass production, no filler. Just thoughtful gifts for the people
            who notice the details — including yourself.
          </p>
          <Button href="/packages" variant="outline" className="mt-7">
            Discover Our Collections
          </Button>
        </div>
      </Container>
    </section>
  );
}

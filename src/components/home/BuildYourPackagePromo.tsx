// @ts-nocheck
"use client"

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Reveal, Stagger, fadeUp } from "../common/Motion";
const plantImage = "/assets/plants.jpeg";
const candleImage = "/assets/candles.jpeg";
const fishImage = "/assets/fishs.jpeg";
import OptimizedImage from '../common/OptimizedImage'
const PACKAGE_CATEGORIES = [
  {
    id: "plants",
    name: "Plants",
    title: "Plants",
    description: "Easy-care greenery for every space.",
    image: plantImage,
  },
  {
    id: "candles",
    name: "Candles",
    title: "Candles",
    description: "Hand-poured candles with relaxing scents.",
    image: candleImage,
  },
  {
    id: "fish",
    name: "Fish",
    title: "Fish",
    description: "Beautiful Betta fish and aquarium essentials.",
    image: fishImage,
  },
];

function scrollByCard(container, direction) {
  if (!container) return;
  const firstCard = container.querySelector("[data-package-card]");
  const amount =
    firstCard?.getBoundingClientRect().width || container.clientWidth * 0.86;
  container.scrollBy({ left: direction * (amount + 24), behavior: "smooth" });
}

function PackageCategoryCard({ category }) {
  return (
    <Reveal
      as="article"
      variant={fadeUp}
      className="min-w-[82%] snap-center sm:min-w-[46%] lg:min-w-0 lg:flex-1"
      data-package-card
    >
      <Link
        href={`/build-your-package?category=${category.id}`}
        aria-label={`Build your package starting with ${category.name}`}
        className="group relative block h-[320px] overflow-hidden rounded-[24px] border border-charcoal/5 bg-cream/80 shadow-card outline-none backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-gold/30 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-sage sm:h-[350px] lg:h-[380px]"
      >
        {/* Background */}
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(201,169,97,0.10),transparent_34%),linear-gradient(180deg,rgba(250,247,240,0.10),rgba(245,241,232,0.45))]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Image */}
          <div className="h-[72%] overflow-hidden">
            <OptimizedImage
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Text */}
          <div className="flex flex-1 flex-col justify-center p-6">
            <h3 className="font-serif text-3xl leading-none text-charcoal">
              {category.name}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-charcoal/60 sm:text-base">
              {category.description}
            </p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function BuildYourPackagePromo() {
  const carouselRef = useRef(null);

  return (
    <section
      className="relative overflow-hidden bg-beige py-16 sm:py-20 lg:py-24"
      aria-labelledby="build-package-home-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(201,169,97,0.16),transparent_28%),radial-gradient(circle_at_90%_78%,rgba(122,158,126,0.12),transparent_30%)]" />
      <Container className="relative z-10">
        <Reveal variant={fadeUp} className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-label text-gold-dark sm:text-sm">
            Build Your Package
          </p>
          <h2
            id="build-package-home-title"
            className="mt-5 font-serif text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl"
          >
            Build your perfect calming space
          </h2>
          <div
            className="mx-auto my-6 flex w-full max-w-sm items-center justify-center gap-5"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-gold/35" />
            <span className="h-2 w-2 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gold/35" />
          </div>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-charcoal/58 sm:text-lg">
            Start with a category and customize every detail to create a package
            that perfectly fits your home.
          </p>
        </Reveal>

        <div className="relative mt-12 sm:mt-14">
          <Stagger
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-4 sm:gap-6 lg:overflow-visible"
          >
            {PACKAGE_CATEGORIES.map((category) => (
              <PackageCategoryCard key={category.id} category={category} />
            ))}
          </Stagger>
        </div>

        <div
          className="mt-4 flex justify-center gap-3 lg:hidden"
          aria-label="Package category carousel controls"
        >
          <button
            type="button"
            onClick={() => scrollByCard(carouselRef.current, -1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-charcoal/55 text-cream shadow-soft backdrop-blur transition duration-300 hover:bg-olive"
            aria-label="Previous package category"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(carouselRef.current, 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-charcoal/55 text-cream shadow-soft backdrop-blur transition duration-300 hover:bg-olive"
            aria-label="Next package category"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Container>
    </section>
  );
}

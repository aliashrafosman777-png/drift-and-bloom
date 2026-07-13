// @ts-nocheck
"use client"

import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Container from "../components/common/Container";
import SearchBar from "../components/common/SearchBar";
import CategoryFilter from "../components/common/CategoryFilter";
import PackageCard from "../components/packages/PackageCard";
import USPStrip from "../components/common/USPStrip";
import {
  BEST_SELLER_CATEGORY_ID,
  isBestSellerProduct,
  packageFilterOptions,
} from "../data/products";
import { useProducts } from "../context/ProductContext";
const heroBg = "/assets/package.png";
import { Reveal, Stagger } from "../components/common/Motion";

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

export default function Packages() {
  const { products } = useProducts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialCategory = searchParams.get("category") || "all";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (id) => {
    const nextCategory = id === activeCategory ? "all" : id;
    setActiveCategory(nextCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase().trim()),
    );
    if (activeCategory === BEST_SELLER_CATEGORY_ID) {
      list = list.filter(isBestSellerProduct);
    } else if (activeCategory !== "all") {
      list = list.filter((p) => p.categories.includes(activeCategory));
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [products, search, activeCategory, sort]);

  return (
    <>
      <section
        className="relative h-[340px] md:h-[60vh] overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Olive Overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* Content */}
        <Container className="relative z-10 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-cream">
              Packages
            </h1>

            <span className="block w-32 h-px bg-[#B88B52] mx-auto my-5" />

            <p className="text-white text-lg md:text-xl leading-relaxed">
              Curated packages for every season of life.
              <br />
              Each one designed to nurture, inspire, and bring beauty to your
              everyday.
            </p>
          </motion.div>
        </Container>
      </section>

      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <Reveal className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="lg:w-80">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full lg:w-56 bg-white border border-charcoal/15 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sage"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Sort by: {opt.label}
                </option>
              ))}
            </select>
          </Reveal>

          <Reveal className="mb-8">
            <CategoryFilter
              categories={packageFilterOptions}
              active={activeCategory}
              onChange={handleCategoryChange}
            />
          </Reveal>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-20 rounded-3xl border border-gold/15 bg-white/60"
              >
                <p className="text-charcoal/60">
                  No packages match "{search}". Try a different search or
                  category.
                </p>
              </motion.div>
            ) : (
              <Stagger
                key={`${activeCategory}-${sort}-${search}`}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
              >
                {filtered.map((product) => (
                  <PackageCard key={product.id} product={product} />
                ))}
              </Stagger>
            )}
          </AnimatePresence>
        </Container>
      </section>

      <USPStrip />
    </>
  );
}

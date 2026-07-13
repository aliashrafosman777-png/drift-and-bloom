// @ts-nocheck
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Leaf,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Container from "../components/common/Container";
import CategoryPills from "../components/build-package/CategoryPills";
import ProductChoiceCard from "../components/build-package/ProductChoiceCard";
import PackageSummary from "../components/build-package/PackageSummary";
import CustomizationPanel, {
  createDefaultCustomizations,
} from "../components/build-package/CustomizationPanel";
import {
  buildPackageCategories,
  packageBuilderProductsByCategory,
} from "../data/products";
import { usePackage } from "../context/PackageContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/common/Toast";
const packageIllustration = "/assets/package.png";
const fishIcon = "/assets/fish.jpeg";
import OptimizedImage from '../components/common/OptimizedImage'
const categoryNotes = {
  plants:
    "Bring the package to life with soft greenery, sculptural leaves, and easy-care botanical pieces.",
  candles:
    "Begin with scent and flame. Add one candle or build a layered candle story with multiple moods.",
  fish: "Finish with a living water moment — from a Betta fish to refined aquarium essentials.",
};

const categoryAliases = {
  plant: "plants",
  plants: "plants",
  candle: "candles",
  candles: "candles",
  fish: "fish",
  fishes: "fish",
  "fish-tank": "fish",
  "fish-tanks": "fish",
  aquarium: "fish",
  aquariums: "fish",
};

const flowSteps = [
  "Choose Category",
  "Choose Product",
  "Customize",
  "Review Package",
  "Add Package to Cart",
];

const normalizeCategoryParam = (value) =>
  categoryAliases[
    String(value || "")
      .trim()
      .toLowerCase()
  ] || null;

function FlowProgress() {
  return (
    <div className="mb-8 rounded-[24px] border border-gold/15 bg-white/65 p-4 shadow-soft backdrop-blur sm:p-5">
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-5"
        aria-label="Build package steps"
      >
        {flowSteps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-3 sm:flex-col sm:items-start"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive text-sm text-cream shadow-soft">
              {index < 3 ? <Check size={14} /> : index + 1}
            </span>
            <span>
              <span className="block text-[10px] uppercase tracking-label text-gold-dark">
                Step {index + 1}
              </span>
              <span className="mt-1 block font-serif text-lg leading-tight text-charcoal">
                {step}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BuildPackage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [customizations, setCustomizations] = useState(
    createDefaultCustomizations,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const builderRef = useRef(null);
  const hasScrolledForInitialQuery = useRef(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const {
    selectedItems,
    selectedList,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    incrementItem,
    decrementItem,
    clearPackage,
    getProductQuantity,
    getTotal,
    getProgress,
  } = usePackage();

  const displayCategories = useMemo(
    () =>
      buildPackageCategories.map((category) =>
        category.id === "fish"
          ? {
              ...category,
              emoji: (
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
                  <OptimizedImage
                    src={fishIcon}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    className="h-full w-full scale-125 object-contain mix-blend-multiply"
                  />
                </span>
              ),
            }
          : category,
      ),
    [],
  );

  const activeCategory = displayCategories[activeIndex];
  const activeProducts = useMemo(
    () => packageBuilderProductsByCategory[activeCategory.id] || [],
    [activeCategory.id],
  );
  const total = getTotal();
  const progress = getProgress();

  const scrollToBuilderTop = () => {
    window.requestAnimationFrame(() => {
      const top = builderRef.current?.getBoundingClientRect().top ?? 0;
      window.scrollTo({ top: window.scrollY + top - 92, behavior: "smooth" });
    });
  };

  useEffect(() => {
    const categoryId = normalizeCategoryParam(searchParams.get("category"));
    if (!categoryId) return;

    const index = displayCategories.findIndex(
      (category) => category.id === categoryId,
    );
    if (index < 0) return;

    setActiveIndex(index);

    if (!hasScrolledForInitialQuery.current) {
      hasScrolledForInitialQuery.current = true;
      window.setTimeout(scrollToBuilderTop, 180);
    }
  }, [searchParams, displayCategories]);

  const moveToCategory = (index) => {
    const nextIndex = Math.max(
      0,
      Math.min(index, displayCategories.length - 1),
    );
    const nextCategory = displayCategories[nextIndex];
    setActiveIndex(nextIndex);
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", nextCategory.id);
    router.push(`${pathname}?${params.toString()}`);
    scrollToBuilderTop();
  };

  const handleCustomizationChange = (categoryId, groupId, value) => {
    setCustomizations((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] || {}),
        [groupId]: value,
      },
    }));
  };

  const handleAddProduct = (product) => {
    addItem(product);
  };

  const handleClearPackage = () => {
    clearPackage();
    scrollToBuilderTop();
  };

  const handleAddPackageToCart = () => {
    if (!selectedList.length) return;

    const packageSelections = selectedList.map(({ product, quantity }) => {
      const categoryId =
        normalizeCategoryParam(product.category) || product.category;
      const category = displayCategories.find((item) => item.id === categoryId);

      return {
        category: category?.label || product.category,
        productName: product.name,
        quantity,
        price: product.price,
        customizations: customizations[categoryId] || {},
      };
    });

    addToCart(
      {
        id: `custom-package-${Date.now()}`,
        name: "Custom Calming Space Package",
        price: total,
        image: selectedList[0]?.product?.image || packageIllustration,
        isCustomPackage: true,
        packageSelections,
      },
      1,
    );

    clearPackage();
    showToast("Your custom package has been added to the cart.");
    router.push("/cart");
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden bg-beige text-charcoal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,169,97,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(122,158,126,0.14),transparent_32%)]" />
        <Container className="relative z-10 py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-label text-gold-dark"
            >
              <Leaf size={14} /> Build Your Package
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.55 }}
              className="font-serif text-5xl leading-tight text-charcoal sm:text-6xl lg:text-7xl"
            >
              Build your perfect calming space
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.35,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mx-auto my-6 h-px w-44 origin-center bg-gold/70"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5 }}
              className="mx-auto max-w-2xl text-base leading-relaxed text-charcoal/62 sm:text-lg"
            >
              Start with plants, candles, or fish. Choose the product,
              personalize the details, review the full package, then add it to
              your cart.
            </motion.p>
          </div>
        </Container>
      </motion.section>

      <section
        className="bg-cream py-10 sm:py-14 lg:py-16"
        ref={builderRef}
        id="package-builder"
      >
        <Container>
          <FlowProgress />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)] lg:gap-10 xl:gap-12">
            <div className="min-w-0 space-y-8">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[24px] border border-gold/15 bg-white/65 p-5 shadow-soft backdrop-blur sm:p-6"
                aria-labelledby="choose-category-title"
              >
                <div className="mb-6">
                  <p className="mb-2 text-xs uppercase tracking-label text-gold-dark">
                    Step 1
                  </p>
                  <h2
                    id="choose-category-title"
                    className="font-serif text-3xl text-charcoal sm:text-4xl"
                  >
                    Choose Category
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/58">
                    Select the category you want to build around first. Your URL
                    will update so you can share or refresh this exact starting
                    point.
                  </p>
                </div>
                <CategoryPills
                  categories={displayCategories}
                  activeIndex={activeIndex}
                  selectedItems={selectedItems}
                  onSelect={moveToCategory}
                />
              </motion.section>

              <AnimatePresence mode="wait">
                <motion.section
                  key={activeCategory.id}
                  id={`package-products-${activeCategory.id}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  aria-labelledby="choose-product-title"
                >
                  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-label text-gold-dark">
                        <Sparkles size={14} /> Step 2
                      </p>
                      <h2
                        id="choose-product-title"
                        className="font-serif text-4xl text-charcoal sm:text-5xl"
                      >
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true">{activeCategory.emoji}</span>
                          <span>Choose {activeCategory.label}</span>
                        </span>
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60 sm:text-base">
                        {categoryNotes[activeCategory.id]}
                      </p>
                    </div>
                    {activeIndex < displayCategories.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => moveToCategory(activeIndex + 1)}
                        className="inline-flex items-center gap-2 text-sm text-olive transition duration-300 hover:text-olive-dark"
                      >
                        Next: {displayCategories[activeIndex + 1].label}{" "}
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => moveToCategory(0)}
                        className="inline-flex items-center gap-2 text-sm text-olive transition duration-300 hover:text-olive-dark"
                      >
                        Back to Plants <ArrowRight size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    {activeProducts.map((product) => (
                      <ProductChoiceCard
                        key={product.id}
                        product={product}
                        quantity={getProductQuantity(product.id)}
                        onAdd={handleAddProduct}
                        onIncrease={(item) => incrementItem(item.id)}
                        onDecrease={(item) => decrementItem(item.id)}
                      />
                    ))}
                  </div>
                </motion.section>
              </AnimatePresence>

              <CustomizationPanel
                key={`customize-${activeCategory.id}`}
                category={activeCategory}
                values={customizations[activeCategory.id]}
                onChange={handleCustomizationChange}
              />
            </div>

            <div className="lg:order-none">
              <PackageSummary
                categories={displayCategories}
                selectedItems={selectedItems}
                selectedList={selectedList}
                total={total}
                progress={{ ...progress, itemCount }}
                customizations={customizations}
                onChangeCategory={(categoryId) => {
                  const index = displayCategories.findIndex(
                    (category) => category.id === categoryId,
                  );
                  if (index >= 0) moveToCategory(index);
                }}
                onClear={handleClearPackage}
                onAddToCart={handleAddPackageToCart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

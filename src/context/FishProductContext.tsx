// @ts-nocheck
"use client"

/**
 * FishProductContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages fish builder products (Aquariums / Aquatic Life) for the package
 * builder. Initializes from seed data and persists admin additions to
 * localStorage so they survive page refreshes.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FISH_PRODUCT_SEED } from '../data/products'

const FishProductContext = createContext(null)
const STORAGE_KEY = 'db_fish_products_v1'

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function readStoredFishProducts() {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem(STORAGE_KEY), null)
}

export function FishProductProvider({ children }) {
  const [fishProducts, setFishProducts] = useState(FISH_PRODUCT_SEED)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = readStoredFishProducts()
    if (stored) {
      setFishProducts(stored)
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage whenever products change AFTER initial hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fishProducts))
    } catch {
      /* Ignore unavailable storage */
    }
  }, [fishProducts, isHydrated])

  /** Add a new fish product */
  const addFishProduct = useCallback((rawForm) => {
    const id =
      (rawForm.name || 'fish-product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    const images = rawForm.images?.length
      ? rawForm.images.map((img) => img.preview || img.url || img)
      : []

    const product = {
      id,
      name: rawForm.name || '',
      price: Number(rawForm.price) || 0,
      discountPrice: rawForm.discountPrice ? Number(rawForm.discountPrice) : null,
      description: rawForm.description || '',
      shortDescription: rawForm.shortDescription || '',
      image: images[0] || '/assets/fishs.jpeg',
      gallery: images.slice(1),
      category: 'fish',
      fishSubCategory: rawForm.fishSubCategory || 'aquatic-life',
      story: rawForm.story || '',
      tags: rawForm.tags || [],
      status: rawForm.status || 'active',
      _createdAt: new Date().toISOString(),
      _source: 'admin-form',
    }

    setFishProducts((prev) => [product, ...prev])
    return product
  }, [])

  /** Update an existing fish product */
  const updateFishProduct = useCallback((id, rawForm) => {
    const images = rawForm.images?.length
      ? rawForm.images.map((img) => img.preview || img.url || img)
      : []

    setFishProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: rawForm.name || p.name,
              price: Number(rawForm.price) || p.price,
              discountPrice: rawForm.discountPrice ? Number(rawForm.discountPrice) : null,
              description: rawForm.description ?? p.description,
              shortDescription: rawForm.shortDescription ?? p.shortDescription,
              image: images[0] || p.image,
              gallery: images.length > 1 ? images.slice(1) : p.gallery,
              fishSubCategory: rawForm.fishSubCategory || p.fishSubCategory,
              story: rawForm.story ?? p.story,
              tags: rawForm.tags || p.tags,
              status: rawForm.status || p.status,
            }
          : p
      )
    )
  }, [])

  /** Remove a fish product */
  const removeFishProduct = useCallback((id) => {
    setFishProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  /** Get fish products by sub-category */
  const getFishProductsBySubCategory = useCallback(
    (subCategoryId) =>
      fishProducts.filter(
        (p) => p.fishSubCategory === subCategoryId && p.status !== 'draft'
      ),
    [fishProducts]
  )

  /** Get all fish products (including drafts — for admin) */
  const getAllFishProducts = useCallback(
    () => fishProducts,
    [fishProducts]
  )

  const value = useMemo(
    () => ({
      fishProducts,
      addFishProduct,
      updateFishProduct,
      removeFishProduct,
      getFishProductsBySubCategory,
      getAllFishProducts,
    }),
    [fishProducts, addFishProduct, updateFishProduct, removeFishProduct, getFishProductsBySubCategory, getAllFishProducts]
  )

  return <FishProductContext.Provider value={value}>{children}</FishProductContext.Provider>
}

export function useFishProducts() {
  const ctx = useContext(FishProductContext)
  if (!ctx) throw new Error('useFishProducts must be used within a FishProductProvider')
  return ctx
}

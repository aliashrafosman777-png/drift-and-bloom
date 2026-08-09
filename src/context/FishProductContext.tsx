import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FISH_PRODUCT_SEED } from '../data/products'
import { apiFetch } from '../lib/api'

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

function matchesFishSubCategory(product, subCategoryId) {
  if (!product) return false
  if (product.status === 'draft' || product.isActive === false) return false
  const fishSub = product.fishSubCategory || product.subCategory
  if (fishSub === subCategoryId) return true
  const cats = Array.isArray(product.categories)
    ? product.categories
    : Array.isArray(product.category)
    ? product.category
    : [product.category].filter(Boolean)
  return cats.includes(subCategoryId)
}

export function FishProductProvider({ children }) {
  const [fishProducts, setFishProducts] = useState(FISH_PRODUCT_SEED)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = readStoredFishProducts()
    if (stored && stored.length > 0) {
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
  const addFishProduct = useCallback(async (rawForm) => {
    const images = rawForm.images?.length
      ? rawForm.images.map((img) => img.preview || img.url || img)
      : []

    const subCat = rawForm.fishSubCategory || 'aquatic-life'

    const id =
      (rawForm.name || 'fish-product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

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
      categories: ['fish', subCat, ...(rawForm.tags || [])],
      subCategory: subCat,
      fishSubCategory: subCat,
      story: rawForm.story || '',
      tags: rawForm.tags || [],
      status: rawForm.status || 'active',
      isActive: rawForm.status !== 'draft' && rawForm.status !== 'out_of_stock',
      _createdAt: new Date().toISOString(),
      _source: 'admin-form',
    }

    setFishProducts((prev) => [product, ...prev])

    // Try posting to API so MongoDB backend persists it in live database too
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: product.name,
          tagline: product.shortDescription || product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          category: ['fish', subCat, ...(product.tags || [])],
          subCategory: subCat,
          packageCategory: 'fish',
          story: product.story,
          tags: product.tags,
          image: product.image,
          gallery: product.gallery,
          isActive: product.isActive,
        }),
      })
    } catch (e) {
      console.warn('API sync failed, saved locally:', e)
    }

    return product
  }, [])

  /** Update an existing fish product */
  const updateFishProduct = useCallback((id, rawForm) => {
    const images = rawForm.images?.length
      ? rawForm.images.map((img) => img.preview || img.url || img)
      : []

    const subCat = rawForm.fishSubCategory || 'aquatic-life'

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
              gallery: images.length > 1 ? images.slice(1) : ((p as any).gallery || []),
              subCategory: subCat,
              fishSubCategory: subCat,
              categories: ['fish', subCat, ...(rawForm.tags || p.tags || [])],
              story: rawForm.story ?? p.story,
              tags: rawForm.tags || p.tags,
              status: rawForm.status || (p as any).status || 'active',
              isActive: (rawForm.status || (p as any).status || 'active') !== 'draft' && (rawForm.status || (p as any).status || 'active') !== 'out_of_stock',
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
      fishProducts.filter((p) => matchesFishSubCategory(p, subCategoryId)),
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

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
  const stored = safeParse(localStorage.getItem(STORAGE_KEY), null)
  if (Array.isArray(stored)) {
    return stored.map((p) => {
      const subCat = p.fishSubCategory || p.subCategory || 'aquatic-life'
      if (subCat === 'aquatic-life' && !p.aquaticLifeType) {
        return {
          ...p,
          aquaticLifeType: 'betta-fish',
          tags: Array.from(new Set([...(p.tags || []), 'Betta Fish'])),
        }
      }
      return p
    })
  }
  return stored
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

const AQUATIC_LIFE_LABEL_MAP = {
  'betta-fish': 'Betta Fish',
  'shrimp': 'Shrimp',
  'crab': 'Crab',
  'pleco-fish': 'Pleco Fish',
}

/** Normalize an API product into the standard fish-product shape */
function normalizeApiProduct(p: any) {
  const cats = Array.isArray(p.category)
    ? p.category
    : Array.isArray(p.categories)
    ? p.categories
    : [p.category].filter(Boolean)
  const subCat =
    p.fishSubCategory ||
    p.subCategory ||
    cats.find((c) => c === 'aquariums' || c === 'aquatic-life') ||
    'aquatic-life'
  const aquaticLifeType =
    p.aquaticLifeType ||
    cats.find((c) => ['betta-fish', 'shrimp', 'crab', 'pleco-fish'].includes(c)) ||
    'betta-fish'
  const typeTag = AQUATIC_LIFE_LABEL_MAP[aquaticLifeType] || 'Betta Fish'
  const tags = Array.from(new Set([...(p.tags || []), typeTag]))

  return {
    id: p._id || p.id,
    _mongoId: p._id || null,
    name: p.name || '',
    price: Number(p.price) || 0,
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    description: p.description || '',
    shortDescription: p.shortDescription || p.tagline || '',
    image: p.image || p.thumbnail || '/assets/fishs.jpeg',
    gallery: p.gallery || [],
    category: 'fish',
    categories: ['fish', subCat, aquaticLifeType, typeTag, ...tags],
    subCategory: subCat,
    fishSubCategory: subCat,
    aquaticLifeType,
    story: p.story || '',
    tags,
    status: p.status || 'active',
    isActive: p.isActive !== false,
    _createdAt: p.createdAt || new Date().toISOString(),
    _source: 'api',
  }
}

/** Check if a product is a fish product */
function isFishProduct(p: any): boolean {
  const cats = Array.isArray(p.category)
    ? p.category
    : Array.isArray(p.categories)
    ? p.categories
    : [p.category].filter(Boolean)
  return (
    p.packageCategory === 'fish' ||
    p.category === 'fish' ||
    cats.includes('fish') ||
    cats.includes('aquariums') ||
    cats.includes('aquatic-life') ||
    !!p.fishSubCategory
  )
}

export function FishProductProvider({ children }) {
  const [fishProducts, setFishProducts] = useState(FISH_PRODUCT_SEED)
  const [isHydrated, setIsHydrated] = useState(false)
  const [apiFetched, setApiFetched] = useState(false)

  // ── Hydrate from localStorage on mount (client-side only) ─────────
  useEffect(() => {
    const stored = readStoredFishProducts()
    if (stored && stored.length > 0) {
      setFishProducts(stored)
    }
    setIsHydrated(true)
  }, [])

  // ── Fetch fish products from API on mount ─────────────────────────
  // The API (MongoDB) is the SOURCE OF TRUTH.
  // Whatever is in the DB is what should be shown — if the admin deleted
  // a product, it won't be in the API response (isActive = false).
  // If the admin added a product, it WILL be in the API response.
  useEffect(() => {
    let cancelled = false
    async function fetchApiFishProducts() {
      try {
        const res = await apiFetch('/api/products?limit=100')
        const data = (res.data as any) || {}
        if (cancelled || !data.products?.length) return

        const apiFish = (data.products as any[])
          .filter(isFishProduct)
          .map(normalizeApiProduct)

        // Build final product list:
        // API products are the source of truth.
        // Seed products are ONLY included if they don't conflict with API data.
        // Local-only products (not yet synced) are kept too.
        setFishProducts((prev) => {
          const map = new Map<string, any>()

          // 1. API products first (source of truth — keyed by name)
          apiFish.forEach((item) => {
            const key = item.name?.trim().toLowerCase()
            if (key) map.set(key, item)
          })

          // 2. Seed products only if NOT already in API (avoids duplicates)
          FISH_PRODUCT_SEED.forEach((item) => {
            const key = item.name?.trim().toLowerCase()
            if (key && !map.has(key)) map.set(key, item)
          })

          // 3. Local-only admin products (source = 'admin-form', not yet in API)
          prev
            .filter((item) => (item as any)._source === 'admin-form')
            .forEach((item) => {
              const key = item.name?.trim().toLowerCase()
              if (key && !map.has(key)) map.set(key, item)
            })

          return Array.from(map.values())
        })
        setApiFetched(true)
      } catch (err) {
        console.warn('FishProductContext: Failed to fetch API fish products.', err)
      }
    }

    fetchApiFishProducts()
    return () => { cancelled = true }
  }, [])

  // ── Persist to localStorage whenever products change AFTER hydration
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
    const aquaticLifeType = rawForm.aquaticLifeType || 'betta-fish'
    const typeTag = AQUATIC_LIFE_LABEL_MAP[aquaticLifeType] || 'Betta Fish'
    const tags = Array.from(new Set([...(rawForm.tags || []), typeTag]))

    const localId =
      (rawForm.name || 'fish-product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now()

    const product = {
      id: localId,
      _mongoId: null as string | null,
      name: rawForm.name || '',
      price: Number(rawForm.price) || 0,
      discountPrice: rawForm.discountPrice ? Number(rawForm.discountPrice) : null,
      description: rawForm.description || '',
      shortDescription: rawForm.shortDescription || '',
      image: images[0] || '/assets/fishs.jpeg',
      gallery: images.slice(1),
      category: 'fish',
      categories: ['fish', subCat, aquaticLifeType, typeTag, ...tags],
      subCategory: subCat,
      fishSubCategory: subCat,
      aquaticLifeType,
      story: rawForm.story || '',
      tags,
      status: rawForm.status || 'active',
      isActive: rawForm.status !== 'draft' && rawForm.status !== 'out_of_stock',
      _createdAt: new Date().toISOString(),
      _source: 'admin-form',
    }

    // Add to state immediately for instant UI feedback
    setFishProducts((prev) => [product, ...prev])

    // Post to API and capture the MongoDB _id from the response
    try {
      const apiRes = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: product.name,
          tagline: product.shortDescription || product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          category: ['fish', subCat, aquaticLifeType, ...tags],
          subCategory: subCat,
          packageCategory: 'fish',
          fishSubCategory: subCat,
          aquaticLifeType: aquaticLifeType,
          story: product.story,
          tags: product.tags,
          image: product.image,
          gallery: product.gallery,
          isActive: product.isActive,
        }),
      })

      // Update the local product with the MongoDB _id so delete works later
      const created = (apiRes.data as any)
      if (created?._id) {
        setFishProducts((prev) =>
          prev.map((p) =>
            p.id === localId
              ? { ...p, id: created._id, _mongoId: created._id, _source: 'api' }
              : p
          )
        )
        product.id = created._id
        product._mongoId = created._id
      }
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
    const aquaticLifeType = rawForm.aquaticLifeType || 'betta-fish'
    const typeTag = AQUATIC_LIFE_LABEL_MAP[aquaticLifeType] || 'Betta Fish'

    setFishProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const tags = Array.from(new Set([...(rawForm.tags || p.tags || []), typeTag]))
        const statusVal = rawForm.status || (p as any).status || 'active'
        return {
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
          aquaticLifeType,
          categories: ['fish', subCat, aquaticLifeType, typeTag, ...tags],
          story: rawForm.story ?? p.story,
          tags,
          status: statusVal,
          isActive: statusVal !== 'draft' && statusVal !== 'out_of_stock',
        }
      })
    )

    // Also update in MongoDB if we have the mongo ID
    try {
      apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: rawForm.name,
          price: Number(rawForm.price) || 0,
          discountPrice: rawForm.discountPrice ? Number(rawForm.discountPrice) : null,
          description: rawForm.description,
          shortDescription: rawForm.shortDescription,
          fishSubCategory: subCat,
          aquaticLifeType: aquaticLifeType,
          tags: rawForm.tags,
          story: rawForm.story,
          image: images[0] || undefined,
          gallery: images.length > 1 ? images.slice(1) : undefined,
          status: rawForm.status || 'active',
        }),
      }).catch(() => { /* best-effort */ })
    } catch { /* best-effort */ }
  }, [])

  /** Remove a fish product */
  const removeFishProduct = useCallback((id) => {
    // Find the product to get its _mongoId and name
    let mongoId = id
    let productName = ''
    setFishProducts((prev) => {
      const toDelete = prev.find((p) => p.id === id)
      if (toDelete) {
        mongoId = (toDelete as any)._mongoId || toDelete.id
        productName = toDelete.name || ''
      }
      return prev.filter((p) => p.id !== id)
    })

    // Delete from MongoDB using the correct MongoDB _id
    // Try the mongoId first, then try by slug name
    const tryDelete = async () => {
      try {
        await apiFetch(`/api/products/${mongoId}`, { method: 'DELETE' })
      } catch {
        // If that failed, try to find and delete by name
        if (productName) {
          try {
            const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            await apiFetch(`/api/products/${slug}`, { method: 'DELETE' })
          } catch { /* best-effort */ }
        }
      }
    }
    tryDelete()
  }, [])

  /** Get fish products by sub-category & optional aquatic life type filter */
  const getFishProductsBySubCategory = useCallback(
    (subCategoryId, aquaticLifeFilter = null) =>
      fishProducts.filter((p) => {
        if (!matchesFishSubCategory(p, subCategoryId)) return false
        if (subCategoryId === 'aquatic-life' && aquaticLifeFilter && aquaticLifeFilter !== 'all') {
          const typeKey = (p as any).aquaticLifeType || 'betta-fish'
          const typeLabel = AQUATIC_LIFE_LABEL_MAP[typeKey] || 'Betta Fish'
          const tags = p.tags || []
          const target = aquaticLifeFilter.toLowerCase()
          return (
            typeKey.toLowerCase() === target ||
            typeLabel.toLowerCase() === target ||
            typeLabel.toLowerCase().replace(/\s+/g, '-') === target ||
            (! (p as any).aquaticLifeType && (target === 'betta-fish' || target === 'betta fish')) ||
            tags.some(
              (t) =>
                t.toLowerCase() === target ||
                t.toLowerCase().replace(/\s+/g, '-') === target
            )
          )
        }
        return true
      }),
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

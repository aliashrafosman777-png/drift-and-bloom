import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FISH_PRODUCT_SEED } from '../data/products'
import { apiFetch } from '../lib/api'

const FishProductContext = createContext(null)
const STORAGE_KEY = 'db_fish_products_v1'
const DELETED_FISH_IDS_KEY = 'db_deleted_fish_ids_v1'

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function readDeletedFishIds() {
  if (typeof window === 'undefined') return []
  return safeParse(localStorage.getItem(DELETED_FISH_IDS_KEY), [])
}

function saveDeletedFishIds(ids) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DELETED_FISH_IDS_KEY, JSON.stringify(ids))
  } catch {}
}

function readStoredFishProducts() {
  if (typeof window === 'undefined') return null
  const stored = safeParse(localStorage.getItem(STORAGE_KEY), null)
  const deletedIds = readDeletedFishIds()
  if (Array.isArray(stored)) {
    return stored
      .filter((p) => !deletedIds.includes(String(p.id)) && !deletedIds.includes(String(p._id)))
      .map((p) => {
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

export function FishProductProvider({ children }) {
  const [fishProducts, setFishProducts] = useState(FISH_PRODUCT_SEED)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = readStoredFishProducts()
    const deletedIds = readDeletedFishIds()
    if (stored && stored.length > 0) {
      setFishProducts(stored)
    } else if (deletedIds.length > 0) {
      setFishProducts(FISH_PRODUCT_SEED.filter((p) => !deletedIds.includes(String(p.id))))
    }
    setIsHydrated(true)
  }, [])

  // Fetch fish products from API on mount
  useEffect(() => {
    let cancelled = false
    async function fetchApiFishProducts() {
      try {
        const res = await apiFetch('/api/products?limit=100')
        const data = (res.data as any) || {}
        if (cancelled || !data.products?.length) return
        const deletedIds = readDeletedFishIds()

        const apiFish = (data.products as any[])
          .filter((p) => {
            if (deletedIds.includes(String(p._id)) || deletedIds.includes(String(p.id))) return false
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
          })
          .map((p) => {
            const cats = Array.isArray(p.category)
              ? p.category
              : Array.isArray(p.categories)
              ? p.categories
              : [p.category].filter(Boolean)

            const subCat =
              p.fishSubCategory ||
              p.subCategory ||
              cats.find((c: string) => typeof c === 'string' && (c.toLowerCase() === 'aquariums' || c.toLowerCase() === 'aquatic-life')) ||
              'aquatic-life'

            // Robust case-insensitive aquaticLifeType matching
            const rawType = p.aquaticLifeType || ''
            let aquaticLifeType = 'betta-fish'
            if (rawType) {
              aquaticLifeType = rawType.toLowerCase().replace(/\s+/g, '-')
            } else {
              const foundCat = cats.find((c: string) =>
                typeof c === 'string' && ['betta-fish', 'betta fish', 'shrimp', 'crab', 'pleco-fish', 'pleco fish'].includes(c.toLowerCase())
              )
              if (foundCat) {
                aquaticLifeType = foundCat.toLowerCase().replace(/\s+/g, '-')
              } else {
                const foundTag = (p.tags || []).find((t: string) =>
                  typeof t === 'string' && ['betta-fish', 'betta fish', 'shrimp', 'crab', 'pleco-fish', 'pleco fish'].includes(t.toLowerCase())
                )
                if (foundTag) {
                  aquaticLifeType = foundTag.toLowerCase().replace(/\s+/g, '-')
                }
              }
            }

            const typeTag = AQUATIC_LIFE_LABEL_MAP[aquaticLifeType] || 'Betta Fish'
            const tags = Array.from(new Set([...(p.tags || []), typeTag]))

            return {
              id: p._id || p.id,
              _id: p._id || p.id,
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
          })

        if (apiFish.length > 0) {
          setFishProducts((prev) => {
            const map = new Map()
            const currentDeleted = readDeletedFishIds()
            // 1. Seed products
            FISH_PRODUCT_SEED.forEach((item) => {
              if (!currentDeleted.includes(String(item.id))) {
                if (item?.name) map.set(item.name.trim().toLowerCase(), item)
                else if (item?.id) map.set(item.id, item)
              }
            })
            // 2. Local storage products
            prev.forEach((item) => {
              if (!currentDeleted.includes(String(item.id)) && !currentDeleted.includes(String((item as any)._id))) {
                if (item?.name) map.set(item.name.trim().toLowerCase(), item)
                else if (item?.id) map.set(item.id, item)
              }
            })
            // 3. Server API products
            apiFish.forEach((item) => {
              if (!currentDeleted.includes(String(item.id)) && !currentDeleted.includes(String((item as any)._id))) {
                if (item?.name) map.set(item.name.trim().toLowerCase(), item)
                else if (item?.id) map.set(item.id, item)
              }
            })
            return Array.from(map.values())
          })
        }
      } catch (err) {
        console.warn('FishProductContext: Failed to fetch API fish products.', err)
      }
    }

    fetchApiFishProducts()
    return () => { cancelled = true }
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
    const aquaticLifeType = rawForm.aquaticLifeType || 'betta-fish'
    const typeTag = AQUATIC_LIFE_LABEL_MAP[aquaticLifeType] || 'Betta Fish'
    const tags = Array.from(new Set([...(rawForm.tags || []), typeTag]))

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
          category: ['fish', subCat, aquaticLifeType, typeTag, ...tags],
          subCategory: subCat,
          fishSubCategory: subCat,
          aquaticLifeType: aquaticLifeType,
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
  }, [])

  /** Remove a fish product persistently */
  const removeFishProduct = useCallback(async (id) => {
    const targetId = String(id)
    const currentDeleted = readDeletedFishIds()
    const updatedDeleted = Array.from(new Set([...currentDeleted, targetId]))
    saveDeletedFishIds(updatedDeleted)

    setFishProducts((prev) =>
      prev.filter((p) => String(p.id) !== targetId && String((p as any)._id) !== targetId)
    )

    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
    } catch (e) {
      console.warn('API delete failed, product removed locally:', e)
    }
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

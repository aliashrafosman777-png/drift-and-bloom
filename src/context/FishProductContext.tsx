'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import {
  AQUATIC_LIFE_LABELS,
  buildFishCategories,
  normalizeAquaticLifeType,
  normalizeFishSubCategory,
  safeProductImage,
  type AquaticLifeType,
  type FishSubCategory,
  type ProductStatus,
} from '@/lib/fishProducts'
import { useAuth } from '@/context/AuthContext'

const LEGACY_STORAGE_KEY = 'db_fish_products_v1'
const REFRESH_INTERVAL_MS = 60_000
const CHANNEL_NAME = 'db-fish-products-invalidations'

export type FishProduct = {
  id: string
  name: string
  price: number
  discountPrice: number | null
  description: string
  shortDescription: string
  image: string
  gallery: string[]
  category: 'fish'
  categories: string[]
  subCategory: FishSubCategory
  fishSubCategory: FishSubCategory
  aquaticLifeType: AquaticLifeType | null
  story: string
  tags: string[]
  status: ProductStatus
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
}

type FishForm = Record<string, any>

type FishProductContextValue = {
  fishProducts: FishProduct[]
  loading: boolean
  error: string | null
  refreshFishProducts: () => Promise<void>
  addFishProduct: (form: FishForm) => Promise<FishProduct>
  updateFishProduct: (id: string, form: FishForm) => Promise<FishProduct>
  removeFishProduct: (id: string) => Promise<void>
  getFishProductsBySubCategory: (
    subCategory: FishSubCategory,
    aquaticLifeType?: AquaticLifeType | 'all' | null,
  ) => FishProduct[]
  getAllFishProducts: () => FishProduct[]
}

const FishProductContext = createContext<FishProductContextValue | null>(null)

function normalizeApiProduct(raw: Record<string, any>): FishProduct {
  const categories = Array.isArray(raw.category)
    ? raw.category
    : Array.isArray(raw.categories)
      ? raw.categories
      : [raw.category].filter(Boolean)
  const fishSubCategory = normalizeFishSubCategory(
    raw.fishSubCategory || raw.subCategory,
    categories,
  )
  const aquaticLifeType = normalizeAquaticLifeType(
    raw.aquaticLifeType,
    categories,
    raw.tags,
  )

  if (!fishSubCategory) {
    throw new Error(`Product ${raw._id || raw.id || '(unknown)'} has no valid fish sub-category.`)
  }
  if (fishSubCategory === 'aquatic-life' && !aquaticLifeType) {
    throw new Error(`Product ${raw._id || raw.id || '(unknown)'} has no valid aquatic life type.`)
  }

  const id = String(raw._id || raw.id || '')
  if (!/^[0-9a-f]{24}$/i.test(id)) {
    throw new Error('The product API returned an unstable identifier.')
  }

  const status: ProductStatus = raw.status || (raw.isActive === false ? 'draft' : 'active')
  const typeLabel = aquaticLifeType ? AQUATIC_LIFE_LABELS[aquaticLifeType] : null
  const tags = Array.from(new Set([
    ...(Array.isArray(raw.tags) ? raw.tags : []),
    ...(typeLabel ? [typeLabel] : []),
  ]))

  return {
    id,
    name: String(raw.name || ''),
    price: Number(raw.price) || 0,
    discountPrice: raw.discountPrice == null ? null : Number(raw.discountPrice),
    description: String(raw.description || ''),
    shortDescription: String(raw.shortDescription || raw.tagline || ''),
    image: safeProductImage(raw.image),
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery.filter((value: unknown) => typeof value === 'string' && !/^data:/i.test(value))
      : [],
    category: 'fish',
    categories: buildFishCategories(fishSubCategory, aquaticLifeType),
    subCategory: fishSubCategory,
    fishSubCategory,
    aquaticLifeType: fishSubCategory === 'aquatic-life' ? aquaticLifeType : null,
    story: String(raw.story || ''),
    tags,
    status,
    isActive: raw.isActive !== false && status === 'active',
    version: Number.isInteger(raw.__v) ? raw.__v : Number(raw.version) || 0,
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
  }
}

async function persistImages(images: any[]): Promise<{ urls: string[]; publicIds: string[] }> {
  const persisted = await Promise.all((images || []).map(async (image) => {
    const file = image?.file instanceof File ? image.file : null
    if (file) {
      const body = new FormData()
      body.append('file', file)
      const response = await apiFetch<{
        url: string
        publicId: string
      }>('/api/upload', { method: 'POST', body })
      return { url: response.data.url, publicId: response.data.publicId }
    }

    const url = typeof image === 'string' ? image : image?.url || image?.preview
    if (typeof url !== 'string' || !url || /^data:/i.test(url)) {
      throw new Error('An image could not be saved to durable storage. Please select it again.')
    }
    return { url, publicId: image?.publicId || '' }
  }))

  return {
    urls: persisted.map((item) => item.url),
    publicIds: persisted.map((item) => item.publicId).filter(Boolean),
  }
}

function makePayload(form: FishForm, images: { urls: string[]; publicIds: string[] }) {
  const fishSubCategory = normalizeFishSubCategory(form.fishSubCategory)
  const aquaticLifeType = normalizeAquaticLifeType(form.aquaticLifeType)
  if (!fishSubCategory) throw new Error('Choose a valid fish sub-category.')
  if (fishSubCategory === 'aquatic-life' && !aquaticLifeType) {
    throw new Error('Choose a valid aquatic life type.')
  }

  const status = (form.status || 'active') as ProductStatus
  const typeLabel = aquaticLifeType ? AQUATIC_LIFE_LABELS[aquaticLifeType] : null
  const tags = Array.from(new Set([
    ...(Array.isArray(form.tags) ? form.tags : []),
    ...(typeLabel ? [typeLabel] : []),
  ]))

  return {
    name: String(form.name || '').trim(),
    tagline: String(form.shortDescription || form.name || '').trim(),
    shortDescription: String(form.shortDescription || '').trim(),
    description: String(form.description || '').trim(),
    price: Number(form.price),
    discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
    category: buildFishCategories(fishSubCategory, aquaticLifeType),
    subCategory: fishSubCategory,
    packageCategory: 'fish',
    fishSubCategory,
    aquaticLifeType: fishSubCategory === 'aquatic-life' ? aquaticLifeType : '',
    story: String(form.story || '').trim(),
    tags,
    image: images.urls[0] || '',
    thumbnail: images.urls[0] || '',
    images: images.urls,
    gallery: images.urls.slice(1),
    imagePublicIds: images.publicIds,
    status,
    isActive: status === 'active',
  }
}

export function FishProductProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAdmin, loading: authLoading } = useAuth()
  const isAdminView = pathname.startsWith('/admin')
  const [fishProducts, setFishProducts] = useState<FishProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestSequence = useRef(0)

  const refreshFishProducts = useCallback(async () => {
    if (authLoading || (isAdminView && !isAdmin)) return
    const sequence = ++requestSequence.current
    setLoading(true)
    try {
      const query = new URLSearchParams({
        packageCategory: 'fish',
        limit: '100',
        sort: 'newest',
      })
      if (isAdminView) query.set('includeInactive', 'true')

      const response = await apiFetch<{
        products: Record<string, unknown>[]
      }>(`/api/products?${query.toString()}`, { cache: 'no-store' })
      const products = response.data.products.map(normalizeApiProduct)
      if (sequence === requestSequence.current) {
        setFishProducts(products)
        setError(null)
      }
    } catch (cause) {
      if (sequence === requestSequence.current) {
        setFishProducts([])
        setError(cause instanceof Error ? cause.message : 'Failed to load fish products.')
      }
    } finally {
      if (sequence === requestSequence.current) setLoading(false)
    }
  }, [authLoading, isAdmin, isAdminView])

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // The legacy cache is ignored even when storage is unavailable.
    }
  }, [])

  useEffect(() => {
    void refreshFishProducts()
  }, [refreshFishProducts])

  useEffect(() => {
    const handleFocus = () => void refreshFishProducts()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refreshFishProducts()
    }
    const interval = window.setInterval(handleFocus, REFRESH_INTERVAL_MS)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshFishProducts])

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = () => void refreshFishProducts()
    return () => channel.close()
  }, [refreshFishProducts])

  const announceMutation = useCallback(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ changedAt: Date.now() })
    channel.close()
  }, [])

  const addFishProduct = useCallback(async (form: FishForm) => {
    const images = await persistImages(form.images || [])
    const response = await apiFetch<Record<string, unknown>>('/api/products', {
      method: 'POST',
      cache: 'no-store',
      body: JSON.stringify(makePayload(form, images)),
    })
    const created = normalizeApiProduct(response.data)
    setFishProducts((current) => [created, ...current.filter((item) => item.id !== created.id)])
    announceMutation()
    await refreshFishProducts()
    return created
  }, [announceMutation, refreshFishProducts])

  const updateFishProduct = useCallback(async (id: string, form: FishForm) => {
    const current = fishProducts.find((product) => product.id === id)
    if (!current) throw new Error('This product is no longer available. Reload and try again.')

    const images = await persistImages(form.images || [])
    try {
      const response = await apiFetch<Record<string, unknown>>(`/api/products/${id}`, {
        method: 'PUT',
        cache: 'no-store',
        body: JSON.stringify({ ...makePayload(form, images), version: current.version }),
      })
      const updated = normalizeApiProduct(response.data)
      setFishProducts((products) => products.map((product) => product.id === id ? updated : product))
      announceMutation()
      await refreshFishProducts()
      return updated
    } catch (cause) {
      await refreshFishProducts()
      throw cause
    }
  }, [announceMutation, fishProducts, refreshFishProducts])

  const removeFishProduct = useCallback(async (id: string) => {
    const current = fishProducts.find((product) => product.id === id)
    if (!current) throw new Error('This product is no longer available. Reload and try again.')

    try {
      await apiFetch(`/api/products/${id}?version=${current.version}`, {
        method: 'DELETE',
        cache: 'no-store',
      })
      setFishProducts((products) => products.filter((product) => product.id !== id))
      announceMutation()
      await refreshFishProducts()
    } catch (cause) {
      await refreshFishProducts()
      throw cause
    }
  }, [announceMutation, fishProducts, refreshFishProducts])

  const getFishProductsBySubCategory = useCallback((
    subCategory: FishSubCategory,
    aquaticLifeType: AquaticLifeType | 'all' | null = null,
  ) => fishProducts.filter((product) => {
    if (!product.isActive || product.status !== 'active') return false
    if (product.fishSubCategory !== subCategory) return false
    return (
      subCategory !== 'aquatic-life' ||
      !aquaticLifeType ||
      aquaticLifeType === 'all' ||
      product.aquaticLifeType === aquaticLifeType
    )
  }), [fishProducts])

  const getAllFishProducts = useCallback(() => fishProducts, [fishProducts])

  const value = useMemo<FishProductContextValue>(() => ({
    fishProducts,
    loading,
    error,
    refreshFishProducts,
    addFishProduct,
    updateFishProduct,
    removeFishProduct,
    getFishProductsBySubCategory,
    getAllFishProducts,
  }), [
    fishProducts,
    loading,
    error,
    refreshFishProducts,
    addFishProduct,
    updateFishProduct,
    removeFishProduct,
    getFishProductsBySubCategory,
    getAllFishProducts,
  ])

  return <FishProductContext.Provider value={value}>{children}</FishProductContext.Provider>
}

export function useFishProducts() {
  const context = useContext(FishProductContext)
  if (!context) throw new Error('useFishProducts must be used within a FishProductProvider')
  return context
}

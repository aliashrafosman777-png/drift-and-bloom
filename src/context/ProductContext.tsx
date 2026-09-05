"use client"

/**
 * Database-backed source of truth for predefined packages.
 *
 * Fish and Candle/Plant builder items have their own focused contexts, but all
 * predefined package reads and mutations go through the same MongoDB products
 * API. Browser storage is deliberately ignored and is only cleared as legacy
 * cleanup.
 */

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
import { BEST_SELLER_CATEGORY_ID } from '@/data/products'
import {
  cleanupUploadedProductImages,
  persistProductImages,
} from '@/lib/clientProductImages'
import type { PersistedProductImages, ProductImageInput } from '@/lib/clientProductImages'
import { useAuth } from '@/context/AuthContext'
import { effectiveProductPrice } from '@/lib/productPricing'

const PACKAGE_FALLBACK_IMAGE = '/assets/package.png'
const LEGACY_STORAGE_KEY = 'db_custom_products_v1'
const REFRESH_INTERVAL_MS = 60_000
const CHANNEL_NAME = 'db-package-products-invalidations'

export type PackageStatus = 'active' | 'draft' | 'out_of_stock'

export type PackagePlantOption = {
  name: string
  petFriendly?: boolean
  note?: string
}

export type PackageProduct = {
  _id: string
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  price: number
  effectivePrice: number
  discountPrice: number | null
  stock: number
  sku: string
  rating: number
  reviews: number
  categories: string[]
  category: string
  bestSeller: boolean
  isBestSeller?: boolean
  best_seller?: boolean
  image: string
  thumbnail?: string
  images: string[]
  gallery: string[]
  imagePublicIds: string[]
  tags: string[]
  mood: string[]
  includes: string[]
  plantOptions: PackagePlantOption[]
  status: PackageStatus
  isActive: boolean
  version: number
  collection: string
  size: string
  difficulty: string
  light: string
  watering: string
  petFriendly: boolean
  airPurifying: boolean
  scent: string
}

export type PackageProductForm = {
  name: string
  tagline: string
  description: string
  categories: string[]
  bestSeller?: boolean
  collection: string
  price: string | number
  discountPrice: string | number | null
  stock: string | number
  sku: string
  status: PackageStatus
  size: string
  difficulty: string
  light: string
  watering: string
  petFriendly: boolean
  airPurifying: boolean
  tags: string[]
  scent: string
  images?: ProductImageInput[]
}

type ProductContextValue = {
  products: PackageProduct[]
  loading: boolean
  ready: boolean
  error: string | null
  refreshProducts: () => Promise<void>
  addProduct: (form: PackageProductForm) => Promise<PackageProduct>
  updateProduct: (id: string, form: PackageProductForm) => Promise<PackageProduct>
  removeProduct: (id: string) => Promise<void>
  getProductById: (id: string) => PackageProduct | null
  getRelatedProducts: (id: string, count?: number) => PackageProduct[]
}

const ProductContext = createContext<ProductContextValue | null>(null)

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

function normalizePlantOptions(value: unknown): PackagePlantOption[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const option = item as Record<string, unknown>
    if (typeof option.name !== 'string' || !option.name.trim()) return []
    return [{
      name: option.name,
      petFriendly: Boolean(option.petFriendly),
      note: typeof option.note === 'string' ? option.note : undefined,
    }]
  })
}

function normalizeStatus(value: unknown, isActive: unknown): PackageStatus {
  if (value === 'active' || value === 'draft' || value === 'out_of_stock') return value
  return isActive === false ? 'draft' : 'active'
}

function normalizeProduct(value: unknown): PackageProduct {
  if (!value || typeof value !== 'object') {
    throw new Error('The product API returned an empty product.')
  }
  const raw = value as Record<string, unknown>

  const id = String(raw._id || raw.id || '')
  if (!/^[0-9a-f]{24}$/i.test(id)) {
    throw new Error('The product API returned an unstable package identifier.')
  }

  const categories = stringArray(raw.category || raw.categories)
  const status = normalizeStatus(raw.status, raw.isActive)
  const price = Number(raw.price) || 0
  const discountPrice = raw.discountPrice == null ? null : Number(raw.discountPrice)
  const images = stringArray(raw.images).filter((value) => !/^data:/i.test(value))
  const gallery = stringArray(raw.gallery).filter((value) => !/^data:/i.test(value))
  const image = typeof raw.image === 'string' && raw.image && !/^data:/i.test(raw.image)
    ? raw.image
    : images[0] || PACKAGE_FALLBACK_IMAGE

  return {
    _id: id,
    id,
    slug: String(raw.slug || ''),
    name: String(raw.name || ''),
    tagline: String(raw.tagline || raw.shortDescription || ''),
    description: String(raw.description || ''),
    price,
    effectivePrice: effectiveProductPrice(price, discountPrice),
    discountPrice,
    stock: Number(raw.stock) || 0,
    sku: String(raw.sku || ''),
    rating: Number(raw.rating) || 0,
    reviews: Number(raw.reviewsCount ?? raw.reviews) || 0,
    categories,
    category: categories[0] || '',
    bestSeller: Boolean(raw.bestSeller || categories.includes(BEST_SELLER_CATEGORY_ID)),
    image,
    images: images.length ? images : [image, ...gallery].filter(Boolean),
    gallery,
    imagePublicIds: stringArray(raw.imagePublicIds),
    tags: stringArray(raw.tags),
    mood: stringArray(raw.mood),
    includes: stringArray(raw.includes),
    plantOptions: normalizePlantOptions(raw.plantOptions),
    status,
    isActive: raw.isActive !== false && status === 'active',
    version: Number.isInteger(raw.__v) ? Number(raw.__v) : Number(raw.version) || 0,
    collection: String(raw.packageCollection || raw.slug || ''),
    size: String(raw.size || 'medium'),
    difficulty: String(raw.difficulty || 'beginner'),
    light: String(raw.light || 'medium'),
    watering: String(raw.watering || 'weekly'),
    petFriendly: Boolean(raw.petFriendly),
    airPurifying: Boolean(raw.airPurifying),
    scent: String(raw.scent || ''),
  }
}

function buildProductPayload(
  form: PackageProductForm,
  images: PersistedProductImages,
): Record<string, unknown> {
  const categories = stringArray(form.categories)
  const status = form.status || 'active'
  return {
    name: String(form.name || '').trim(),
    tagline: String(form.tagline || '').trim(),
    description: String(form.description || '').trim(),
    price: Number(form.price),
    discountPrice: form.discountPrice === '' || form.discountPrice == null
      ? null
      : Number(form.discountPrice),
    stock: Number(form.stock) || 0,
    sku: String(form.sku || '').trim(),
    category: categories.length ? categories : ['calm'],
    bestSeller: Boolean(form.bestSeller || categories.includes(BEST_SELLER_CATEGORY_ID)),
    scent: String(form.scent || '').trim(),
    tags: stringArray(form.tags),
    image: images.urls[0] || '',
    thumbnail: images.urls[0] || '',
    images: images.urls,
    gallery: images.urls.slice(1),
    imagePublicIds: images.publicIds,
    status,
    isActive: status === 'active',
    packageCollection: String(form.collection || '').trim(),
    size: String(form.size || 'medium'),
    difficulty: String(form.difficulty || 'beginner'),
    light: String(form.light || 'medium'),
    watering: String(form.watering || 'weekly'),
    petFriendly: Boolean(form.petFriendly),
    airPurifying: Boolean(form.airPurifying),
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAdmin, loading: authLoading } = useAuth()
  const isAdminView = pathname.startsWith('/admin')
  const isPackageView = pathname === '/' ||
    pathname === '/find-your-soul' ||
    pathname.startsWith('/packages') ||
    pathname === '/admin/products'
  const [products, setProducts] = useState<PackageProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestSequence = useRef(0)

  const refreshProducts = useCallback(async () => {
    if (!isPackageView) {
      setLoading(false)
      setReady(false)
      setError(null)
      return
    }
    if (authLoading || (isAdminView && !isAdmin)) return

    const sequence = ++requestSequence.current
    setLoading(true)
    try {
      const query = new URLSearchParams({
        limit: '100',
        sort: 'newest',
        excludePackageCategory: 'fish',
        excludeProductType: 'builder',
      })
      if (isAdminView) query.set('includeInactive', 'true')

      const response = await apiFetch<{ products: unknown[] }>(`/api/products?${query.toString()}`, { cache: 'no-store' })
      const nextProducts = response.data.products.map(normalizeProduct)
      if (sequence === requestSequence.current) {
        setProducts(nextProducts)
        setError(null)
      }
    } catch (cause) {
      if (sequence === requestSequence.current) {
        setProducts([])
        setError(cause instanceof Error ? cause.message : 'Failed to load packages.')
      }
    } finally {
      if (sequence === requestSequence.current) {
        setLoading(false)
        setReady(true)
      }
    }
  }, [authLoading, isAdmin, isAdminView, isPackageView])

  useEffect(() => {
    try { window.localStorage.removeItem(LEGACY_STORAGE_KEY) } catch { /* legacy data is ignored */ }
  }, [])

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refreshProducts(), 0)
    return () => window.clearTimeout(initialRefresh)
  }, [refreshProducts])

  useEffect(() => {
    if (!isPackageView) return
    const refresh = () => void refreshProducts()
    const visibility = () => { if (document.visibilityState === 'visible') refresh() }
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [isPackageView, refreshProducts])

  useEffect(() => {
    if (!isPackageView || !('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = () => void refreshProducts()
    return () => channel.close()
  }, [isPackageView, refreshProducts])

  const announceMutation = useCallback(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ changedAt: Date.now() })
    channel.close()
  }, [])

  const addProduct = useCallback(async (rawForm: PackageProductForm) => {
    const images = await persistProductImages(rawForm.images || [])
    try {
      const response = await apiFetch<unknown>('/api/products', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify(buildProductPayload(rawForm, images)),
      })
      const created = normalizeProduct(response.data)
      setProducts((current) => [created, ...current.filter((item) => item.id !== created.id)])
      announceMutation()
      await refreshProducts()
      return created
    } catch (cause) {
      await cleanupUploadedProductImages(images.uploadedPublicIds)
      throw cause
    }
  }, [announceMutation, refreshProducts])

  const updateProduct = useCallback(async (id: string, rawForm: PackageProductForm) => {
    const current = products.find((product) => product.id === id)
    if (!current) throw new Error('This package is no longer available. Reload and try again.')

    const images = await persistProductImages(rawForm.images || [])
    try {
      const response = await apiFetch<unknown>(`/api/products/${id}`, {
        method: 'PUT',
        cache: 'no-store',
        body: JSON.stringify({
          ...buildProductPayload(rawForm, images),
          version: current.version,
        }),
      })
      const updated = normalizeProduct(response.data)
      setProducts((items) => items.map((item) => item.id === id ? updated : item))
      announceMutation()
      await refreshProducts()
      return updated
    } catch (cause) {
      await cleanupUploadedProductImages(images.uploadedPublicIds)
      await refreshProducts()
      throw cause
    }
  }, [announceMutation, products, refreshProducts])

  const removeProduct = useCallback(async (id: string) => {
    const current = products.find((product) => product.id === id)
    if (!current) throw new Error('This package is no longer available. Reload and try again.')

    try {
      await apiFetch(`/api/products/${id}?version=${current.version}`, {
        method: 'DELETE',
        cache: 'no-store',
      })
      setProducts((items) => items.filter((item) => item.id !== id))
      announceMutation()
      await refreshProducts()
    } catch (cause) {
      await refreshProducts()
      throw cause
    }
  }, [announceMutation, products, refreshProducts])

  const getProductById = useCallback(
    (id: string) => products.find((product) => (
      product.id === id || product._id === id || product.slug === id
    )) || null,
    [products],
  )

  const getRelatedProducts = useCallback(
    (id: string, count = 5) => products.filter((product) => (
      product.id !== id && product._id !== id && product.slug !== id
    )).slice(0, count),
    [products],
  )

  const value = useMemo(() => ({
    products,
    loading,
    ready,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    removeProduct,
    getProductById,
    getRelatedProducts,
  }), [
    products,
    loading,
    ready,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    removeProduct,
    getProductById,
    getRelatedProducts,
  ])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts must be used within a ProductProvider')
  return context
}

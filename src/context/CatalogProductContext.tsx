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
  buildCatalogCategories,
  effectiveCatalogPrice,
  normalizeCandleCategory,
  normalizeCatalogProductType,
  safeCatalogProductImage,
  type CandleCategory,
  type CatalogProductType,
} from '@/lib/catalogProducts'
import type { ProductStatus } from '@/lib/fishProducts'
import {
  cleanupUploadedProductImages,
  persistProductImages,
  type ProductImageInput,
} from '@/lib/clientProductImages'
import { useAuth } from '@/context/AuthContext'

const REFRESH_INTERVAL_MS = 60_000
const CHANNEL_NAME = 'db-catalog-products-invalidations'
const LEGACY_STORAGE_KEYS = ['db_candle_products_v1', 'db_plant_products_v1', 'db_builder_products_v1']

export type CatalogProduct = {
  id: string
  name: string
  price: number
  effectivePrice: number
  discountPrice: number | null
  description: string
  shortDescription: string
  story: string
  image: string
  gallery: string[]
  imagePublicIds: string[]
  categories: string[]
  productType: CatalogProductType
  candleCategory: CandleCategory | null
  tags: string[]
  status: ProductStatus
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export type CatalogBuilderProduct = CatalogProduct & {
  category: CatalogProductType
  listPrice: number
  price: number
}

export type CatalogProductForm = {
  name: string
  shortDescription: string
  description: string
  story: string
  productType: CatalogProductType | ''
  candleCategory: CandleCategory | ''
  price: string | number
  discountPrice: string | number | ''
  tags: string[]
  status: ProductStatus
  images: ProductImageInput[]
}

type CatalogProductContextValue = {
  catalogProducts: CatalogProduct[]
  loading: boolean
  error: string | null
  refreshCatalogProducts: () => Promise<void>
  addCatalogProduct: (form: CatalogProductForm) => Promise<CatalogProduct>
  updateCatalogProduct: (id: string, form: CatalogProductForm) => Promise<CatalogProduct>
  removeCatalogProduct: (id: string) => Promise<void>
  getBuilderProductsByType: (productType: CatalogProductType) => CatalogBuilderProduct[]
}

const CatalogProductContext = createContext<CatalogProductContextValue | null>(null)

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function normalizeApiProduct(raw: Record<string, unknown>): CatalogProduct {
  const productType = normalizeCatalogProductType(raw.productType || raw.packageCategory)
  if (!productType) throw new Error(`Product ${raw._id || raw.id || '(unknown)'} has no valid product type.`)

  const categories = stringArray(raw.category || raw.categories)
  const candleCategory = normalizeCandleCategory(raw.candleCategory || raw.subCategory, categories)
  if (productType === 'candles' && !candleCategory) {
    throw new Error(`Product ${raw._id || raw.id || '(unknown)'} has no valid candle category.`)
  }

  const id = String(raw._id || raw.id || '')
  if (!/^[0-9a-f]{24}$/i.test(id)) throw new Error('The product API returned an unstable identifier.')

  const price = Number(raw.price) || 0
  const discountPrice = raw.discountPrice == null ? null : Number(raw.discountPrice)
  const status = (raw.status || (raw.isActive === false ? 'draft' : 'active')) as ProductStatus

  return {
    id,
    name: String(raw.name || ''),
    price,
    effectivePrice: effectiveCatalogPrice(price, discountPrice),
    discountPrice,
    description: String(raw.description || ''),
    shortDescription: String(raw.shortDescription || raw.tagline || ''),
    story: String(raw.story || ''),
    image: safeCatalogProductImage(raw.image, productType),
    gallery: stringArray(raw.gallery).filter((value) => !/^data:/i.test(value)),
    imagePublicIds: stringArray(raw.imagePublicIds),
    categories: buildCatalogCategories(productType, candleCategory),
    productType,
    candleCategory: productType === 'candles' ? candleCategory : null,
    tags: stringArray(raw.tags),
    status,
    isActive: raw.isActive !== false && status === 'active',
    version: Number.isInteger(raw.__v) ? Number(raw.__v) : Number(raw.version) || 0,
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
  }
}

function makePayload(form: CatalogProductForm, images: Awaited<ReturnType<typeof persistProductImages>>) {
  const productType = normalizeCatalogProductType(form.productType)
  const candleCategory = normalizeCandleCategory(form.candleCategory)
  if (!productType) throw new Error('Choose Candles or Plants as the product type.')
  if (productType === 'candles' && !candleCategory) {
    throw new Error('Choose Essential, Signature, or Art as the candle category.')
  }

  const price = Number(form.price)
  const discountPrice = form.discountPrice === '' ? null : Number(form.discountPrice)
  return {
    name: form.name.trim(),
    tagline: form.shortDescription.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    story: form.story.trim(),
    price,
    discountPrice,
    category: buildCatalogCategories(productType, candleCategory),
    subCategory: productType === 'candles' ? candleCategory : '',
    packageCategory: productType,
    productType,
    candleCategory: productType === 'candles' ? candleCategory : '',
    tags: form.tags,
    image: images.urls[0] || '',
    thumbnail: images.urls[0] || '',
    images: images.urls,
    gallery: images.urls.slice(1),
    imagePublicIds: images.publicIds,
    status: form.status,
    isActive: form.status === 'active',
  }
}

export function CatalogProductProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAdmin, loading: authLoading } = useAuth()
  const isAdminView = pathname.startsWith('/admin')
  const isCatalogView = pathname === '/build-your-package' ||
    pathname === '/build-package' ||
    pathname === '/admin/candles-plants'
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestSequence = useRef(0)

  const refreshCatalogProducts = useCallback(async () => {
    if (!isCatalogView) {
      setLoading(false)
      setError(null)
      return
    }
    if (authLoading || (isAdminView && !isAdmin)) return
    const sequence = ++requestSequence.current
    setLoading(true)
    try {
      const query = new URLSearchParams({ productType: 'builder', limit: '100', sort: 'newest' })
      if (isAdminView) query.set('includeInactive', 'true')
      const response = await apiFetch<{ products: Record<string, unknown>[] }>(
        `/api/products?${query.toString()}`,
        { cache: 'no-store' },
      )
      const products = response.data.products.map(normalizeApiProduct)
      if (sequence === requestSequence.current) {
        setCatalogProducts(products)
        setError(null)
      }
    } catch (cause) {
      if (sequence === requestSequence.current) {
        setCatalogProducts([])
        setError(cause instanceof Error ? cause.message : 'Failed to load Candles and Plants.')
      }
    } finally {
      if (sequence === requestSequence.current) setLoading(false)
    }
  }, [authLoading, isAdmin, isAdminView, isCatalogView])

  useEffect(() => {
    for (const key of LEGACY_STORAGE_KEYS) {
      try { window.localStorage.removeItem(key) } catch { /* legacy data is always ignored */ }
    }
  }, [])

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refreshCatalogProducts(), 0)
    return () => window.clearTimeout(initialRefresh)
  }, [refreshCatalogProducts])

  useEffect(() => {
    if (!isCatalogView) return
    const refresh = () => void refreshCatalogProducts()
    const visibility = () => { if (document.visibilityState === 'visible') refresh() }
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [isCatalogView, refreshCatalogProducts])

  useEffect(() => {
    if (!isCatalogView) return
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = () => void refreshCatalogProducts()
    return () => channel.close()
  }, [isCatalogView, refreshCatalogProducts])

  const announceMutation = useCallback(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ changedAt: Date.now() })
    channel.close()
  }, [])

  const addCatalogProduct = useCallback(async (form: CatalogProductForm) => {
    const images = await persistProductImages(form.images)
    try {
      const response = await apiFetch<Record<string, unknown>>('/api/products', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify(makePayload(form, images)),
      })
      const created = normalizeApiProduct(response.data)
      setCatalogProducts((current) => [created, ...current.filter((item) => item.id !== created.id)])
      announceMutation()
      await refreshCatalogProducts()
      return created
    } catch (cause) {
      await cleanupUploadedProductImages(images.uploadedPublicIds)
      throw cause
    }
  }, [announceMutation, refreshCatalogProducts])

  const updateCatalogProduct = useCallback(async (id: string, form: CatalogProductForm) => {
    const current = catalogProducts.find((product) => product.id === id)
    if (!current) throw new Error('This product is no longer available. Reload and try again.')

    const images = await persistProductImages(form.images)
    try {
      const response = await apiFetch<Record<string, unknown>>(`/api/products/${id}`, {
        method: 'PUT',
        cache: 'no-store',
        body: JSON.stringify({ ...makePayload(form, images), version: current.version }),
      })
      const updated = normalizeApiProduct(response.data)
      setCatalogProducts((products) => products.map((product) => product.id === id ? updated : product))
      announceMutation()
      await refreshCatalogProducts()
      return updated
    } catch (cause) {
      await cleanupUploadedProductImages(images.uploadedPublicIds)
      await refreshCatalogProducts()
      throw cause
    }
  }, [announceMutation, catalogProducts, refreshCatalogProducts])

  const removeCatalogProduct = useCallback(async (id: string) => {
    const current = catalogProducts.find((product) => product.id === id)
    if (!current) throw new Error('This product is no longer available. Reload and try again.')
    try {
      await apiFetch(`/api/products/${id}?version=${current.version}`, { method: 'DELETE', cache: 'no-store' })
      setCatalogProducts((products) => products.filter((product) => product.id !== id))
      announceMutation()
      await refreshCatalogProducts()
    } catch (cause) {
      await refreshCatalogProducts()
      throw cause
    }
  }, [announceMutation, catalogProducts, refreshCatalogProducts])

  const getBuilderProductsByType = useCallback((productType: CatalogProductType) => (
    catalogProducts
      .filter((product) => product.productType === productType && product.isActive && product.status === 'active')
      .map((product) => ({
        ...product,
        category: product.productType,
        listPrice: product.price,
        price: product.effectivePrice,
      }))
  ), [catalogProducts])

  const value = useMemo<CatalogProductContextValue>(() => ({
    catalogProducts,
    loading,
    error,
    refreshCatalogProducts,
    addCatalogProduct,
    updateCatalogProduct,
    removeCatalogProduct,
    getBuilderProductsByType,
  }), [
    catalogProducts,
    loading,
    error,
    refreshCatalogProducts,
    addCatalogProduct,
    updateCatalogProduct,
    removeCatalogProduct,
    getBuilderProductsByType,
  ])

  return <CatalogProductContext.Provider value={value}>{children}</CatalogProductContext.Provider>
}

export function useCatalogProducts() {
  const context = useContext(CatalogProductContext)
  if (!context) throw new Error('useCatalogProducts must be used within a CatalogProductProvider')
  return context
}

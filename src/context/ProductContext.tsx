// @ts-nocheck
"use client"

/**
 * ProductContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the product catalog. Now backed by the
 * /api/products API route with MongoDB.
 *
 * Falls back to local seed data if the API is unreachable (e.g. no MongoDB
 * connection configured yet) so the frontend always works.
 */

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import { BEST_SELLER_CATEGORY_ID, products as SEED } from '../data/products'

const packageFallbackImage = "/assets/package.png"

const ProductContext = createContext(null)

/**
 * Normalize a DB product into the shape the frontend expects.
 * Adds backward-compatible aliases (id, categories, reviews).
 */
function normalizeProduct(p) {
  if (!p) return p
  return {
    ...p,
    id: p._id || p.id || p.slug,
    categories: p.category || p.categories || [],
    reviews: p.reviewsCount ?? p.reviews ?? 0,
    bestSeller: p.bestSeller || (p.category || []).includes(BEST_SELLER_CATEGORY_ID),
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(SEED)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  /* ── Fetch products from API on mount ───────────────────────────────── */
  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      try {
        setLoading(true)
        const res = await apiFetch('/api/products?limit=100')
        if (!cancelled && res.data?.products?.length > 0) {
          setProducts(res.data.products.map(normalizeProduct))
        }
        // If API returns empty, keep SEED data (DB not seeded yet)
      } catch (err) {
        console.warn('ProductContext: API fetch failed, using seed data.', err)
        // Keep SEED data as fallback — frontend still works without backend
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [])

  /* ── CRUD helpers ──────────────────────────────────────────────────── */

  /** Add a new product via API and return it. */
  const addProduct = useCallback(async (rawForm) => {
    try {
      const formData = buildProductPayload(rawForm)
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      const product = normalizeProduct(res.data)
      setProducts((prev) => [product, ...prev])
      return product
    } catch (err) {
      // Fallback: local-only add for demo
      const id =
        (rawForm.name || 'product')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now()
      const product = buildLocalProduct(id, rawForm)
      setProducts((prev) => [product, ...prev])
      return product
    }
  }, [])

  /** Update an existing product via API. */
  const updateProduct = useCallback(async (id, rawForm) => {
    try {
      const formData = buildProductPayload(rawForm)
      const res = await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      })
      const updated = normalizeProduct(res.data)
      setProducts((prev) =>
        prev.map((p) => (p.id === id || p._id === id ? { ...p, ...updated } : p))
      )
    } catch {
      // Fallback: local-only update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...buildLocalProduct(id, rawForm) } : p))
      )
    }
  }, [])

  /** Delete a product via API. */
  const removeProduct = useCallback(async (id) => {
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
    } catch {
      // proceed with local removal anyway
    }
    setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id))
  }, [])

  /** Find a single product by id from live state. */
  const getProductById = useCallback(
    (id) => products.find((p) => p.id === id || p._id === id || p.slug === id) || null,
    [products]
  )

  /** Get N related products excluding the given id. */
  const getRelatedProducts = useCallback(
    (id, count = 5) =>
      products.filter((p) => p.id !== id && p._id !== id).slice(0, count),
    [products]
  )

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      addProduct,
      updateProduct,
      removeProduct,
      getProductById,
      getRelatedProducts,
    }),
    [products, loading, error, addProduct, updateProduct, removeProduct, getProductById, getRelatedProducts]
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductProvider')
  return ctx
}

/* ── Internal helpers ────────────────────────────────────────────────────── */

/**
 * Build a product payload for the API from the admin form data.
 */
function buildProductPayload(form) {
  const images =
    form.images?.length
      ? form.images.map((img) => img.preview || img.url || img)
      : []

  return {
    name:        form.name        || '',
    tagline:     form.tagline     || '',
    description: form.description || '',
    price:       Number(form.price)         || 0,
    discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
    rating:      Number(form.rating)        || 5,
    sku:         form.sku         || '',
    stock:       Number(form.stock)         || 0,
    category:    form.categories  || ['calm'],
    bestSeller:  Boolean(form.bestSeller || form.categories?.includes(BEST_SELLER_CATEGORY_ID)),
    mood:        form.mood        || [],
    scent:       form.scent       || '',
    tags:        form.tags        || [],
    includes:    ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [],
    image:       images[0] || packageFallbackImage,
    gallery:     images.slice(1),
    images:      images,
    isActive:    form.status !== 'draft' && form.status !== 'out_of_stock',
  }
}

/**
 * Local-only product builder (fallback when API is unreachable).
 */
function buildLocalProduct(id, form) {
  const images =
    form.images?.length
      ? form.images.map((img) => img.preview || img.url)
      : []
  const mainImage = images[0] || packageFallbackImage

  return {
    id,
    name:        form.name        || '',
    tagline:     form.tagline     || '',
    description: form.description || '',
    price:       Number(form.price)         || 0,
    discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
    rating:      Number(form.rating)        || 5,
    reviews:     0,
    sku:         form.sku         || '',
    stock:       Number(form.stock)         || 0,
    status:      form.status      || 'active',
    categories:  form.categories  || ['calm'],
    bestSeller:  Boolean(form.bestSeller || form.categories?.includes(BEST_SELLER_CATEGORY_ID)),
    mood:        form.mood        || [],
    scent:       form.scent       || '—',
    tags:        form.tags        || [],
    includes:    ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [],
    image:       mainImage,
    gallery:     images.slice(1),
    _createdAt:  new Date().toISOString(),
    _source:     'admin-form',
  }
}

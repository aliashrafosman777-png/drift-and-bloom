// @ts-nocheck
"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buildPackageCategories } from '../data/products'

const PackageContext = createContext(null)
const STORAGE_KEY = 'db_build_package_v2'

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const readStoredPackage = () => {
  if (typeof window === 'undefined') return {}
  return safeParse(localStorage.getItem(STORAGE_KEY), {})
}

const normalizeQuantity = (quantity) => Math.max(1, Number.parseInt(quantity, 10) || 1)
const normalizeCategoryId = (categoryId) => (categoryId === 'fish-tanks' ? 'fish' : categoryId)

export function PackageProvider({ children }) {
  const [packageItems, setPackageItems] = useState(readStoredPackage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packageItems))
    } catch {
      /* Ignore unavailable storage, for example private browsing restrictions. */
    }
  }, [packageItems])

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?.id || !product?.category) return

    setPackageItems((current) => {
      const existing = current[product.id]
      return {
        ...current,
        [product.id]: {
          product,
          quantity: (existing?.quantity || 0) + normalizeQuantity(quantity),
        },
      }
    })
  }, [])

  const replaceItem = useCallback((product, quantity = 1) => {
    if (!product?.id || !product?.category) return

    setPackageItems((current) => ({
      ...current,
      [product.id]: {
        product,
        quantity: normalizeQuantity(quantity),
      },
    }))
  }, [])

  const removeItem = useCallback((productId) => {
    setPackageItems((current) => {
      const next = { ...current }
      delete next[productId]
      return next
    })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    const nextQuantity = Number.parseInt(quantity, 10)

    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      removeItem(productId)
      return
    }

    setPackageItems((current) => {
      const existing = current[productId]
      if (!existing) return current

      return {
        ...current,
        [productId]: {
          ...existing,
          quantity: nextQuantity,
        },
      }
    })
  }, [removeItem])

  const incrementItem = useCallback((productId) => {
    setPackageItems((current) => {
      const existing = current[productId]
      if (!existing) return current

      return {
        ...current,
        [productId]: {
          ...existing,
          quantity: existing.quantity + 1,
        },
      }
    })
  }, [])

  const decrementItem = useCallback((productId) => {
    setPackageItems((current) => {
      const existing = current[productId]
      if (!existing) return current

      if (existing.quantity <= 1) {
        const next = { ...current }
        delete next[productId]
        return next
      }

      return {
        ...current,
        [productId]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      }
    })
  }, [])

  const clearPackage = useCallback(() => {
    setPackageItems({})
  }, [])

  const selectedList = useMemo(
    () => Object.values(packageItems).filter((line) => line?.product && line.quantity > 0),
    [packageItems]
  )

  const selectedItems = useMemo(() => {
    return buildPackageCategories.reduce((groups, category) => {
      groups[category.id] = selectedList.filter((line) => normalizeCategoryId(line.product.category) === category.id)
      return groups
    }, {})
  }, [selectedList])

  const itemCount = useMemo(
    () => selectedList.reduce((total, line) => total + line.quantity, 0),
    [selectedList]
  )

  const getProductQuantity = useCallback(
    (productId) => packageItems[productId]?.quantity || 0,
    [packageItems]
  )

  const getTotal = useCallback(
    () => selectedList.reduce((total, line) => total + Number(line.product.price || 0) * line.quantity, 0),
    [selectedList]
  )

  const getCategoryTotal = useCallback(
    (categoryId) => selectedList
      .filter((line) => normalizeCategoryId(line.product.category) === categoryId)
      .reduce((total, line) => total + Number(line.product.price || 0) * line.quantity, 0),
    [selectedList]
  )

  const getProgress = useCallback(() => {
    const totalCategories = buildPackageCategories.length
    const selectedCount = buildPackageCategories.filter((category) => selectedItems[category.id]?.length > 0).length

    return {
      selectedCount,
      totalCategories,
      percentage: totalCategories ? Math.round((selectedCount / totalCategories) * 100) : 0,
      itemCount,
      hasItems: itemCount > 0,
      isComplete: itemCount > 0,
    }
  }, [selectedItems, itemCount])

  const value = useMemo(
    () => ({
      packageItems,
      selectedItems,
      selectedList,
      itemCount,
      addItem,
      removeItem,
      replaceItem,
      updateQuantity,
      incrementItem,
      decrementItem,
      clearPackage,
      getProductQuantity,
      getTotal,
      getCategoryTotal,
      getProgress,
    }),
    [
      packageItems,
      selectedItems,
      selectedList,
      itemCount,
      addItem,
      removeItem,
      replaceItem,
      updateQuantity,
      incrementItem,
      decrementItem,
      clearPackage,
      getProductQuantity,
      getTotal,
      getCategoryTotal,
      getProgress,
    ]
  )

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>
}

export function usePackage() {
  const context = useContext(PackageContext)
  if (!context) throw new Error('usePackage must be used within a PackageProvider')
  return context
}

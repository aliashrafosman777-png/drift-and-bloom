// @ts-nocheck
"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type CartLine = {
  productId: string
  name: string
  price: number
  image: string
  scent?: string
  plantOption?: string | null
  quantity: number
  isCustomPackage?: boolean
  packageSelections?: Array<Record<string, unknown>>
}

type CartProduct = {
  id: string
  name: string
  price: number
  image: string
  scent?: string
  isCustomPackage?: boolean
  packageSelections?: Array<Record<string, unknown>>
}

type InstructionLanguage = 'English' | 'Arabic'

type CartContextValue = {
  items: CartLine[]
  addToCart: (product: CartProduct, quantity?: number, plantOption?: string | null) => void
  removeFromCart: (productId: string, plantOption?: string | null) => void
  updateQuantity: (productId: string, plantOption: string | null | undefined, quantity: number | string) => void
  clearCart: () => void
  subtotal: number
  shipping: number
  total: number
  itemCount: number
  instructionLanguage: InstructionLanguage
  setInstructionLanguage: (language: string) => void
  instructionLanguages: InstructionLanguage[]
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'db_cart_v1'
const INSTRUCTION_LANGUAGE_KEY = 'db_cart_instruction_language_v1'
const ALLOWED_INSTRUCTION_LANGUAGES: InstructionLanguage[] = ['English', 'Arabic']

const readStoredItems = (): CartLine[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : parsed?.items || []
  } catch {
    return []
  }
}

const readStoredInstructionLanguage = (): InstructionLanguage => {
  if (typeof window === 'undefined') return 'English'
  try {
    const stored = window.localStorage.getItem(INSTRUCTION_LANGUAGE_KEY)
    return ALLOWED_INSTRUCTION_LANGUAGES.includes(stored as InstructionLanguage) ? (stored as InstructionLanguage) : 'English'
  } catch {
    return 'English'
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const [instructionLanguage, setInstructionLanguageState] = useState<InstructionLanguage>('English')
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setItems(readStoredItems())
    setInstructionLanguageState(readStoredInstructionLanguage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore write errors */
    }
  }, [items, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(INSTRUCTION_LANGUAGE_KEY, instructionLanguage)
    } catch {
      /* ignore write errors */
    }
  }, [instructionLanguage, hydrated])

  const setInstructionLanguage = (language: string) => {
    if (!ALLOWED_INSTRUCTION_LANGUAGES.includes(language as InstructionLanguage)) return
    setInstructionLanguageState(language as InstructionLanguage)
  }

  const lineKey = (productId: string, plantOption?: string | null) => `${productId}::${plantOption || 'default'}`

  const addToCart = (product: CartProduct, quantity = 1, plantOption: string | null = null) => {
    setItems((prev) => {
      const key = lineKey(product.id, plantOption)
      const existing = prev.find((i) => lineKey(i.productId, i.plantOption) === key)
      if (existing) {
        return prev.map((i) =>
          lineKey(i.productId, i.plantOption) === key ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          scent: product.scent,
          plantOption,
          quantity,
          isCustomPackage: Boolean(product.isCustomPackage),
          packageSelections: product.packageSelections || [],
        },
      ]
    })
  }

  const removeFromCart = (productId: string, plantOption: string | null = null) => {
    const key = lineKey(productId, plantOption)
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.plantOption) !== key))
  }

  const updateQuantity = (productId: string, plantOption: string | null | undefined, quantity: number | string) => {
    const nextQuantity = Number.parseInt(String(quantity), 10)
    const key = lineKey(productId, plantOption)

    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      removeFromCart(productId, plantOption)
      return
    }

    setItems((prev) =>
      prev.map((i) => (lineKey(i.productId, i.plantOption) === key ? { ...i, quantity: nextQuantity } : i)),
    )
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const shipping = subtotal === 0 || subtotal >= 3000 ? 0 : 100

  const total = subtotal + shipping

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      shipping,
      total,
      itemCount,
      instructionLanguage,
      setInstructionLanguage,
      instructionLanguages: ALLOWED_INSTRUCTION_LANGUAGES,
    }),
    [items, subtotal, shipping, total, itemCount, instructionLanguage],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

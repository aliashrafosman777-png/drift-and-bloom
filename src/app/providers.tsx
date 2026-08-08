'use client'

import React from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { PackageProvider } from '@/context/PackageContext'
import { ProductProvider } from '@/context/ProductContext'
import { FishProductProvider } from '@/context/FishProductContext'
import { ToastProvider } from '@/components/common/Toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FishProductProvider>
        <ProductProvider>
          <CartProvider>
            <PackageProvider>
              <ToastProvider>{children}</ToastProvider>
            </PackageProvider>
          </CartProvider>
        </ProductProvider>
      </FishProductProvider>
    </AuthProvider>
  )
}

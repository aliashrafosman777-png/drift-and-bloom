'use client'

import React from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { PackageProvider } from '@/context/PackageContext'
import { ProductProvider } from '@/context/ProductContext'
import { FishProductProvider } from '@/context/FishProductContext'
import { CatalogProductProvider } from '@/context/CatalogProductContext'
import { ToastProvider } from '@/components/common/Toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FishProductProvider>
        <CatalogProductProvider>
          <ProductProvider>
            <CartProvider>
              <PackageProvider>
                <ToastProvider>{children}</ToastProvider>
              </PackageProvider>
            </CartProvider>
          </ProductProvider>
        </CatalogProductProvider>
      </FishProductProvider>
    </AuthProvider>
  )
}

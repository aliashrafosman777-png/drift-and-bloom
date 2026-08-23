import type { Metadata } from 'next'
import AdminCatalogProducts from '@/views/admin/AdminCatalogProducts'

export const metadata: Metadata = {
  title: 'Admin Candles & Plants',
  description: 'Manage database-backed Candle and Plant products.',
  robots: { index: false, follow: false },
}

export default function AdminCatalogProductsPage() {
  return <AdminCatalogProducts />
}

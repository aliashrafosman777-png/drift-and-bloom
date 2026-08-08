import type { Metadata } from 'next'
import AdminFishProducts from '@/views/admin/AdminFishProducts'

export const metadata: Metadata = {
  title: 'Admin Fish Products',
  description: 'Manage Drift & Bloom fish products — Aquariums and Aquatic Life.',
  robots: { index: false, follow: false },
}

export default function AdminFishProductsPage() {
  return <AdminFishProducts />
}

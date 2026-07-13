import type { Metadata } from 'next'
import AdminOrders from '@/views/admin/AdminOrders'

export const metadata: Metadata = {
  title: 'Admin Orders',
  description: 'Manage Drift & Bloom orders.',
  robots: { index: false, follow: false },
}

export default function AdminOrdersPage() {
  return <AdminOrders />
}

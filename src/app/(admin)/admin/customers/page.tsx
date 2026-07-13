import type { Metadata } from 'next'
import AdminCustomers from '@/views/admin/AdminCustomers'

export const metadata: Metadata = {
  title: 'Admin Customers',
  description: 'Manage Drift & Bloom customers.',
  robots: { index: false, follow: false },
}

export default function AdminCustomersPage() {
  return <AdminCustomers />
}

import type { Metadata } from 'next'
import Dashboard from '@/views/admin/Dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Drift & Bloom admin dashboard.',
  robots: { index: false, follow: false },
}

export default function AdminDashboardPage() {
  return <Dashboard />
}

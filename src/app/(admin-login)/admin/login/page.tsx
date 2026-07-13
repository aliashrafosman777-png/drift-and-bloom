import type { Metadata } from 'next'
import AdminLogin from '@/views/admin/AdminLogin'

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Drift & Bloom admin login.',
  alternates: { canonical: '/admin/login' },
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return <AdminLogin />
}

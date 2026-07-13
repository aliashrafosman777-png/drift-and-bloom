import { Suspense } from 'react'
import type { Metadata } from 'next'
import Login from '@/views/Login'
import LoadingFallback from '@/components/common/LoadingFallback'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your Drift & Bloom account.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback label="Loading..." />}>
      <Login />
    </Suspense>
  )
}

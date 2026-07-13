import { Suspense } from 'react'
import type { Metadata } from 'next'
import Register from '@/views/Register'
import LoadingFallback from '@/components/common/LoadingFallback'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your Drift & Bloom account for faster checkout and order tracking.',
  alternates: { canonical: '/register' },
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback label="Loading..." />}>
      <Register />
    </Suspense>
  )
}

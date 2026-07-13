import { Suspense } from 'react'
import type { Metadata } from 'next'
import Packages from '@/views/Packages'
import LoadingFallback from '@/components/common/LoadingFallback'

export const metadata: Metadata = {
  title: 'Packages',
  description:
    'Shop curated Drift & Bloom packages by mood, collection, price, and rating.',
  alternates: { canonical: '/packages' },
  openGraph: {
    title: 'Packages | Drift & Bloom',
    description: 'Shop curated plant, candle, and calming space collections.',
    url: '/packages',
    images: [{ url: '/assets/package.png', width: 1200, height: 630, alt: 'Drift & Bloom packages' }],
  },
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<LoadingFallback label="Loading packages..." />}>
      <Packages />
    </Suspense>
  )
}

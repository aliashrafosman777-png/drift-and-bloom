import { Suspense } from 'react'
import type { Metadata } from 'next'
import BuildPackage from '@/views/BuildPackage'
import LoadingFallback from '@/components/common/LoadingFallback'

export const metadata: Metadata = {
  title: 'Build Your Package',
  description:
    'Start with plants, candles, or fish and customize every detail to create your perfect calming space package.',
  alternates: { canonical: '/build-your-package' },
}

export default function BuildYourPackagePage() {
  return (
    <Suspense fallback={<LoadingFallback label="Loading package builder..." />}>
      <BuildPackage />
    </Suspense>
  )
}

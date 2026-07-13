import { Suspense } from 'react'
import type { Metadata } from 'next'
import BuildPackage from '@/views/BuildPackage'
import LoadingFallback from '@/components/common/LoadingFallback'

export const metadata: Metadata = {
  title: 'Build Package',
  description: 'Build a custom Drift & Bloom package with plants, candles, and fish essentials.',
  alternates: { canonical: '/build-package' },
}

export default function BuildPackageAliasPage() {
  return (
    <Suspense fallback={<LoadingFallback label="Loading package builder..." />}>
      <BuildPackage />
    </Suspense>
  )
}

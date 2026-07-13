import type { Metadata } from 'next'
import Home from '@/views/Home'

export const metadata: Metadata = {
  title: 'Curated Calming Packages',
  description:
    'Discover Drift & Bloom collections, best sellers, build-your-package options, and the Find Your Soul quiz.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <Home />
}

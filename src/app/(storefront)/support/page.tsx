import type { Metadata } from 'next'
import Support from '@/views/Support'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Contact Drift & Bloom support and find answers about packages, plants, candles, fish care, and delivery.',
  alternates: { canonical: '/support' },
}

export default function SupportPage() {
  return <Support />
}

import type { Metadata } from 'next'
import FindYourSoul from '@/views/FindYourSoul/FindYourSoul'

export const metadata: Metadata = {
  title: 'Find Your Soul',
  description: 'Take the Drift & Bloom quiz and discover the collection that matches your mood and space.',
  alternates: { canonical: '/find-your-soul' },
}

export default function FindYourSoulPage() {
  return <FindYourSoul />
}

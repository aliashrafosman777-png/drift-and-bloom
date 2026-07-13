import type { Metadata } from 'next'
import Cart from '@/views/Cart'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your Drift & Bloom cart, package selections, delivery details, and checkout information.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <Cart />
}

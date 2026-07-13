'use client'

import Button from '@/components/common/Button'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-cream px-6 py-24 text-center text-charcoal">
      <p className="mb-3 text-xs uppercase tracking-label text-gold-dark">Something went wrong</p>
      <h1 className="font-serif text-4xl sm:text-5xl">We couldn&apos;t load this page.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal/60">
        Please try again. Your cart and package selections remain saved locally on this device.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </main>
  )
}

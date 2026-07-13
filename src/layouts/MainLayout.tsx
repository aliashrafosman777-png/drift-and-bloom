// @ts-nocheck
"use client"

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div id="top" className="min-h-screen flex flex-col bg-cream text-charcoal">
      <Navbar />
      <main className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}


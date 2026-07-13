// @ts-nocheck
"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingFallback from '../components/common/LoadingFallback'

export default function ProtectedRoute({
  isAllowed,
  redirectTo = '/',
  children,
}: {
  isAllowed: boolean
  redirectTo?: string
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isAllowed) router.replace(redirectTo)
  }, [isAllowed, redirectTo, router])

  if (!isAllowed) return <LoadingFallback />
  return <>{children}</>
}

// @ts-nocheck
"use client"

import React from 'react'

const STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Being Prepared': 'bg-blue-100 text-blue-700 border-blue-200',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  'Out for Delivery': 'bg-amber-100 text-amber-700 border-amber-200',
  Delivered: 'bg-green-100 text-green-800 border-green-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-600 border-red-200',
  Refunded: 'bg-gray-100 text-gray-700 border-gray-200',
  Active: 'bg-green-100 text-green-800 border-green-200',
  Draft: 'bg-gray-100 text-gray-600 border-gray-200',
  'Out of Stock': 'bg-red-100 text-red-600 border-red-200',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status] || 'bg-beige text-charcoal/60 border-charcoal/10'
        }`}
    >
      {status}
    </span>
  )
}

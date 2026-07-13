// @ts-nocheck
"use client"

import React from 'react'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  hint?: string
  color?: string
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = 'from-amber-500 to-amber-700',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

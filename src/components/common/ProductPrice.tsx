import React from 'react'
import { resolveProductPricing } from '@/lib/productPricing'

type ProductPriceProps = {
  price: number
  discountPrice?: number | null
  listPrice?: number | null
  currency?: 'LE' | 'EGP'
  className?: string
  currentClassName?: string
  originalClassName?: string
}

function formatAmount(value: number) {
  return value.toLocaleString('en-EG', { maximumFractionDigits: 2 })
}

export default function ProductPrice({
  price,
  discountPrice = null,
  listPrice = null,
  currency = 'LE',
  className = '',
  currentClassName = 'font-medium text-brown',
  originalClassName = 'text-charcoal/40 line-through',
}: ProductPriceProps) {
  const pricing = resolveProductPricing(price, discountPrice, listPrice)

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={currentClassName}>{currency} {formatAmount(pricing.effectivePrice)}</span>
      {pricing.hasDiscount && (
        <span className={originalClassName} aria-label={`Original price ${currency} ${formatAmount(pricing.regularPrice)}`}>
          {currency} {formatAmount(pricing.regularPrice)}
        </span>
      )}
    </span>
  )
}

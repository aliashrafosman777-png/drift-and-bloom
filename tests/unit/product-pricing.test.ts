import { describe, expect, it } from 'vitest'
import { effectiveProductPrice, resolveProductPricing } from '@/lib/productPricing'

describe('product pricing', () => {
  it('uses a valid database discount as the customer price', () => {
    expect(resolveProductPricing(690, 450)).toEqual({
      regularPrice: 690,
      effectivePrice: 450,
      discountPrice: 450,
      hasDiscount: true,
    })
    expect(effectiveProductPrice(690, 450)).toBe(450)
  })

  it('ignores invalid discounts', () => {
    expect(resolveProductPricing(690, 690).effectivePrice).toBe(690)
    expect(resolveProductPricing(690, 800).effectivePrice).toBe(690)
    expect(resolveProductPricing(690, null).hasDiscount).toBe(false)
  })

  it('preserves resolved cart and package-builder list prices', () => {
    expect(resolveProductPricing(450, null, 690)).toMatchObject({
      regularPrice: 690,
      effectivePrice: 450,
      hasDiscount: true,
    })
  })
})

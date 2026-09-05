export type ProductPricing = {
  regularPrice: number
  effectivePrice: number
  discountPrice: number | null
  hasDiscount: boolean
}

function finiteNonNegative(value: unknown): number | null {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

/**
 * Resolve the price charged to a customer from a database product or cart line.
 * Database products provide `price` + `discountPrice`; cart and package-builder
 * lines provide the already-resolved `price` + optional `listPrice`.
 */
export function resolveProductPricing(
  price: unknown,
  discountPrice: unknown = null,
  listPrice: unknown = null,
): ProductPricing {
  const storedPrice = finiteNonNegative(price) ?? 0
  const storedListPrice = finiteNonNegative(listPrice)
  const regularPrice = storedListPrice !== null && storedListPrice > storedPrice
    ? storedListPrice
    : storedPrice
  const storedDiscount = finiteNonNegative(discountPrice)
  const effectivePrice = storedDiscount !== null && storedDiscount > 0 && storedDiscount < regularPrice
    ? storedDiscount
    : storedListPrice !== null && storedPrice < storedListPrice
      ? storedPrice
      : regularPrice
  const hasDiscount = effectivePrice > 0 && effectivePrice < regularPrice

  return {
    regularPrice,
    effectivePrice,
    discountPrice: hasDiscount ? effectivePrice : null,
    hasDiscount,
  }
}

export function effectiveProductPrice(price: unknown, discountPrice: unknown): number {
  return resolveProductPricing(price, discountPrice).effectivePrice
}

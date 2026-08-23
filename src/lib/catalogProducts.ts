import type { ProductStatus } from '@/lib/fishProducts'

export const CATALOG_PRODUCT_TYPES = ['candles', 'plants'] as const
export const CANDLE_CATEGORIES = ['essential', 'signature', 'art'] as const

export type CatalogProductType = (typeof CATALOG_PRODUCT_TYPES)[number]
export type CandleCategory = (typeof CANDLE_CATEGORIES)[number]

function normalizeToken(value: unknown): string {
  return typeof value === 'string'
    ? value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/_/g, '-').replace(/\s+/g, '-')
    : ''
}

export function normalizeCatalogProductType(value: unknown): CatalogProductType | null {
  const normalized = normalizeToken(value)
  if (normalized === 'candle' || normalized === 'candles') return 'candles'
  if (normalized === 'plant' || normalized === 'plants') return 'plants'
  return null
}

export function normalizeCandleCategory(
  value: unknown,
  categories: unknown = [],
): CandleCategory | null {
  const candidates = [
    value,
    ...(Array.isArray(categories) ? categories : [categories]),
  ]
  for (const candidate of candidates) {
    const normalized = normalizeToken(candidate)
    if (CANDLE_CATEGORIES.includes(normalized as CandleCategory)) {
      return normalized as CandleCategory
    }
  }
  return null
}

export function buildCatalogKey(productType: CatalogProductType, name: string): string {
  const normalizedName = name
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ')
  return `${productType}:${normalizedName}`
}

export function buildCatalogCategories(
  productType: CatalogProductType,
  candleCategory: CandleCategory | null,
): string[] {
  return productType === 'candles' && candleCategory
    ? [productType, candleCategory]
    : [productType]
}

export function isCatalogProductRecord(product: Record<string, unknown>): boolean {
  return Boolean(
    normalizeCatalogProductType(product.productType) ||
    normalizeCatalogProductType(product.packageCategory),
  )
}

export function canonicalizeCatalogProduct<T extends Record<string, unknown>>(data: T): T {
  if (!isCatalogProductRecord(data)) return data

  const productType = normalizeCatalogProductType(data.productType || data.packageCategory)
  if (!productType) throw new Error('INVALID_CATALOG_PRODUCT_TYPE')

  const candleCategory = normalizeCandleCategory(
    data.candleCategory || data.subCategory,
    data.category,
  )
  if (productType === 'candles' && !candleCategory) {
    throw new Error('INVALID_CANDLE_CATEGORY')
  }

  if (!String(data.shortDescription || '').trim() || Number(data.price) <= 0) {
    throw new Error('INVALID_CATALOG_REQUIRED_FIELDS')
  }
  const image = String(data.image || (Array.isArray(data.images) ? data.images[0] : '') || '')
  if (!image || /^data:/i.test(image)) throw new Error('INVALID_CATALOG_IMAGE')

  const discountPrice = data.discountPrice == null ? null : Number(data.discountPrice)
  if (
    discountPrice !== null &&
    (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= Number(data.price))
  ) {
    throw new Error('INVALID_DISCOUNT_PRICE')
  }

  const status = (data.status || 'active') as ProductStatus
  return {
    ...data,
    productType,
    candleCategory: productType === 'candles' ? candleCategory : '',
    packageCategory: productType,
    subCategory: productType === 'candles' ? candleCategory : '',
    category: buildCatalogCategories(productType, candleCategory),
    catalogKey: buildCatalogKey(productType, String(data.name || '')),
    fishSubCategory: '',
    aquaticLifeType: '',
    fishKey: null,
    discountPrice,
    status,
    isActive: status === 'active',
    deletedAt: null,
  } as T
}

export function effectiveCatalogPrice(price: unknown, discountPrice: unknown): number {
  const regular = Number(price)
  const discount = Number(discountPrice)
  if (Number.isFinite(discount) && discount > 0 && discount < regular) return discount
  return Number.isFinite(regular) && regular >= 0 ? regular : 0
}

export function safeCatalogProductImage(
  value: unknown,
  productType: CatalogProductType = 'plants',
): string {
  const fallback = productType === 'candles' ? '/assets/candles.jpeg' : '/assets/plants.jpeg'
  if (typeof value !== 'string' || !value.trim() || /^data:/i.test(value)) return fallback
  return value
}

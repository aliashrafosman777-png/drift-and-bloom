import { describe, expect, it } from 'vitest'
import {
  buildCatalogCategories,
  buildCatalogKey,
  canonicalizeCatalogProduct,
  effectiveCatalogPrice,
  normalizeCandleCategory,
  normalizeCatalogProductType,
} from '@/lib/catalogProducts'

describe('Candle and Plant product canonicalization', () => {
  it('normalizes only supported product types and candle categories', () => {
    expect(normalizeCatalogProductType('Candle')).toBe('candles')
    expect(normalizeCatalogProductType('PLANTS')).toBe('plants')
    expect(normalizeCatalogProductType('fish')).toBeNull()
    expect(normalizeCandleCategory('Signature')).toBe('signature')
    expect(normalizeCandleCategory('', ['candles', 'art'])).toBe('art')
  })

  it('builds stable type-scoped keys and categories', () => {
    expect(buildCatalogKey('candles', '  Quiet   Flame ')).toBe('candles:quiet flame')
    expect(buildCatalogKey('plants', 'Quiet Flame')).toBe('plants:quiet flame')
    expect(buildCatalogCategories('candles', 'essential')).toEqual(['candles', 'essential'])
    expect(buildCatalogCategories('plants', null)).toEqual(['plants'])
  })

  it('clears candle metadata when a product changes to Plants', () => {
    const product = canonicalizeCatalogProduct({
      name: 'Calm Fern',
      shortDescription: 'A calm fern.',
      price: 400,
      image: '/assets/plants.jpeg',
      productType: 'plants',
      packageCategory: 'candles',
      candleCategory: 'signature',
      subCategory: 'signature',
      category: ['candles', 'signature'],
      status: 'active',
    })
    expect(product).toMatchObject({
      productType: 'plants',
      packageCategory: 'plants',
      candleCategory: '',
      subCategory: '',
      category: ['plants'],
      catalogKey: 'plants:calm fern',
      isActive: true,
    })
  })

  it('requires candle category, durable image, required copy, and valid discount', () => {
    const base = {
      name: 'Candle',
      shortDescription: 'Short copy',
      price: 500,
      image: '/assets/candles.jpeg',
      productType: 'candles',
    }
    expect(() => canonicalizeCatalogProduct(base)).toThrow('INVALID_CANDLE_CATEGORY')
    expect(() => canonicalizeCatalogProduct({ ...base, candleCategory: 'art', image: '' })).toThrow('INVALID_CATALOG_IMAGE')
    expect(() => canonicalizeCatalogProduct({ ...base, candleCategory: 'art', discountPrice: 600 })).toThrow('INVALID_DISCOUNT_PRICE')
  })

  it('uses a valid discount as the package price', () => {
    expect(effectiveCatalogPrice(650, 525)).toBe(525)
    expect(effectiveCatalogPrice(650, 700)).toBe(650)
    expect(effectiveCatalogPrice(650, null)).toBe(650)
  })
})

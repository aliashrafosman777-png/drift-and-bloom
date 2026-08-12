import { describe, expect, it } from 'vitest'
import {
  buildFishCategories,
  buildFishKey,
  inferLegacyFishSubCategory,
  normalizeAquaticLifeType,
  normalizeFishSubCategory,
  safeProductImage,
} from '@/lib/fishProducts'

describe('fish product canonicalization', () => {
  it('normalizes the supported sub-category aliases', () => {
    expect(normalizeFishSubCategory('Aquariums')).toBe('aquariums')
    expect(normalizeFishSubCategory('', ['fish', 'aquatic-life'])).toBe('aquatic-life')
    expect(normalizeFishSubCategory('unknown')).toBeNull()
  })

  it('normalizes aquatic life types from fields, categories, or tags', () => {
    expect(normalizeAquaticLifeType('Betta Fish')).toBe('betta-fish')
    expect(normalizeAquaticLifeType('', [], ['Pleco Fish'])).toBe('pleco-fish')
    expect(normalizeAquaticLifeType('unknown')).toBeNull()
  })

  it('recovers only unambiguous legacy fish sub-categories', () => {
    expect(inferLegacyFishSubCategory({ name: 'Premium Aquarium', category: ['fish'] })).toBe('aquariums')
    expect(inferLegacyFishSubCategory({ name: 'Blue Shrimp', tags: ['Shrimp'] })).toBe('aquatic-life')
    expect(inferLegacyFishSubCategory({ name: 'Mystery Product', category: ['fish'] })).toBeNull()
  })

  it('builds one canonical category representation', () => {
    expect(buildFishCategories('aquariums', null)).toEqual(['fish', 'aquariums'])
    expect(buildFishCategories('aquatic-life', 'shrimp')).toEqual(['fish', 'aquatic-life', 'shrimp'])
  })

  it('builds stable duplicate-prevention keys', () => {
    expect(buildFishKey('  Mini   Aquarium ')).toBe('mini aquarium')
    expect(buildFishKey('MINI AQUARIUM')).toBe('mini aquarium')
  })

  it('never exposes embedded data URLs from product responses', () => {
    expect(safeProductImage('data:image/png;base64,AAAA')).toBe('/assets/fishs.jpeg')
    expect(safeProductImage('https://res.cloudinary.com/example/image.jpg')).toContain('cloudinary.com')
  })
})

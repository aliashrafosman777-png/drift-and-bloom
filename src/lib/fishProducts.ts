export const FISH_SUB_CATEGORIES = ['aquariums', 'aquatic-life'] as const
export const AQUATIC_LIFE_TYPES = ['betta-fish', 'shrimp', 'crab', 'pleco-fish'] as const

export type FishSubCategory = (typeof FISH_SUB_CATEGORIES)[number]
export type AquaticLifeType = (typeof AQUATIC_LIFE_TYPES)[number]
export type ProductStatus = 'active' | 'draft' | 'out_of_stock'

export const AQUATIC_LIFE_LABELS: Record<AquaticLifeType, string> = {
  'betta-fish': 'Betta Fish',
  shrimp: 'Shrimp',
  crab: 'Crab',
  'pleco-fish': 'Pleco Fish',
}

const SUB_CATEGORY_ALIASES: Record<string, FishSubCategory> = {
  aquarium: 'aquariums',
  aquariums: 'aquariums',
  tank: 'aquariums',
  tanks: 'aquariums',
  'aquatic-life': 'aquatic-life',
  'aquatic life': 'aquatic-life',
  aquaticlife: 'aquatic-life',
}

const AQUATIC_TYPE_ALIASES: Record<string, AquaticLifeType> = {
  'betta-fish': 'betta-fish',
  'betta fish': 'betta-fish',
  betta: 'betta-fish',
  shrimp: 'shrimp',
  crab: 'crab',
  'pleco-fish': 'pleco-fish',
  'pleco fish': 'pleco-fish',
  pleco: 'pleco-fish',
}

function normalizeToken(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, ' ')
    : ''
}

export function normalizeFishSubCategory(
  value: unknown,
  categories: unknown = [],
): FishSubCategory | null {
  const direct = SUB_CATEGORY_ALIASES[normalizeToken(value)]
  if (direct) return direct

  const values = Array.isArray(categories) ? categories : [categories]
  for (const candidate of values) {
    const normalized = SUB_CATEGORY_ALIASES[normalizeToken(candidate)]
    if (normalized) return normalized
  }

  return null
}

export function normalizeAquaticLifeType(
  value: unknown,
  categories: unknown = [],
  tags: unknown = [],
): AquaticLifeType | null {
  const direct = AQUATIC_TYPE_ALIASES[normalizeToken(value)]
  if (direct) return direct

  const values = [
    ...(Array.isArray(categories) ? categories : [categories]),
    ...(Array.isArray(tags) ? tags : [tags]),
  ]
  for (const candidate of values) {
    const normalized = AQUATIC_TYPE_ALIASES[normalizeToken(candidate)]
    if (normalized) return normalized
  }

  return null
}

/**
 * Recover the category of legacy database records whose original seed omitted
 * fishSubCategory. New writes must still provide an explicit valid value; this
 * helper is only for reading and migrating existing records.
 */
export function inferLegacyFishSubCategory(
  product: Record<string, unknown>,
): FishSubCategory | null {
  const explicit = normalizeFishSubCategory(
    product.fishSubCategory || product.subCategory,
    product.category,
  )
  if (explicit) return explicit

  if (normalizeAquaticLifeType(product.aquaticLifeType, product.category, product.tags)) {
    return 'aquatic-life'
  }

  const identity = `${typeof product.name === 'string' ? product.name : ''} ${
    typeof product.slug === 'string' ? product.slug : ''
  }`
  return /\b(aquarium|tank)s?\b/i.test(identity) ? 'aquariums' : null
}

export function buildFishKey(name: string): string {
  return name.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

export function buildFishCategories(
  subCategory: FishSubCategory,
  aquaticLifeType: AquaticLifeType | null,
): string[] {
  return subCategory === 'aquatic-life' && aquaticLifeType
    ? ['fish', subCategory, aquaticLifeType]
    : ['fish', subCategory]
}

export function isFishProductRecord(product: Record<string, unknown>): boolean {
  const categories = Array.isArray(product.category)
    ? product.category
    : Array.isArray(product.categories)
      ? product.categories
      : [product.category].filter(Boolean)

  return (
    product.packageCategory === 'fish' ||
    categories.includes('fish') ||
    categories.includes('aquariums') ||
    categories.includes('aquatic-life') ||
    Boolean(product.fishSubCategory)
  )
}

export function safeProductImage(value: unknown, fallback = '/assets/fishs.jpeg'): string {
  if (typeof value !== 'string' || !value.trim() || /^data:/i.test(value)) return fallback
  return value
}

export function statusIsStorefrontVisible(status: ProductStatus): boolean {
  return status === 'active'
}

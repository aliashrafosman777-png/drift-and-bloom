// @ts-nocheck
/**
 * Plant Recommendation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Every plant has structured metadata across 5 dimensions:
 *   petSafe    – boolean
 *   moods      – which soul moods this plant suits
 *   light      – 'low' | 'medium' | 'bright' | 'any'
 *   size       – 'compact' | 'medium' | 'large'
 *   careLevel  – 'beginner' | 'intermediate' | 'advanced'
 *   popular    – whether this is a "popular choice" when shown as non-pet card
 *
 * scorePlant(plant, context) returns a numeric score so plants can be sorted
 * dynamically without any hardcoded if/else chains.
 */

export const PLANT_CATALOG = [
  {
    name: 'Calathea',
    scientificName: 'Calathea ornata',
    note: 'Playful patterned leaves that fold up at night.',
    petSafe: true,
    moods: ['calm', 'comfort', 'balance'],
    light: 'low',
    size: 'compact',
    careLevel: 'intermediate',
    popular: false,
  },
  {
    name: 'Prayer Plant',
    scientificName: 'Maranta leuconeura',
    note: 'Leaves that open and close daily — a gentle living ritual.',
    petSafe: true,
    moods: ['calm', 'comfort'],
    light: 'medium',
    size: 'compact',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'Peperomia',
    scientificName: 'Peperomia obtusifolia',
    note: 'Cheerful, low-maintenance, and perfectly compact.',
    petSafe: true,
    moods: ['joy', 'energy', 'balance'],
    light: 'medium',
    size: 'compact',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'Spider Plant',
    scientificName: 'Chlorophytum comosum',
    note: 'Safe for pets and easy to care for. Thrives in indirect light.',
    petSafe: true,
    moods: ['calm', 'balance'],
    light: 'medium',
    size: 'compact',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'Areca Palm',
    scientificName: 'Dypsis lutescens',
    note: 'Pet-safe and brings a soft, tropical feel to any room.',
    petSafe: true,
    moods: ['joy', 'energy'],
    light: 'bright',
    size: 'large',
    careLevel: 'intermediate',
    popular: false,
  },
  {
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    note: 'Air-purifying and calming, with elegant white blooms.',
    petSafe: true,
    moods: ['calm', 'comfort', 'balance'],
    light: 'low',
    size: 'medium',
    careLevel: 'beginner',
    popular: true,
  },
  {
    name: 'String of Hearts',
    scientificName: 'Ceropegia woodii',
    note: 'A delicate, trailing vine with tiny heart-shaped leaves.',
    petSafe: true,
    moods: ['love', 'calm'],
    light: 'medium',
    size: 'compact',
    careLevel: 'intermediate',
    popular: false,
  },
  // ── Non-pet-safe plants ────────────────────────────────────────────────────
  {
    name: 'Pothos Marble Queen',
    scientificName: 'Epipremnum aureum',
    note: 'Variegated and easy-going, brightens any corner.',
    petSafe: false,
    moods: ['joy', 'energy', 'balance'],
    light: 'any',
    size: 'medium',
    careLevel: 'beginner',
    popular: true,
  },
  {
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    note: 'A striking statement plant with iconic split leaves.',
    petSafe: false,
    moods: ['energy', 'joy'],
    light: 'medium',
    size: 'large',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'Rubber Plant',
    scientificName: 'Ficus elastica',
    note: 'Glossy leaves and a strong, upright shape for any room.',
    petSafe: false,
    moods: ['balance', 'comfort'],
    light: 'medium',
    size: 'large',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'Snake Plant',
    scientificName: 'Dracaena trifasciata',
    note: 'Releases oxygen at night and thrives on neglect.',
    petSafe: false,
    moods: ['energy', 'balance'],
    light: 'any',
    size: 'medium',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    note: 'Practically indestructible and thrives on neglect.',
    petSafe: false,
    moods: ['energy', 'balance'],
    light: 'low',
    size: 'medium',
    careLevel: 'beginner',
    popular: false,
  },
  {
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    note: 'A bold architectural statement plant for bright spaces.',
    petSafe: false,
    moods: ['joy', 'energy'],
    light: 'bright',
    size: 'large',
    careLevel: 'advanced',
    popular: false,
  },
  {
    name: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    note: 'A hardy, trailing plant that adds lush greenery to any space.',
    petSafe: false,
    moods: ['comfort', 'balance'],
    light: 'any',
    size: 'medium',
    careLevel: 'beginner',
    popular: true,
  },
  {
    name: 'Anthurium',
    scientificName: 'Anthurium andraeanum',
    note: 'Heart-shaped blooms that last for weeks.',
    petSafe: false,
    moods: ['love', 'joy'],
    light: 'medium',
    size: 'medium',
    careLevel: 'intermediate',
    popular: false,
  },
  {
    name: 'Lavender Plant',
    scientificName: 'Lavandula angustifolia',
    note: 'Fragrant and soothing — best kept somewhere sunny.',
    petSafe: false,
    moods: ['calm', 'comfort'],
    light: 'bright',
    size: 'compact',
    careLevel: 'intermediate',
    popular: false,
  },
]

/**
 * Context shape (all optional — defaults handled internally):
 * {
 *   petFriendly: boolean,          // from pet toggle or quiz answer
 *   mood:        string,           // 'calm' | 'energy' | 'comfort' | 'balance' | 'joy' | 'love'
 *   light:       string,           // 'low' | 'medium' | 'bright'
 *   space:       string,           // 'small' | 'medium' | 'large'
 *   careLevel:   string,           // 'beginner' | 'intermediate' | 'advanced'
 *   collection:  string,           // product/collection id
 * }
 */

// Maps collection IDs to the moods they suit
const COLLECTION_MOOD_MAP = {
  return: ['calm', 'comfort'],
  growth: ['energy', 'balance'],
  stillness: ['calm'],
  home: ['comfort', 'balance'],
  grounded: ['balance', 'calm'],
  joy: ['joy', 'energy'],
  love: ['love', 'comfort'],
  dream: ['calm'],
  renewal: ['energy', 'balance'],
  balance: ['balance', 'calm'],
}

export function scorePlant(plant, ctx = {}) {
  let score = 0

  // 1. Pet safety — highest weight, hard filter or heavy penalty
  if (ctx.petFriendly === true) {
    if (plant.petSafe) score += 10
    else score -= 20 // push toxic plants to the very bottom
  } else if (ctx.petFriendly === false) {
    // Decorative non-pet-safe plants are all valid; slight bonus for non-safe
    if (!plant.petSafe) score += 3
  }

  // 2. Mood match
  if (ctx.mood && plant.moods.includes(ctx.mood)) {
    score += 6
  }

  // 3. Light match
  const lightOrder = { low: 0, medium: 1, bright: 2 }
  if (ctx.light) {
    if (plant.light === 'any') {
      score += 3
    } else if (plant.light === ctx.light) {
      score += 4
    } else if (
      Math.abs((lightOrder[plant.light] ?? 1) - (lightOrder[ctx.light] ?? 1)) === 1
    ) {
      score += 1 // adjacent level, partial match
    }
  }

  // 4. Space / size match
  if (ctx.space) {
    const sizeMap = { small: 'compact', medium: 'medium', large: 'large' }
    if (plant.size === sizeMap[ctx.space]) score += 4
  }

  // 5. Care level match
  if (ctx.careLevel && plant.careLevel === ctx.careLevel) {
    score += 3
  }

  // 6. Collection affinity
  if (ctx.collection) {
    const collectionMoods = COLLECTION_MOOD_MAP[ctx.collection] || []
    if (plant.moods.some((m) => collectionMoods.includes(m))) {
      score += 3
    }
  }

  return score
}

/**
 * Returns the full sorted plant list for a given context.
 * petFriendly=true  → show pet-safe plants first, others hidden or deprioritised
 * petFriendly=false → show decorative plants, pet-safe still visible but lower
 */
export function getRecommendedPlants(ctx = {}, count = 8) {
  return [...PLANT_CATALOG]
    .map((p) => ({ ...p, _score: scorePlant(p, ctx) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, count)
}

/**
 * Picks the single best pet-safe and the single best non-pet-safe plant
 * for the two-card side-by-side display on the Product Details page.
 */
export function getBestPlantPair(ctx = {}) {
  const sorted = [...PLANT_CATALOG]
    .map((p) => ({ ...p, _score: scorePlant(p, ctx) }))
    .sort((a, b) => b._score - a._score)

  const best = sorted[0]
  const petSafe = sorted.find((p) => p.petSafe)
  const nonPetSafe = sorted.find((p) => !p.petSafe)

  return {
    petOption: petSafe || sorted[0],
    nonPetOption: nonPetSafe || sorted[1],
    topPick: best,
  }
}

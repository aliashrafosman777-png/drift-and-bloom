// @ts-nocheck
/**
 * Find Your Soul — Recommendation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Every quiz answer contributes to a weighted score for each of the 10
 * collections.  The highest-scoring collection drives the recommendation panel:
 * - Which collection / package to show
 * - Which candle scent
 * - Which plant (pet-safe vs not, mood match)
 * - Which add-on
 * - Which packaging description
 * - Which story card theme
 *
 * This file exports a pure function `computeRecommendation(answers)` so
 * components stay thin and all logic lives in one testable place.
 */

// ── Collection definitions ──────────────────────────────────────────────────

export const COLLECTIONS = {
  stillness: {
    id: 'stillness',
    soul: 'Stillness',
    description:
      'You crave calm, quiet moments and spaces that help you slow down, breathe deeply, and simply be.',
    candle: 'Lavender + Chamomile',
    candleNote: 'Soothing and relaxing',
    storyCard: 'A quiet note on the beauty of doing nothing.',
    packaging: 'Soft beige linen, tied with a cream ribbon.',
    addOn: { name: 'Calm Mind Tea', note: 'Herbal tea for restful moments' },
  },
  growth: {
    id: 'growth',
    soul: 'Growth',
    description:
      "You're in a season of becoming. You need gentle encouragement to keep rooting deeper and reaching further.",
    candle: 'Fresh Bamboo',
    candleNote: 'Clean and invigorating',
    storyCard: 'A note of encouragement for your next chapter.',
    packaging: 'Earthy green kraft, sealed with a gold sticker.',
    addOn: { name: 'Morning Pages Journal', note: 'A small ritual for fresh starts' },
  },
  joy: {
    id: 'joy',
    soul: 'Joy',
    description: 'You are drawn to brightness, warmth, and the little things that make a day extraordinary.',
    candle: 'Citrus + Honey',
    candleNote: 'Bright and uplifting',
    storyCard: 'A cheerful card celebrating the ordinary magic of today.',
    packaging: 'Sunshine yellow tissue, wrapped in a beige box.',
    addOn: { name: 'Wildflower Seed Pack', note: 'Grow something joyful' },
  },
  love: {
    id: 'love',
    soul: 'Love',
    description:
      "A soft, romantic collection for partners, friends or yourself. A gentle way to say what words sometimes can't.",
    candle: 'Rose + Amber',
    candleNote: 'Warm and romantic',
    storyCard: 'A heartfelt card with space to write your own words.',
    packaging: 'Dusty rose wrapping, sealed with a wax stamp.',
    addOn: { name: 'Rose Quartz Stone', note: 'A small reminder to give and receive' },
  },
  balance: {
    id: 'balance',
    soul: 'Balance',
    description:
      "You're seeking harmony between doing and being. A little structure, a little softness, just enough of both.",
    candle: 'Sandalwood + Bergamot',
    candleNote: 'Grounding and warm',
    storyCard: 'A note on finding stillness within the rhythm.',
    packaging: 'Natural kraft with an olive green ribbon.',
    addOn: { name: 'Grounding Stone', note: 'A pocket reminder to slow down' },
  },
  home: {
    id: 'home',
    soul: 'Home',
    description:
      "You're looking for comfort, safety, and the little things that make a space — or a person — feel like home.",
    candle: 'Vanilla + Cotton',
    candleNote: 'Warm and familiar',
    storyCard: 'A cosy card about the spaces that hold us.',
    packaging: 'Cream linen, hand-tied with a natural bow.',
    addOn: { name: 'Warm Cotton Candle', note: 'A scent that feels like home' },
  },
  grounded: {
    id: 'grounded',
    soul: 'Grounded',
    description: 'You need to feel steady again. A small ritual to plant your feet and breathe through the noise.',
    candle: 'Cedarwood + Moss',
    candleNote: 'Earthy and anchoring',
    storyCard: 'A rooted note about coming back to yourself.',
    packaging: 'Dark olive kraft, sealed with a pressed leaf.',
    addOn: { name: 'Forest Floor Bath Salts', note: 'Return to earth, even in the bath' },
  },
  renewal: {
    id: 'renewal',
    soul: 'Renewal',
    description: 'A clean slate in a box. Crisp scents and a hardy young plant for new homes, jobs, and chapters.',
    candle: 'Eucalyptus + Mint',
    candleNote: 'Fresh and revitalising',
    storyCard: 'A letter to the beginning of something new.',
    packaging: 'Crisp white box with a eucalyptus sprig.',
    addOn: { name: 'New Chapter Seed Kit', note: 'Plant something, begin again' },
  },
  dream: {
    id: 'dream',
    soul: 'Dream',
    description: 'Built for wind-down rituals — soft light, soothing scent, and a plant that loves the dark.',
    candle: 'Lavender + Night Jasmine',
    candleNote: 'Dreamy and calming',
    storyCard: 'A moonlit note about the beauty of rest.',
    packaging: 'Midnight blue tissue in a soft grey box.',
    addOn: { name: 'Sleep Mist Spray', note: 'Spritz your pillow, drift away' },
  },
  return: {
    id: 'return',
    soul: 'Return',
    description: 'A gentle invitation to slow down and reconnect with yourself — made for quiet mornings.',
    candle: 'Sandalwood + Sage',
    candleNote: 'Meditative and clean',
    storyCard: 'A quiet note about coming home to yourself.',
    packaging: 'Undyed linen, wrapped with care.',
    addOn: { name: 'Mindful Moment Cards', note: 'One card, one breath, each morning' },
  },
}

// ── Scoring weights ─────────────────────────────────────────────────────────

/*
 * Focus (q1) — what are you looking for today?
 * Maps answer → { collectionId: points }
 */
const FOCUS_SCORES = {
  calm: { stillness: 8, dream: 5, return: 4, grounded: 3, home: 2 },
  energy: { growth: 8, renewal: 5, joy: 4, grounded: 2 },
  comfort: { home: 8, love: 5, stillness: 3, return: 3, balance: 2 },
  balance: { balance: 8, grounded: 5, growth: 3, return: 3 },
}

/*
 * Recipient (q2)
 */
const RECIPIENT_SCORES = {
  self: { stillness: 3, balance: 3, return: 3, dream: 3, growth: 2 },
  'loved-one': { love: 6, home: 4, joy: 3 },
  friend: { joy: 5, renewal: 4, growth: 3 },
  special: { love: 6, joy: 3, home: 3 },
}

/*
 * Pets (q3) — doesn't directly score a collection, used for plant filtering
 */

/*
 * Preferred mood (q4)
 */
const MOOD_SCORES = {
  'calm-peaceful': { stillness: 5, dream: 4, return: 3, grounded: 2 },
  'cozy-warm': { home: 5, love: 4, return: 3 },
  'fresh-uplifting': { renewal: 5, joy: 4, growth: 4 },
  'grounded-natural': { grounded: 5, balance: 5, return: 3 },
}

/*
 * Space (q5)
 */
const SPACE_SCORES = {
  'small-minimal': { stillness: 4, balance: 3, return: 3 },
  'bright-airy': { joy: 4, renewal: 4, growth: 3 },
  'cozy-warm-space': { home: 5, love: 3, dream: 3 },
  'green-lush': { grounded: 5, growth: 4, renewal: 3 },
}

// ── Score aggregation ───────────────────────────────────────────────────────

function addScores(totals, partialScores, weight = 1) {
  if (!partialScores) return
  for (const [id, pts] of Object.entries(partialScores)) {
    totals[id] = (totals[id] || 0) + pts * weight
  }
}

/**
 * Maps quiz answers → { petContext, sortedCollections, winner }
 * @param {Record<string,string>} answers
 * @returns RecommendationResult
 */
export function computeRecommendation(answers = {}) {
  const totals = {}

  addScores(totals, FOCUS_SCORES[answers.focus])
  addScores(totals, RECIPIENT_SCORES[answers.recipient])
  addScores(totals, MOOD_SCORES[answers.mood])
  addScores(totals, SPACE_SCORES[answers.space])

  // Sort collection IDs by score descending
  const sorted = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)

  // Fall back to 'stillness' if no answers yet
  const winnerId = sorted[0] || 'stillness'
  const winner = COLLECTIONS[winnerId]

  // Derive mood context for plant scoring
  const moodMap = {
    calm: ['calm', 'stillness', 'return', 'dream', 'grounded'].includes(winnerId) ? 'calm' : 'balance',
    energy: 'energy',
    comfort: 'comfort',
    balance: 'balance',
  }
  const mood = moodMap[answers.focus] || winnerId

  // Pet context
  const petFriendly = answers.pets !== 'no'

  // Light context (derived from mood preference)
  const lightMap = {
    'fresh-uplifting': 'bright',
    'bright-airy': 'bright',
    'calm-peaceful': 'low',
    'grounded-natural': 'medium',
    'cozy-warm': 'medium',
    'cozy-warm-space': 'medium',
  }
  const light = lightMap[answers.mood] || lightMap[answers.space] || 'medium'

  // Space context
  const spaceMap = {
    'small-minimal': 'small',
    'bright-airy': 'medium',
    'cozy-warm-space': 'medium',
    'green-lush': 'large',
  }
  const space = spaceMap[answers.space] || 'medium'

  return {
    winner,
    sortedIds: sorted,
    plantContext: { petFriendly, mood, light, space, collection: winnerId },
    scores: totals,
  }
}

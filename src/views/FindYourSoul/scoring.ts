// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// scoring.js — Pure scoring and tie-break logic
// ─────────────────────────────────────────────────────────────────────────────

import { COLLECTIONS, QUESTIONS } from './quizData'

const ALL_KEYS = [
  'return', 'growth', 'stillness', 'home', 'grounded',
  'joy', 'love', 'dream', 'renewal', 'balance',
]

/**
 * Compute total scores from the answers map.
 * answers: { [questionId]: optionIndex }
 * Returns: { return: N, growth: N, ... }
 */
export function computeScores(answers) {
  const totals = Object.fromEntries(ALL_KEYS.map((k) => [k, 0]))

  for (const [qId, optIdx] of Object.entries(answers)) {
    const question = QUESTIONS.find((q) => q.id === Number(qId))
    if (!question) continue

    // Skip pets question — it doesn't affect soul score
    if (question.isPetsQuestion) continue

    const option = question.options[optIdx]
    if (!option) continue

    for (const [key, pts] of Object.entries(option.scores)) {
      if (totals[key] !== undefined) totals[key] += pts
    }
  }

  return totals
}

/**
 * Sort collections by score descending.
 * Returns array of { id, score } sorted highest first.
 */
export function sortedCollections(scores) {
  return ALL_KEYS
    .map((id) => ({ id, score: scores[id] || 0 }))
    .sort((a, b) => b.score - a.score)
}

/**
 * Determine the pet value from the answers map.
 * Returns 'yes' | 'no' | 'sometimes' | null
 */
export function getPetValue(answers) {
  const petQ = QUESTIONS.find((q) => q.isPetsQuestion)
  if (!petQ) return null
  const optIdx = answers[petQ.id]
  if (optIdx === undefined || optIdx === null) return null
  return petQ.options[optIdx]?.petValue || null
}

/**
 * Tie-break rules — exactly as specified in the document.
 * Returns the winning collection id, or null if no rule applies (caller keeps top).
 * answers: raw answer map for context (to resolve tie-breaks by reading Q3 intent)
 */
export function applyTieBreak(topId, secondId, answers) {
  const pair = [topId, secondId].sort().join('_')

  // Helper: check if an answer at question id matches any of given option texts
  const answerContains = (qId, ...fragments) => {
    const q = QUESTIONS.find((q) => q.id === qId)
    if (!q) return false
    const optIdx = answers[qId]
    if (optIdx === undefined) return false
    const text = (q.options[optIdx]?.text || '').toLowerCase()
    return fragments.some((f) => text.includes(f.toLowerCase()))
  }

  // Q3 = emotional need, Q2 = why buying, Q1 = who for
  switch (pair) {
    case 'growth_return':
      // Return if person wants energy back; Growth if self-development
      if (answerContains(3, 'alive', 'life')) return 'return'
      if (answerContains(3, 'grow', 'better version')) return 'growth'
      if (answerContains(2, 'motivate')) return 'return'
      if (answerContains(2, 'start fresh', 'fresh')) return 'growth'
      return null

    case 'balance_stillness':
      // Stillness if rest; Balance if clarity and organisation
      if (answerContains(3, 'slow down', 'breathe')) return 'stillness'
      if (answerContains(3, 'balanced', 'clear')) return 'balance'
      return null

    case 'balance_grounded':
      // Grounded if unstable; Balance if chaotic but wants harmony
      if (answerContains(3, 'stable', 'grounded')) return 'grounded'
      if (answerContains(3, 'balanced', 'clear')) return 'balance'
      if (answerContains(4, 'scattered', 'unstable')) return 'grounded'
      if (answerContains(4, 'chaos', 'confusion')) return 'balance'
      return null

    case 'home_love':
      // Home if family/comfort/safety; Love if romantic/partner/affection
      if (answerContains(1, 'partner', 'romantic')) return 'love'
      if (answerContains(1, 'loved one', 'loved')) return 'love'
      if (answerContains(1, 'friend', 'support')) return 'home'
      if (answerContains(2, 'love and care', 'show love')) return 'love'
      if (answerContains(2, 'comfort')) return 'home'
      return null

    case 'joy_return':
      // Joy if celebration/happiness; Return if motivation/passion
      if (answerContains(2, 'celebrate', 'mood')) return 'joy'
      if (answerContains(2, 'motivate', 'alive')) return 'return'
      if (answerContains(3, 'happy', 'light')) return 'joy'
      if (answerContains(3, 'alive')) return 'return'
      return null

    case 'dream_stillness':
      // Dream if imaginative/poetic/night; Stillness if mainly needs calm
      if (answerContains(3, 'dream', 'escape')) return 'dream'
      if (answerContains(3, 'slow down', 'breathe')) return 'stillness'
      if (answerContains(6, 'moonlight', 'moon', 'night')) return 'dream'
      if (answerContains(6, 'garden', 'rain', 'quiet')) return 'stillness'
      return null

    case 'growth_renewal':
      // Renewal if reset; Growth if progress
      if (answerContains(3, 'fresh start', 'fresh')) return 'renewal'
      if (answerContains(3, 'grow', 'better')) return 'growth'
      if (answerContains(2, 'start fresh')) return 'renewal'
      if (answerContains(2, 'motivate', 'learn')) return 'growth'
      return null

    case 'dream_love':
      // Love if connection; Dream if magic/imagination/softness
      if (answerContains(3, 'loved', 'connected')) return 'love'
      if (answerContains(3, 'dream', 'escape', 'imagine')) return 'dream'
      if (answerContains(1, 'partner', 'romantic')) return 'love'
      return null

    default:
      return null
  }
}

/**
 * Main result computation.
 * Returns { main, secondary, isBlended, plant }
 */
export function computeResult(answers) {
  const scores = computeScores(answers)
  const sorted = sortedCollections(scores)

  const top    = sorted[0]
  const second = sorted[1]

  const diff = top.score - second.score

  // Apply tie-break when scores are tied or very close
  let mainId = top.id
  let secondId = second.id

  if (diff <= 2 && top.score > 0) {
    const tieWinner = applyTieBreak(top.id, second.id, answers)
    if (tieWinner) {
      mainId = tieWinner
      secondId = tieWinner === top.id ? second.id : top.id
    }
  }

  const isBlended = diff <= 2 && top.score > 0

  // Pet-based plant selection
  const petValue = getPetValue(answers)
  const needPetSafe = petValue === 'yes' || petValue === 'sometimes'

  const mainCollection = COLLECTIONS[mainId]
  const secondCollection = COLLECTIONS[secondId]

  const plant = needPetSafe
    ? mainCollection?.plant?.petSafe
    : mainCollection?.plant?.any

  return {
    main:       mainCollection,
    secondary:  secondCollection,
    isBlended,
    diff,
    plant,
    isPetSafe:  needPetSafe,
    scores,
    sorted,
  }
}

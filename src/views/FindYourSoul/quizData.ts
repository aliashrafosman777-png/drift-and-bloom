// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// quizData.js — Single Source of Truth for the Find Your Soul Quiz
// All wording, scores, results and plant data come directly from the spec doc.
// ─────────────────────────────────────────────────────────────────────────────

export const SECTIONS = [
  { id: 'purpose',    label: 'Purpose',               step: 1 },
  { id: 'emotional',  label: 'Emotional Need',         step: 2 },
  { id: 'mood',       label: 'Mood & Atmosphere',      step: 3 },
  { id: 'scent',      label: 'Scent & Style',          step: 4 },
  { id: 'lifestyle',  label: 'Lifestyle & Practical',  step: 5 },
]

export const QUESTIONS = [
  // ── Step 1: Purpose ──────────────────────────────────────────────────────
  {
    id: 1,
    section: 'purpose',
    text: 'Who is this package for?',
    isPetsQuestion: false,
    options: [
      { text: 'Just for me',                        scores: { renewal: 1, stillness: 1, growth: 1 } },
      { text: 'A loved one',                        scores: { love: 2, home: 2 } },
      { text: 'A friend',                           scores: { joy: 2, home: 1, balance: 1 } },
      { text: 'My partner / someone romantic',      scores: { love: 4, dream: 1 } },
      { text: 'Someone who needs support',          scores: { stillness: 2, grounded: 2, home: 1 } },
      { text: 'Someone starting a new chapter',    scores: { renewal: 2, growth: 2 } },
      { text: 'Someone who feels lost or tired',   scores: { return: 2, grounded: 2 } },
    ],
  },
  {
    id: 2,
    section: 'purpose',
    text: 'Why are you buying it?',
    isPetsQuestion: false,
    options: [
      { text: 'I want to lift their mood',                            scores: { joy: 3, return: 1 } },
      { text: 'I want to show love and care',                         scores: { love: 3, home: 2 } },
      { text: 'I want to help them relax',                            scores: { stillness: 3, balance: 1 } },
      { text: 'I want to celebrate something',                        scores: { joy: 4, growth: 1 } },
      { text: 'I want to give them comfort',                          scores: { home: 3, stillness: 1 } },
      { text: 'I want to help them start fresh',                      scores: { renewal: 4, growth: 1 } },
      { text: 'I want to motivate them again',                        scores: { return: 4, growth: 1 } },
      { text: 'I want to give them something dreamy and special',     scores: { dream: 4, love: 1 } },
    ],
  },

  // ── Step 2: Emotional Need ───────────────────────────────────────────────
  {
    id: 3,
    section: 'emotional',
    text: 'What does your soul need most right now?',
    isPetsQuestion: false,
    options: [
      { text: 'To feel alive again',                      scores: { return: 5 } },
      { text: 'To grow into a better version of myself',  scores: { growth: 5 } },
      { text: 'To slow down and breathe',                 scores: { stillness: 5 } },
      { text: 'To feel warm and safe',                    scores: { home: 5 } },
      { text: 'To feel stable and grounded',              scores: { grounded: 5 } },
      { text: 'To feel happy and light',                  scores: { joy: 5 } },
      { text: 'To feel loved and connected',              scores: { love: 5 } },
      { text: 'To dream and escape softly',               scores: { dream: 5 } },
      { text: 'To start fresh',                           scores: { renewal: 5 } },
      { text: 'To feel balanced and clear',               scores: { balance: 5 } },
    ],
  },
  {
    id: 4,
    section: 'emotional',
    text: 'What are you trying to move away from?',
    isPetsQuestion: false,
    options: [
      { text: 'Low energy and loss of passion',       scores: { return: 3, joy: 1 } },
      { text: 'Feeling stuck or not improving',       scores: { growth: 4 } },
      { text: 'Stress, noise, and overthinking',      scores: { stillness: 3, balance: 1 } },
      { text: 'Loneliness or emotional emptiness',    scores: { home: 2, love: 2 } },
      { text: 'Feeling scattered or unstable',        scores: { grounded: 3, balance: 1 } },
      { text: 'Sadness or dullness',                  scores: { joy: 3, return: 1 } },
      { text: 'Emotional distance',                   scores: { love: 4 } },
      { text: 'Too much reality and pressure',        scores: { dream: 3, stillness: 1 } },
      { text: 'Old routines and heavy energy',        scores: { renewal: 3, growth: 1 } },
      { text: 'Chaos and confusion',                  scores: { balance: 4, grounded: 1 } },
    ],
  },

  // ── Step 3: Mood & Atmosphere ────────────────────────────────────────────
  {
    id: 5,
    section: 'mood',
    text: 'What kind of mood do you prefer?',
    isPetsQuestion: false,
    options: [
      { text: 'Bright & soulful',      scores: { return: 4 } },
      { text: 'Fresh & growing',        scores: { growth: 4 } },
      { text: 'Calm & peaceful',        scores: { stillness: 4 } },
      { text: 'Cozy & warm',            scores: { home: 4 } },
      { text: 'Earthy & natural',       scores: { grounded: 4 } },
      { text: 'Happy & playful',        scores: { joy: 4 } },
      { text: 'Romantic & tender',      scores: { love: 4 } },
      { text: 'Dreamy & magical',       scores: { dream: 4 } },
      { text: 'Clean & refreshing',     scores: { renewal: 4 } },
      { text: 'Balanced & elegant',     scores: { balance: 4 } },
    ],
  },
  {
    id: 6,
    section: 'mood',
    text: 'Which atmosphere feels closest to you?',
    isPetsQuestion: false,
    options: [
      { text: 'A golden sunset after a long day',                       scores: { return: 3, dream: 1 } },
      { text: 'A small plant growing beside a window',                  scores: { growth: 4 } },
      { text: 'A quiet garden after rain',                              scores: { stillness: 3, renewal: 1 } },
      { text: 'A warm room with candle light',                          scores: { home: 4 } },
      { text: 'A natural corner full of soil, wood, and plants',       scores: { grounded: 4 } },
      { text: 'A sunny table full of colors and flowers',              scores: { joy: 4 } },
      { text: 'A handwritten note beside soft flowers',                scores: { love: 4 } },
      { text: 'Moonlight, soft music, and a slow night',              scores: { dream: 4 } },
      { text: 'A clean airy room with fresh light',                    scores: { renewal: 4 } },
      { text: 'A neat peaceful space where everything feels in place', scores: { balance: 4 } },
    ],
  },

  // ── Step 4: Scent & Style ────────────────────────────────────────────────
  {
    id: 7,
    section: 'scent',
    text: 'Which scent direction attracts you most?',
    isPetsQuestion: false,
    options: [
      { text: 'Citrus / Bergamot / Mint',             scores: { return: 4 } },
      { text: 'Green tea / Fresh herbs / Light florals', scores: { growth: 4 } },
      { text: 'Lavender / Chamomile / Clean cotton',  scores: { stillness: 4 } },
      { text: 'Vanilla / Amber / Cinnamon',           scores: { home: 4 } },
      { text: 'Cedarwood / Sage / Earthy herbal',     scores: { grounded: 4 } },
      { text: 'Orange / Peach / Mango / Sweet floral', scores: { joy: 4 } },
      { text: 'Rose / Jasmine / Peony / White musk',  scores: { love: 4 } },
      { text: 'Moonflower / Soft musk / Night jasmine', scores: { dream: 4 } },
      { text: 'Eucalyptus / Lemon / Fresh linen',     scores: { renewal: 4 } },
      { text: 'White tea / Soft woods / Balanced clean scent', scores: { balance: 4 } },
    ],
  },
  {
    id: 8,
    section: 'scent',
    text: 'Choose the color palette you feel drawn to.',
    isPetsQuestion: false,
    options: [
      { text: 'Peach, coral, golden yellow',          scores: { return: 3, joy: 1 } },
      { text: 'Fresh green, cream, soft botanical beige', scores: { growth: 4 } },
      { text: 'Ivory, sage, soft beige',              scores: { stillness: 4 } },
      { text: 'Cream, caramel, warm gold',            scores: { home: 4 } },
      { text: 'Olive, clay, brown, deep green',       scores: { grounded: 4 } },
      { text: 'Yellow, peach, orange, soft pink',     scores: { joy: 4 } },
      { text: 'Blush, rose, ivory, pearl',            scores: { love: 4 } },
      { text: 'Moon beige, dusty blue, soft silver',  scores: { dream: 4 } },
      { text: 'White, pale green, light blue',        scores: { renewal: 4 } },
      { text: 'Sand, olive, ivory, muted gold',       scores: { balance: 4 } },
    ],
  },

  // ── Step 5: Lifestyle & Practical Fit ───────────────────────────────────
  {
    id: 9,
    section: 'lifestyle',
    text: 'What is your space like?',
    isPetsQuestion: false,
    options: [
      { text: 'I want to make it feel alive again',      scores: { return: 3 } },
      { text: 'I want it to feel fresh and growing',     scores: { growth: 3 } },
      { text: 'Small and minimal',                        scores: { stillness: 2, renewal: 1 } },
      { text: 'Cozy and warm',                            scores: { home: 3 } },
      { text: 'Green and natural',                        scores: { grounded: 3 } },
      { text: 'Colorful and expressive',                  scores: { joy: 3 } },
      { text: 'Romantic and soft',                        scores: { love: 3 } },
      { text: 'Quiet and dreamy',                         scores: { dream: 3 } },
      { text: 'Bright and airy',                          scores: { renewal: 3 } },
      { text: 'Organized and balanced',                   scores: { balance: 3 } },
    ],
  },
  {
    id: 10,
    section: 'lifestyle',
    text: 'How much care do you want the plant to need?',
    isPetsQuestion: false,
    options: [
      { text: 'Very easy, I need something that survives',          scores: { grounded: 2, stillness: 1 } },
      { text: 'I want to enjoy watching it grow',                    scores: { growth: 3 } },
      { text: 'I want plant care to feel like a calming ritual',    scores: { stillness: 2, grounded: 1 } },
      { text: 'I want something pretty and decorative',              scores: { home: 1, love: 1, joy: 1 } },
      { text: 'I want something unique and special',                 scores: { dream: 2, love: 1 } },
      { text: 'I want something fresh and clean-looking',            scores: { renewal: 2, balance: 1 } },
    ],
  },
  {
    id: 11,
    section: 'lifestyle',
    text: 'Do you have pets at home?',
    isPetsQuestion: true,
    options: [
      { text: 'Yes, I have pets',        scores: {}, petValue: 'yes' },
      { text: 'No pets',                 scores: {}, petValue: 'no' },
      { text: 'Sometimes pets visit',    scores: {}, petValue: 'sometimes' },
    ],
  },
  {
    id: 12,
    section: 'lifestyle',
    text: 'Choose the sentence that feels most like you.',
    isPetsQuestion: false,
    isFinale: true,
    options: [
      { text: '"I want to feel life again."',              scores: { return: 6 } },
      { text: '"I want to grow into something better."',  scores: { growth: 6 } },
      { text: '"I want quiet, softness, and peace."',     scores: { stillness: 6 } },
      { text: '"I want comfort, warmth, and care."',      scores: { home: 6 } },
      { text: '"I want to feel stable and rooted."',      scores: { grounded: 6 } },
      { text: '"I want something that makes me smile."',  scores: { joy: 6 } },
      { text: '"I want to feel loved and connected."',    scores: { love: 6 } },
      { text: '"I want to dream, imagine, and feel magic."', scores: { dream: 6 } },
      { text: '"I want a fresh start."',                  scores: { renewal: 6 } },
      { text: '"I want harmony, clarity, and balance."', scores: { balance: 6 } },
    ],
  },
]

// ── Collection result content ─────────────────────────────────────────────────

export const COLLECTIONS = {
  return: {
    id: 'return',
    name: 'Return',
    feeling: 'I want to feel alive again.',
    description:
      'Your answers feel like someone who is ready to reconnect with life again. You may be craving movement, color, warmth, and a gentle spark to bring your energy back.',
    packageName: 'The Return Package',
    plant: {
      any:      'Pothos or Fittonia — colorful, easy-care plant',
      petSafe:  'Fittonia or Spider Plant — colorful, pet-safe, easy-care',
    },
    candle: 'Citrus Bloom / Bergamot & Mint',
    addOn: 'Motivation card and bright dried flowers',
    shortLine: 'For the soul that is ready to feel alive again.',
    mood: 'Warm, bright, soulful',
    palette: ['#F4A261', '#E9C46A', '#E76F51'],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    feeling: 'I am becoming a better version of myself.',
    description:
      'Your answers feel like someone who is becoming. You may be in a season of learning, building, healing, and growing into a softer but stronger version of yourself.',
    packageName: 'The Growth Package',
    plant: {
      any:      'Pothos or Philodendron — small, growing plant',
      petSafe:  'Spider Plant or Peperomia — safe, growing plant',
    },
    candle: 'Green Tea / Fresh Herbs / Light Floral',
    addOn: 'Growth affirmation card and botanical wrapping',
    shortLine: 'For the soul that is slowly becoming.',
    mood: 'Fresh, hopeful, botanical',
    palette: ['#52B788', '#74C69D', '#D8F3DC'],
  },
  stillness: {
    id: 'stillness',
    name: 'Stillness',
    feeling: 'I need to slow down and breathe.',
    description:
      'Your answers show a need for calm, quiet moments, and space to slow down. You may be looking for softness, peace, and a gentle pause from the noise around you.',
    packageName: 'The Stillness Package',
    plant: {
      any:      'Peace Lily or Calathea — soft, green plant',
      petSafe:  'Calathea or Prayer Plant — calm, pet-safe plant',
    },
    candle: 'Lavender & Chamomile / Clean Cotton',
    addOn: 'Calm note, herbal tea, and soft neutral wrapping',
    shortLine: 'For the soul that needs peace, softness, and quiet.',
    mood: 'Soft, calm, peaceful',
    palette: ['#B7C4CF', '#D4E2D4', '#F0EAD6'],
  },
  home: {
    id: 'home',
    name: 'Home',
    feeling: 'I want to feel held and safe.',
    description:
      'Your answers feel warm, emotional, and full of care. You may be craving comfort, belonging, and the feeling of being held by something soft and familiar.',
    packageName: 'The Home Package',
    plant: {
      any:      'Peperomia or Pothos — warm, indoor plant',
      petSafe:  'Peperomia or Prayer Plant — cozy, pet-safe plant',
    },
    candle: 'Vanilla Amber / Cinnamon Soft',
    addOn: 'Handwritten note and cozy wrapping',
    shortLine: 'For the soul that needs warmth and belonging.',
    mood: 'Warm, cozy, familiar',
    palette: ['#CDB4DB', '#FFC8DD', '#FFAFCC'],
  },
  grounded: {
    id: 'grounded',
    name: 'Grounded',
    feeling: 'I need to feel stable again.',
    description:
      'Your answers feel like someone who needs stability, clarity, and a deeper connection to themselves. This package is made to bring you back to your center.',
    packageName: 'The Grounded Package',
    plant: {
      any:      'Snake Plant or ZZ Plant — earthy, stable plant',
      petSafe:  'Spider Plant or Areca Palm — sturdy, pet-safe plant',
    },
    candle: 'Cedarwood / Sage / Herbal Woods',
    addOn: 'Grounding card and natural textures',
    shortLine: 'For the soul that needs roots, balance, and safety.',
    mood: 'Earthy, natural, stable',
    palette: ['#6B705C', '#A5A58D', '#CB997E'],
  },
  joy: {
    id: 'joy',
    name: 'Joy',
    feeling: 'I want something that makes me smile.',
    description:
      'Your answers feel bright, playful, and full of life. You may be craving a cheerful moment, a reason to smile, or a gift that brings lightness into the day.',
    packageName: 'The Joy Package',
    plant: {
      any:      'Fittonia or colorful Pothos — cheerful, bright plant',
      petSafe:  'Fittonia or Calathea — colorful, pet-safe plant',
    },
    candle: 'Peach Bloom / Orange Blossom / Mango Citrus',
    addOn: 'Celebration card and colorful wrapping',
    shortLine: 'For the soul that wants happiness, color, and a smile.',
    mood: 'Sunny, cheerful, playful',
    palette: ['#FFD60A', '#FFA62B', '#FF6B6B'],
  },
  love: {
    id: 'love',
    name: 'Love',
    feeling: 'I want to feel loved and connected.',
    description:
      'Your answers feel tender, emotional, and deeply connected. You may be looking for something that says what words cannot — a soft gesture of affection, care, and closeness.',
    packageName: 'The Love Package',
    plant: {
      any:      'Anthurium or Pink Fittonia — romantic, soft plant',
      petSafe:  'Pink Fittonia or String of Hearts — gentle, pet-safe plant',
    },
    candle: 'Rose & Vanilla / Jasmine Musk / Peony Bloom',
    addOn: 'Love note, dried rose petals, and romantic wrapping',
    shortLine: 'For the soul that wants to give or receive love softly.',
    mood: 'Soft, romantic, tender',
    palette: ['#FFCCD5', '#FFB3C6', '#FF85A1'],
  },
  dream: {
    id: 'dream',
    name: 'Dream',
    feeling: 'I want to dream, imagine, and escape softly.',
    description:
      'Your answers feel imaginative, soft, and a little magical. You may be craving wonder, quiet beauty, and a gentle escape into something more poetic.',
    packageName: 'The Dream Package',
    plant: {
      any:      'String of Hearts or Calathea — soft, dreamy plant',
      petSafe:  'String of Hearts or Calathea — magical, pet-safe plant',
    },
    candle: 'Night Jasmine / Moonflower / Soft Musk',
    addOn: 'Dream card, moon-inspired wrapping, and soft dried flowers',
    shortLine: 'For the soul that wants softness, magic, and imagination.',
    mood: 'Magical, moonlit, soft mystery',
    palette: ['#ADB5BD', '#9DB4C0', '#C8B6E2'],
  },
  renewal: {
    id: 'renewal',
    name: 'Renewal',
    feeling: 'I want a fresh start.',
    description:
      'Your answers show a desire for a fresh start. You may be ready to clear old energy, breathe lighter, and begin a new chapter with softness and intention.',
    packageName: 'The Renewal Package',
    plant: {
      any:      'Spider Plant or fresh leafy plant — clean, small green plant',
      petSafe:  'Spider Plant — bright, air-purifying, pet-safe plant',
    },
    candle: 'Eucalyptus & Lemon / Fresh Linen / White Tea',
    addOn: 'Reset card and clean minimal wrapping',
    shortLine: 'For the soul that is ready for a new beginning.',
    mood: 'Clean, fresh, airy',
    palette: ['#D0F4DE', '#A9DEF9', '#FCF6BD'],
  },
  balance: {
    id: 'balance',
    name: 'Balance',
    feeling: 'I need harmony and clarity.',
    description:
      'Your answers feel centered and intentional. You may be looking for harmony, clarity, and a package that brings calm structure without losing softness.',
    packageName: 'The Balance Package',
    plant: {
      any:      'ZZ Plant or Peace Lily — balanced, low-care plant',
      petSafe:  'Peace Lily or Calathea — harmonious, pet-safe plant',
    },
    candle: 'White Tea / Soft Woods / Clean Musk',
    addOn: 'Balance card and elegant neutral wrapping',
    shortLine: 'For the soul that needs harmony, clarity, and calm direction.',
    mood: 'Centered, clear, elegant',
    palette: ['#E9EDC9', '#CCD5AE', '#B7B7A4'],
  },
}

// Section metadata for the step indicator
export const SECTION_LABELS = {
  purpose:   'Purpose',
  emotional: 'Emotional Need',
  mood:      'Mood & Atmosphere',
  scent:     'Scent & Style',
  lifestyle: 'Lifestyle & Practical',
}

import mongoose from 'mongoose'

const legacyBuilderProducts = [
  {
    name: 'Lavender Candle',
    productType: 'candles',
    candleCategory: 'essential',
    price: 650,
    shortDescription: 'Calming lavender for evening rituals.',
    description: 'A hand-poured lavender candle made for quiet evenings, soft light, and a calmer room rhythm.',
    story: 'Lavender Candle was created for the moment the room finally becomes yours again. Light it when the day has been too loud and let the scent turn your space into a softer place to land.',
    image: '/assets/candles.jpeg',
    tags: ['Floral', 'Relaxing', 'Handmade'],
  },
  {
    name: 'Vanilla Candle',
    productType: 'candles',
    candleCategory: 'signature',
    price: 620,
    shortDescription: 'Soft vanilla warmth with a creamy finish.',
    description: 'Warm vanilla, soft cream, and a gentle amber base that makes the whole package feel comforting.',
    story: 'Vanilla Candle is made for slow mornings, handwritten notes, and homes that feel tender without trying too hard.',
    image: '/assets/candles.jpeg',
    tags: ['Warm', 'Cozy', 'Soft'],
  },
  {
    name: 'Ocean Breeze Candle',
    productType: 'candles',
    candleCategory: 'art',
    price: 680,
    shortDescription: 'Fresh coastal air for bright spaces.',
    description: 'A clean coastal candle with sea air, white woods, and a fresh mineral finish.',
    story: 'Ocean Breeze was blended for open windows, clear thoughts, and the feeling of breathing a little deeper.',
    image: '/assets/candles.jpeg',
    tags: ['Fresh', 'Clean', 'Refreshing'],
  },
  {
    name: 'Snake Plant',
    productType: 'plants',
    candleCategory: '',
    price: 420,
    shortDescription: 'Low-maintenance structure for calm corners.',
    description: 'A sculptural, low-maintenance plant with strong upright leaves and a calm architectural presence.',
    story: 'Snake Plant is the steady friend of the package — resilient, elegant, and happy with simple care.',
    image: '/assets/plants.jpeg',
    tags: ['Easy Care', 'Airy', 'Minimal'],
  },
  {
    name: 'Monstera',
    productType: 'plants',
    candleCategory: '',
    price: 760,
    shortDescription: 'Lush statement leaves with tropical energy.',
    description: 'A bold botanical statement with generous leaves that brings a lush, premium feeling to the package.',
    story: 'Monstera was chosen for people who want their space to feel alive, expressive, and beautifully growing.',
    image: '/assets/plants.jpeg',
    tags: ['Botanical', 'Statement', 'Lush'],
  },
  {
    name: 'Peace Lily',
    productType: 'plants',
    candleCategory: '',
    price: 540,
    shortDescription: 'Soft white blooms for peaceful rooms.',
    description: 'A graceful plant with glossy leaves and white blooms that adds softness and quiet balance.',
    story: 'Peace Lily brings a quiet kind of beauty — simple, gentle, and made for rooms that need softness.',
    image: '/assets/plants.jpeg',
    tags: ['Floral', 'Elegant', 'Calm'],
  },
]

function normalizedName(name) {
  return name.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

function documentFor(product) {
  const now = new Date()
  const category = product.productType === 'candles'
    ? ['candles', product.candleCategory]
    : ['plants']
  const slugName = normalizedName(product.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    ...product,
    slug: `builder-${slugName}`,
    tagline: product.shortDescription,
    discount: 0,
    discountPrice: null,
    stock: 0,
    sku: '',
    category,
    subCategory: product.productType === 'candles' ? product.candleCategory : '',
    packageCategory: product.productType,
    catalogKey: `${product.productType}:${normalizedName(product.name)}`,
    brand: 'Drift & Bloom',
    images: [product.image],
    thumbnail: product.image,
    gallery: [],
    imagePublicIds: [''],
    colors: [],
    sizes: [],
    scent: '',
    mood: [],
    includes: [],
    plantOptions: [],
    featured: false,
    bestSeller: false,
    status: 'active',
    isActive: true,
    deletedAt: null,
    fishSubCategory: '',
    aquaticLifeType: '',
    fishKey: null,
    rating: 0,
    reviewsCount: 0,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  if (!apply) {
    console.info('Dry run: 6 legacy package-builder products are ready for idempotent migration.')
    console.info('Run `npm run migrate:builder-products -- --apply` to write missing records.')
    return
  }

  const uri = process.env.MONGODB_URI
  const expectedDatabase = process.env.EXPECTED_MONGODB_DATABASE
  if (!uri) throw new Error('MONGODB_URI is required.')
  if (!expectedDatabase) throw new Error('EXPECTED_MONGODB_DATABASE is required for a write migration.')

  await mongoose.connect(uri, { bufferCommands: false })
  try {
    const database = mongoose.connection.db
    if (!database || database.databaseName !== expectedDatabase) {
      throw new Error(`Refusing migration: connected database does not match EXPECTED_MONGODB_DATABASE (${expectedDatabase}).`)
    }

    const products = database.collection('products')
    const operations = legacyBuilderProducts.map((product) => {
      const document = documentFor(product)
      return {
        updateOne: {
          filter: { catalogKey: document.catalogKey, deletedAt: null },
          update: { $setOnInsert: document },
          upsert: true,
        },
      }
    })
    const result = await products.bulkWrite(operations, { ordered: true })
    const stored = await products.countDocuments({
      catalogKey: { $in: legacyBuilderProducts.map((product) => `${product.productType}:${normalizedName(product.name)}`) },
      deletedAt: null,
    })
    if (stored !== legacyBuilderProducts.length) throw new Error('Migration write verification failed.')

    console.info('Builder product migration complete.', {
      database: database.databaseName,
      inserted: result.upsertedCount,
      alreadyPresent: legacyBuilderProducts.length - result.upsertedCount,
      verified: stored,
    })
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

import mongoose from 'mongoose'

const execute = process.argv.includes('--execute')
const confirmation = process.env.FISH_MIGRATION_CONFIRMATION

const subAliases = new Map([
  ['aquarium', 'aquariums'],
  ['aquariums', 'aquariums'],
  ['tank', 'aquariums'],
  ['tanks', 'aquariums'],
  ['aquatic-life', 'aquatic-life'],
  ['aquatic life', 'aquatic-life'],
  ['aquaticlife', 'aquatic-life'],
])
const typeAliases = new Map([
  ['betta', 'betta-fish'],
  ['betta fish', 'betta-fish'],
  ['betta-fish', 'betta-fish'],
  ['shrimp', 'shrimp'],
  ['crab', 'crab'],
  ['pleco', 'pleco-fish'],
  ['pleco fish', 'pleco-fish'],
  ['pleco-fish', 'pleco-fish'],
])

const token = (value) => typeof value === 'string'
  ? value.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, ' ')
  : ''
const values = (value) => Array.isArray(value) ? value : [value].filter(Boolean)
const fishKey = (name) => name.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ')

function aquaticType(product) {
  for (const value of [product.aquaticLifeType, ...values(product.category), ...values(product.tags)]) {
    const normalized = typeAliases.get(token(value))
    if (normalized) return normalized
  }
  return null
}

function subCategory(product) {
  for (const value of [product.fishSubCategory, product.subCategory, ...values(product.category)]) {
    const normalized = subAliases.get(token(value))
    if (normalized) return normalized
  }
  if (aquaticType(product)) return 'aquatic-life'
  if (/\b(aquarium|tank)s?\b/i.test(`${product.name || ''} ${product.slug || ''}`)) return 'aquariums'
  return null
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
  if (execute && confirmation !== 'NORMALIZE_FISH_METADATA_ONLY') {
    throw new Error('Execution requires FISH_MIGRATION_CONFIRMATION=NORMALIZE_FISH_METADATA_ONLY.')
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
  const databaseName = mongoose.connection.db.databaseName
  const expectedDatabase = process.env.EXPECTED_MONGODB_DATABASE
  if (!expectedDatabase || databaseName !== expectedDatabase) {
    throw new Error('Migration requires EXPECTED_MONGODB_DATABASE to exactly match the connected database.')
  }
  const collection = mongoose.connection.db.collection('products')
  const products = await collection.find({
    $or: [
      { packageCategory: 'fish' },
      { fishSubCategory: { $exists: true, $ne: '' } },
      { category: { $in: ['fish', 'aquariums', 'aquatic-life'] } },
    ],
  }, {
    projection: {
      name: 1,
      slug: 1,
      category: 1,
      subCategory: 1,
      fishSubCategory: 1,
      aquaticLifeType: 1,
      tags: 1,
      status: 1,
      isActive: 1,
      deletedAt: 1,
    },
  }).toArray()

  const plans = products.map((product) => {
    const sub = subCategory(product)
    const lifeType = aquaticType(product)
    if (!sub || (sub === 'aquatic-life' && !lifeType)) {
      return { product, error: 'category could not be determined safely' }
    }
    const status = ['active', 'draft', 'out_of_stock'].includes(product.status)
      ? product.status
      : product.isActive === false ? 'draft' : 'active'
    return {
      product,
      update: {
        packageCategory: 'fish',
        fishSubCategory: sub,
        subCategory: sub,
        aquaticLifeType: sub === 'aquatic-life' ? lifeType : '',
        category: sub === 'aquatic-life' ? ['fish', sub, lifeType] : ['fish', sub],
        fishKey: fishKey(product.name || ''),
        status,
        isActive: !product.deletedAt && status === 'active',
        deletedAt: product.deletedAt || null,
      },
    }
  })

  const unresolved = plans.filter((plan) => plan.error)
  const keys = new Map()
  for (const plan of plans.filter((item) => item.update)) {
    const key = plan.update.fishKey
    keys.set(key, [...(keys.get(key) || []), plan.product._id.toString()])
  }
  const duplicates = [...keys.entries()].filter(([, ids]) => ids.length > 1)

  console.log(JSON.stringify({
    mode: execute ? 'execute' : 'dry-run',
    database: mongoose.connection.db.databaseName,
    matched: products.length,
    ready: plans.length - unresolved.length,
    unresolved: unresolved.map((plan) => ({ id: plan.product._id, name: plan.product.name, reason: plan.error })),
    duplicateKeys: duplicates.map(([key, ids]) => ({ key, ids })),
    changes: plans.filter((plan) => plan.update).map((plan) => ({
      id: plan.product._id,
      name: plan.product.name,
      fishSubCategory: plan.update.fishSubCategory,
      aquaticLifeType: plan.update.aquaticLifeType,
      status: plan.update.status,
    })),
  }, null, 2))

  if (unresolved.length || duplicates.length) {
    throw new Error('Migration stopped without writes because records require manual review.')
  }

  if (execute) {
    if (plans.length) {
      await collection.bulkWrite(plans.map((plan) => ({
        updateOne: {
          filter: { _id: plan.product._id },
          update: { $set: plan.update },
        },
      })), { ordered: true })
    }
    await collection.createIndex(
      { fishKey: 1 },
      {
        unique: true,
        partialFilterExpression: { fishKey: { $type: 'string' } },
        name: 'unique_fish_product_name',
      },
    )
    await collection.createIndex(
      { packageCategory: 1, deletedAt: 1, isActive: 1, createdAt: -1 },
    )
    console.log(`Applied ${plans.length} metadata updates without deleting or reseeding any records.`)
  }

  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(error.message)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})

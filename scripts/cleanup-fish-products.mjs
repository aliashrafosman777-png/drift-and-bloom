/**
 * Cleanup script: Remove all fish products from MongoDB
 * EXCEPT Mini Aquarium, Medium Aquarium, Premium Aquarium.
 * 
 * Run with: node scripts/cleanup-fish-products.mjs
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const KEEP_NAMES = ['mini aquarium', 'medium aquarium', 'premium aquarium']

// Parse .env.local manually
function loadEnv() {
  try {
    const envFile = readFileSync(resolve('.env.local'), 'utf8')
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch (e) {
    console.error('Could not load .env.local:', e.message)
  }
}

async function main() {
  loadEnv()
  
  const mongoose = (await import('mongoose')).default

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local')
    process.exit(1)
  }

  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('Connected!')

  const db = mongoose.connection.db
  const collection = db.collection('products')

  // Find all fish products
  const fishProducts = await collection.find({
    $or: [
      { packageCategory: 'fish' },
      { category: { $in: ['fish', 'aquariums', 'aquatic-life'] } },
      { fishSubCategory: { $exists: true, $ne: '' } },
    ]
  }).toArray()

  console.log(`\nFound ${fishProducts.length} fish products in MongoDB:`)

  for (const p of fishProducts) {
    const name = p.name || '(no name)'
    const nameLC = name.trim().toLowerCase()
    const shouldKeep = KEEP_NAMES.includes(nameLC)
    console.log(`  ${shouldKeep ? '✅ KEEP' : '❌ DELETE'}: "${name}" (id: ${p._id}, active: ${p.isActive})`)

    if (!shouldKeep) {
      await collection.updateOne(
        { _id: p._id },
        { $set: { isActive: false } }
      )
      console.log(`    → Set isActive=false for "${name}"`)
    }
  }

  // Verify remaining active fish products
  const remaining = await collection.find({
    $or: [
      { packageCategory: 'fish' },
      { category: { $in: ['fish', 'aquariums', 'aquatic-life'] } },
      { fishSubCategory: { $exists: true, $ne: '' } },
    ],
    isActive: true
  }).toArray()

  console.log(`\nRemaining active fish products: ${remaining.length}`)
  for (const p of remaining) {
    console.log(`  ✅ "${p.name}" (${p.fishSubCategory || 'N/A'} / ${p.aquaticLifeType || 'N/A'})`)
  }

  await mongoose.disconnect()
  console.log('\nDone! MongoDB disconnected.')
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})

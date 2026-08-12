import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'

const execute = process.argv.includes('--execute')

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
  if (execute && process.env.IMAGE_MIGRATION_CONFIRMATION !== 'MOVE_DATA_URLS_TO_CLOUDINARY') {
    throw new Error('Execution requires IMAGE_MIGRATION_CONFIRMATION=MOVE_DATA_URLS_TO_CLOUDINARY.')
  }
  if (execute) {
    for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
      if (!process.env[key]) throw new Error(`${key} is required.`)
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
  const collection = mongoose.connection.db.collection('products')
  const cursor = collection.find({
    $or: [
      { image: /^data:/i },
      { thumbnail: /^data:/i },
      { images: { $elemMatch: { $regex: /^data:/i } } },
      { gallery: { $elemMatch: { $regex: /^data:/i } } },
    ],
  }, { projection: { name: 1, image: 1, thumbnail: 1, images: 1, gallery: 1, imagePublicIds: 1 } })

  let matched = 0
  let migrated = 0
  for await (const product of cursor) {
    matched += 1
    const sources = [product.image, product.thumbnail, ...(product.images || []), ...(product.gallery || [])]
      .filter((value, index, all) => typeof value === 'string' && /^data:/i.test(value) && all.indexOf(value) === index)
    console.log(`${execute ? 'Migrating' : 'Would migrate'} ${product._id} (${product.name || 'unnamed'}): ${sources.length} embedded image(s).`)
    if (!execute) continue

    const replacements = new Map()
    const publicIds = [...(product.imagePublicIds || [])]
    for (const source of sources) {
      const result = await cloudinary.uploader.upload(source, {
        folder: 'drift-and-bloom/products',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      })
      replacements.set(source, result.secure_url)
      publicIds.push(result.public_id)
    }

    const replace = (value) => replacements.get(value) || value
    const image = replace(product.image || '')
    const images = (product.images || []).map(replace)
    const gallery = (product.gallery || []).map(replace)
    const thumbnail = replace(product.thumbnail || '') || image || images[0] || ''
    await collection.updateOne(
      { _id: product._id },
      { $set: { image, thumbnail, images, gallery, imagePublicIds: [...new Set(publicIds)] } },
    )
    migrated += 1
  }

  console.log(JSON.stringify({ mode: execute ? 'execute' : 'dry-run', matched, migrated }, null, 2))
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(error.message)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})

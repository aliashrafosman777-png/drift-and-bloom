import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'

const BUCKET_NAME = 'productImages'
const PUBLIC_ID_PREFIX = 'mongodb:'

export type StoredProductImage = {
  id: string
  publicId: string
  url: string
  contentType: string
  length: number
  uploadDate: Date
  filename: string
}

function database() {
  const db = mongoose.connection.db
  if (!db) throw new Error('MongoDB image storage is not connected.')
  return db
}

function bucket() {
  return new mongoose.mongo.GridFSBucket(database(), { bucketName: BUCKET_NAME })
}

function objectIdFromValue(value: string) {
  const id = value.startsWith(PUBLIC_ID_PREFIX)
    ? value.slice(PUBLIC_ID_PREFIX.length)
    : value
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
}

function safeFilename(filename: string) {
  const normalized = filename.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-')
  return normalized.slice(0, 120) || 'product-image'
}

function serializeFile(file: mongoose.mongo.GridFSFile): StoredProductImage {
  const id = file._id.toString()
  const metadata = (file.metadata || {}) as Record<string, unknown>
  return {
    id,
    publicId: `${PUBLIC_ID_PREFIX}${id}`,
    url: `/api/images/${id}`,
    contentType: String(metadata.contentType || 'application/octet-stream'),
    length: file.length,
    uploadDate: file.uploadDate,
    filename: file.filename,
  }
}

export async function storeProductImage(input: {
  bytes: Buffer
  contentType: string
  filename: string
  uploadedBy: string
}): Promise<StoredProductImage> {
  await connectDB()
  const id = new mongoose.Types.ObjectId()
  const upload = bucket().openUploadStreamWithId(id, safeFilename(input.filename), {
    metadata: {
      contentType: input.contentType,
      uploadedBy: input.uploadedBy,
      storage: 'mongodb-gridfs',
    },
  })

  await pipeline(Readable.from(input.bytes), upload)
  const stored = await bucket().find({ _id: id }).limit(1).next()
  if (!stored) throw new Error('The image upload completed without a stored file record.')
  return serializeFile(stored)
}

export async function readProductImage(id: string) {
  const objectId = objectIdFromValue(id)
  if (!objectId) return null

  await connectDB()
  const file = await bucket().find({ _id: objectId }).limit(1).next()
  if (!file) return null

  const chunks: Buffer[] = []
  for await (const chunk of bucket().openDownloadStream(objectId)) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return {
    file: serializeFile(file),
    bytes: Buffer.concat(chunks),
  }
}

export async function deleteUnreferencedProductImages(publicIds: string[]) {
  const uniqueIds = Array.from(new Set(
    publicIds.filter((value) => typeof value === 'string' && value.startsWith(PUBLIC_ID_PREFIX)),
  ))
  if (!uniqueIds.length) return { deleted: 0, retained: 0 }

  await connectDB()
  let deleted = 0
  let retained = 0

  for (const publicId of uniqueIds) {
    const objectId = objectIdFromValue(publicId)
    if (!objectId) continue

    const referenced = await database().collection('products').countDocuments(
      { imagePublicIds: publicId, deletedAt: null },
      { limit: 1 },
    )
    if (referenced) {
      retained += 1
      continue
    }

    try {
      await bucket().delete(objectId)
      deleted += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!/FileNotFound/i.test(message)) throw error
    }
  }

  return { deleted, retained }
}

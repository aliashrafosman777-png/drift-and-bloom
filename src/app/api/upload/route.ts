import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/middleware/auth'
import {
  deleteUnreferencedProductImages,
  storeProductImage,
} from '@/lib/productImageStorage'
import { successResponse, errorResponse, withNoStore } from '@/utils/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

// Vercel rejects request bodies above 4.5 MB before a function can read them.
// Four MB leaves room for multipart headers while still allowing detailed images.
export const MAX_PRODUCT_IMAGE_BYTES = 4 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

function hasImageSignature(bytes: Buffer, contentType: string) {
  if (contentType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  if (contentType === 'image/png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  }
  if (contentType === 'image/webp') {
    return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
  }
  if (contentType === 'image/avif') {
    if (bytes.length < 12 || bytes.toString('ascii', 4, 8) !== 'ftyp') return false
    const brand = bytes.toString('ascii', 8, 12)
    return brand === 'avif' || brand === 'avis'
  }
  return false
}

function logUploadError(operation: string, requestId: string, error: unknown) {
  const err = error as { name?: string; message?: string; code?: number | string }
  console.error(`[uploads.${operation}]`, {
    requestId,
    errorName: err?.name || 'UnknownError',
    errorCode: err?.code,
    message: String(err?.message || 'Unknown error').slice(0, 500),
  })
}

/** POST /api/upload — store one validated product image in MongoDB GridFS. */
export async function POST(req: NextRequest) {
  const requestId = randomUUID()
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return withNoStore(auth)

    const contentLength = Number(req.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_PRODUCT_IMAGE_BYTES + 64 * 1024) {
      return withNoStore(errorResponse('Image is too large. Maximum size is 4 MB.', 413))
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return withNoStore(errorResponse('No image file was provided.', 400))
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return withNoStore(errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP, AVIF.', 400))
    }
    if (file.size === 0) {
      return withNoStore(errorResponse('The selected image is empty.', 400))
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      return withNoStore(errorResponse('Image is too large. Maximum size is 4 MB.', 413))
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!hasImageSignature(buffer, file.type)) {
      return withNoStore(errorResponse('The selected file is not a valid image.', 400))
    }

    const result = await storeProductImage({
      bytes: buffer,
      contentType: file.type,
      filename: file.name,
      uploadedBy: auth.userId,
    })

    console.info('[uploads.create]', {
      requestId,
      publicId: result.publicId,
      bytes: result.length,
      storage: 'mongodb-gridfs',
    })

    return withNoStore(successResponse(
      {
        url: result.url,
        publicId: result.publicId,
        contentType: result.contentType,
        bytes: result.length,
      },
      'Image uploaded successfully.',
      201,
    ))
  } catch (error) {
    logUploadError('create', requestId, error)
    return withNoStore(errorResponse(
      `The image could not be saved. Please retry. Reference: ${requestId.slice(0, 8)}.`,
      500,
    ))
  }
}

/** DELETE /api/upload?publicId=... — remove an unreferenced upload after a failed save. */
export async function DELETE(req: NextRequest) {
  const requestId = randomUUID()
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return withNoStore(auth)

    const publicId = new URL(req.url).searchParams.get('publicId') || ''
    if (!publicId.startsWith('mongodb:')) {
      return withNoStore(errorResponse('A valid stored image identifier is required.', 400))
    }

    const result = await deleteUnreferencedProductImages([publicId])
    if (result.retained) {
      return withNoStore(errorResponse('The image is currently used by a product.', 409))
    }

    console.info('[uploads.delete]', { requestId, publicId, deleted: result.deleted })
    return withNoStore(successResponse(null, 'Unused image removed.'))
  } catch (error) {
    logUploadError('delete', requestId, error)
    return withNoStore(errorResponse('The unused image could not be removed.', 500))
  }
}

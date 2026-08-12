import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { authenticateAdmin } from '@/middleware/auth'
import cloudinary from '@/lib/cloudinary'
import { successResponse, errorResponse, withNoStore } from '@/utils/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/upload
 * Admin-protected — upload an image to Cloudinary.
 * Accepts multipart/form-data with a `file` field.
 */
export async function POST(req: NextRequest) {
  const requestId = randomUUID()
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return withNoStore(auth)

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error('[uploads.create]', { requestId, message: 'Durable image storage is not configured.' })
      return withNoStore(errorResponse('Image storage is temporarily unavailable.', 503))
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return withNoStore(errorResponse('No file provided.', 400))
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      return withNoStore(errorResponse(
        'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF.',
        400
      ))
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return withNoStore(errorResponse('File too large. Maximum size is 5MB.', 400))
    }

    // Convert file to base64 data URL for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'drift-and-bloom/products',
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })

    console.info('[uploads.create]', {
      requestId,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })

    return withNoStore(successResponse(
      {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
      'Image uploaded successfully.',
      201
    ))
  } catch (error) {
    const err = error as { name?: string; message?: string }
    console.error('[uploads.create]', {
      requestId,
      errorName: err?.name || 'UnknownError',
      message: err?.message || 'Unknown error',
    })
    return withNoStore(errorResponse('Failed to upload image.', 500))
  }
}

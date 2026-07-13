import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/middleware/auth'
import cloudinary from '@/lib/cloudinary'
import { successResponse, errorResponse } from '@/utils/apiResponse'

/**
 * POST /api/upload
 * Admin-protected — upload an image to Cloudinary.
 * Accepts multipart/form-data with a `file` field.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return errorResponse('No file provided.', 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF.',
        400
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 5MB.', 400)
    }

    // Convert file to base64 data URL for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'drift-and-bloom',
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })

    return successResponse(
      {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
      'Image uploaded successfully.',
      201
    )
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse('Failed to upload image.', 500)
  }
}

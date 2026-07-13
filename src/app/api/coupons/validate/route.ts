import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import { validateCouponSchema } from '@/validation/coupon'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

/**
 * POST /api/coupons/validate
 * Public — validate a coupon code and return discount info.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const parsed = validateCouponSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const coupon = await Coupon.findOne({
      code: parsed.data.code,
      isActive: true,
    }).lean()

    if (!coupon) {
      return errorResponse('Invalid or inactive coupon code.', 404)
    }

    // Check expiration
    if (new Date(coupon.expirationDate) < new Date()) {
      return errorResponse('This coupon has expired.', 410)
    }

    return successResponse({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    }, 'Coupon is valid.')
  } catch (error) {
    console.error('Validate coupon error:', error)
    return errorResponse('Failed to validate coupon.', 500)
  }
}

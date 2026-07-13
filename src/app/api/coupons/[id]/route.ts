import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import { authenticateAdmin } from '@/middleware/auth'
import { createCouponSchema } from '@/validation/coupon'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/coupons/[id]
 * Admin-protected — update a coupon.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const parsed = createCouponSchema.partial().safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const coupon = await Coupon.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).lean()

    if (!coupon) {
      return errorResponse('Coupon not found.', 404)
    }

    return successResponse(coupon, 'Coupon updated successfully.')
  } catch (error) {
    console.error('Update coupon error:', error)
    return errorResponse('Failed to update coupon.', 500)
  }
}

/**
 * DELETE /api/coupons/[id]
 * Admin-protected — delete a coupon.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const coupon = await Coupon.findByIdAndDelete(id).lean()

    if (!coupon) {
      return errorResponse('Coupon not found.', 404)
    }

    return successResponse(null, 'Coupon deleted successfully.')
  } catch (error) {
    console.error('Delete coupon error:', error)
    return errorResponse('Failed to delete coupon.', 500)
  }
}

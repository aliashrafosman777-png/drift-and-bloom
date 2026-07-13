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

/**
 * GET /api/coupons
 * Admin-protected — list all coupons.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    return successResponse(coupons)
  } catch (error) {
    console.error('Get coupons error:', error)
    return errorResponse('Failed to fetch coupons.', 500)
  }
}

/**
 * POST /api/coupons
 * Admin-protected — create a coupon.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const body = await req.json()
    const parsed = createCouponSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const existing = await Coupon.findOne({ code: parsed.data.code })
    if (existing) {
      return errorResponse('A coupon with this code already exists.', 409)
    }

    const coupon = await Coupon.create(parsed.data)
    return successResponse(coupon, 'Coupon created successfully.', 201)
  } catch (error) {
    console.error('Create coupon error:', error)
    return errorResponse('Failed to create coupon.', 500)
  }
}

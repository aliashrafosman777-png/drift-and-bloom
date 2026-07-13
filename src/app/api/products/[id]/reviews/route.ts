import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/Product'
import { authenticate } from '@/middleware/auth'
import { createReviewSchema } from '@/validation/review'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/products/[id]/reviews
 * Public — paginated reviews for a product.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find({ product: id })
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: id }),
    ])

    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return errorResponse('Failed to fetch reviews.', 500)
  }
}

/**
 * POST /api/products/[id]/reviews
 * Auth-protected — create a review and update product rating.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticate(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const parsed = createReviewSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return errorResponse('Product not found.', 404)
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      user: auth.userId,
      product: id,
    })
    if (existingReview) {
      return errorResponse('You have already reviewed this product.', 409)
    }

    const review = await Review.create({
      user: auth.userId,
      product: id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    })

    // Update product rating and review count
    const allReviews = await Review.find({ product: id })
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Product.findByIdAndUpdate(id, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: allReviews.length,
    })

    return successResponse(review, 'Review submitted successfully.', 201)
  } catch (error) {
    console.error('Create review error:', error)
    return errorResponse('Failed to submit review.', 500)
  }
}

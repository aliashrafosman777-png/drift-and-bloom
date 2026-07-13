import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { authenticateAdmin } from '@/middleware/auth'
import { createCategorySchema } from '@/validation/category'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

/**
 * GET /api/categories
 * Public — list all categories.
 */
export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find()
      .populate('parentCategory', 'name slug')
      .sort({ name: 1 })
      .lean()

    return successResponse(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse('Failed to fetch categories.', 500)
  }
}

/**
 * POST /api/categories
 * Admin-protected — create a new category.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const body = await req.json()
    const parsed = createCategorySchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const slug = slugify(parsed.data.name, { lower: true, strict: true })

    const existing = await Category.findOne({ slug })
    if (existing) {
      return errorResponse('A category with this name already exists.', 409)
    }

    const category = await Category.create({
      ...parsed.data,
      slug,
    })

    return successResponse(category, 'Category created successfully.', 201)
  } catch (error) {
    console.error('Create category error:', error)
    return errorResponse('Failed to create category.', 500)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { authenticateAdmin } from '@/middleware/auth'
import { updateCategorySchema } from '@/validation/category'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/categories/[id]
 * Public — get a single category.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const { id } = await params

    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug')
      .lean()

    if (!category) {
      return errorResponse('Category not found.', 404)
    }

    return successResponse(category)
  } catch (error) {
    console.error('Get category error:', error)
    return errorResponse('Failed to fetch category.', 500)
  }
}

/**
 * PUT /api/categories/[id]
 * Admin-protected — update a category.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const parsed = updateCategorySchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const category = await Category.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).lean()

    if (!category) {
      return errorResponse('Category not found.', 404)
    }

    return successResponse(category, 'Category updated successfully.')
  } catch (error) {
    console.error('Update category error:', error)
    return errorResponse('Failed to update category.', 500)
  }
}

/**
 * DELETE /api/categories/[id]
 * Admin-protected — delete a category.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const category = await Category.findByIdAndDelete(id).lean()

    if (!category) {
      return errorResponse('Category not found.', 404)
    }

    return successResponse(null, 'Category deleted successfully.')
  } catch (error) {
    console.error('Delete category error:', error)
    return errorResponse('Failed to delete category.', 500)
  }
}

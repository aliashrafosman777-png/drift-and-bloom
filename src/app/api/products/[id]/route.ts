import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { authenticateAdmin } from '@/middleware/auth'
import { updateProductSchema } from '@/validation/product'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/products/[id]
 * Public — find by MongoDB _id or slug.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = await params

    // Try to find by _id first, then by slug
    let product
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findOne({ _id: id, isActive: true }).lean()
    }
    if (!product) {
      product = await Product.findOne({ slug: id, isActive: true }).lean()
    }

    if (!product) {
      return errorResponse('Product not found.', 404)
    }

    return successResponse(product)
  } catch (error) {
    console.error('Get product error:', error)
    return errorResponse('Failed to fetch product.', 500)
  }
}

/**
 * PUT /api/products/[id]
 * Admin-protected — update a product.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const product = await Product.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).lean()

    if (!product) {
      return errorResponse('Product not found.', 404)
    }

    return successResponse(product, 'Product updated successfully.')
  } catch (error) {
    console.error('Update product error:', error)
    return errorResponse('Failed to update product.', 500)
  }
}

/**
 * DELETE /api/products/[id]
 * Admin-protected — soft delete (set isActive to false).
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean()

    if (!product) {
      return errorResponse('Product not found.', 404)
    }

    return successResponse(null, 'Product deleted successfully.')
  } catch (error) {
    console.error('Delete product error:', error)
    return errorResponse('Failed to delete product.', 500)
  }
}

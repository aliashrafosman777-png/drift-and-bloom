import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { authenticateAdmin } from '@/middleware/auth'
import { createProductSchema } from '@/validation/product'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

/**
 * GET /api/products
 * Public — supports pagination, search, sorting, and filtering.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true }

    // Category filter
    const category = searchParams.get('category')
    if (category && category !== 'all') {
      filter.category = category
    }

    // Price range
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    // Featured / Best Seller
    const featured = searchParams.get('featured')
    if (featured === 'true') {
      filter.bestSeller = true
    }

    // Search
    const search = searchParams.get('search')
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
      ]
    }

    // Package category (for build-your-package products)
    const packageCategory = searchParams.get('packageCategory')
    if (packageCategory) {
      filter.packageCategory = packageCategory
    }

    // Sorting
    const sort = searchParams.get('sort') || 'featured'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortQuery: Record<string, any> = { createdAt: -1 }

    switch (sort) {
      case 'price-asc':
        sortQuery = { price: 1 }
        break
      case 'price-desc':
        sortQuery = { price: -1 }
        break
      case 'rating':
        sortQuery = { rating: -1 }
        break
      case 'newest':
        sortQuery = { createdAt: -1 }
        break
      case 'best-selling':
        sortQuery = { reviewsCount: -1 }
        break
      case 'featured':
      default:
        sortQuery = { bestSeller: -1, rating: -1 }
        break
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ])

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return errorResponse('Failed to fetch products.', 500)
  }
}

/**
 * POST /api/products
 * Admin-protected — create a new product.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const data = parsed.data

    // Generate slug
    let slug = slugify(data.name, { lower: true, strict: true })

    // Ensure unique slug
    const existingSlug = await Product.findOne({ slug })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await Product.create({
      ...data,
      slug,
      image: data.image || data.images?.[0] || '',
      thumbnail: data.thumbnail || data.image || data.images?.[0] || '',
    })

    return successResponse(product, 'Product created successfully.', 201)
  } catch (error) {
    console.error('Create product error:', error)
    return errorResponse('Failed to create product.', 500)
  }
}

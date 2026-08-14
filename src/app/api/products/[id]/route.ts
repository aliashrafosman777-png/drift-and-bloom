import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import { deleteUnreferencedProductImages } from '@/lib/productImageStorage'
import {
  buildFishCategories,
  buildFishKey,
  normalizeAquaticLifeType,
  normalizeFishSubCategory,
  safeProductImage,
  statusIsStorefrontVisible,
} from '@/lib/fishProducts'
import Product from '@/models/Product'
import { authenticateAdmin } from '@/middleware/auth'
import { updateProductSchema } from '@/validation/product'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  withNoStore,
} from '@/utils/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RouteParams {
  params: Promise<{ id: string }>
}

function logServerError(operation: string, requestId: string, error: unknown) {
  const err = error as { name?: string; message?: string; code?: number }
  console.error(`[products.${operation}]`, {
    requestId,
    errorName: err?.name || 'UnknownError',
    errorCode: err?.code,
    message: err?.message || 'Unknown error',
  })
}

async function cleanupRemovedImages(requestId: string, publicIds: unknown) {
  const ids = Array.isArray(publicIds)
    ? publicIds.filter((value): value is string => typeof value === 'string' && value !== '')
    : []
  if (!ids.length) return

  try {
    const result = await deleteUnreferencedProductImages(ids)
    if (result.deleted) {
      console.info('[products.imageCleanup]', { requestId, deleted: result.deleted })
    }
  } catch (error) {
    // The product mutation already committed. Log cleanup failures without
    // incorrectly reporting that the product save itself failed.
    logServerError('imageCleanup', requestId, error)
  }
}

function serializeProduct(product: Record<string, unknown>) {
  const fish = product.packageCategory === 'fish'
  const fallback = fish ? '/assets/fishs.jpeg' : '/assets/package.png'
  return {
    ...product,
    image: safeProductImage(product.image, fallback),
    thumbnail: safeProductImage(product.thumbnail, fallback),
    images: Array.isArray(product.images)
      ? product.images.filter((value) => typeof value === 'string' && !/^data:/i.test(value))
      : [],
    gallery: Array.isArray(product.gallery)
      ? product.gallery.filter((value) => typeof value === 'string' && !/^data:/i.test(value))
      : [],
  }
}

/** GET /api/products/[id] - public active product lookup by id or slug. */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const requestId = randomUUID()
  try {
    await connectDB()
    const { id } = await params
    const identity = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id }
    const product = await Product.findOne({ ...identity, isActive: true, deletedAt: null }).lean()

    if (!product) return withNoStore(errorResponse('Product not found.', 404))
    return withNoStore(successResponse(serializeProduct(product as unknown as Record<string, unknown>)))
  } catch (error) {
    logServerError('get', requestId, error)
    return withNoStore(errorResponse('Failed to fetch product.', 500))
  }
}

/** PUT /api/products/[id] - admin-only, version-aware update. */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const requestId = randomUUID()
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return withNoStore(auth)

    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return withNoStore(errorResponse('A valid stable product identifier is required.', 400))
    }

    await connectDB()
    const body = await req.json() as Record<string, unknown>
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) return withNoStore(validationErrorResponse(parsed.error))

    const existing = await Product.findOne({ _id: id, deletedAt: null }).lean()
    if (!existing) return withNoStore(errorResponse('Product not found.', 404))

    const { version } = parsed.data
    const requestedChanges = Object.fromEntries(
      Object.entries(parsed.data).filter(([key]) => key !== 'version' && Object.hasOwn(body, key)),
    )
    const isFish = existing.packageCategory === 'fish'
    if (isFish && version === undefined) {
      return withNoStore(errorResponse('The current product version is required.', 428))
    }

    const changes: Record<string, unknown> = { ...requestedChanges }
    if (isFish) {
      const merged = { ...existing, ...changes }
      const fishSubCategory = normalizeFishSubCategory(
        merged.fishSubCategory || merged.subCategory,
        merged.category,
      )
      const aquaticLifeType = normalizeAquaticLifeType(
        merged.aquaticLifeType,
        merged.category,
        merged.tags,
      )

      if (!fishSubCategory) {
        return withNoStore(errorResponse('Fish products require a valid fish sub-category.', 400))
      }
      if (fishSubCategory === 'aquatic-life' && !aquaticLifeType) {
        return withNoStore(errorResponse('Aquatic Life products require a valid aquatic life type.', 400))
      }

      const status = (merged.status || (merged.isActive ? 'active' : 'draft')) as
        | 'active'
        | 'draft'
        | 'out_of_stock'
      changes.packageCategory = 'fish'
      changes.fishSubCategory = fishSubCategory
      changes.subCategory = fishSubCategory
      changes.aquaticLifeType = fishSubCategory === 'aquatic-life' ? aquaticLifeType : ''
      changes.category = buildFishCategories(fishSubCategory, aquaticLifeType)
      changes.fishKey = buildFishKey(String(merged.name))
      changes.status = status
      changes.isActive = statusIsStorefrontVisible(status)
    } else if (changes.status) {
      changes.isActive = statusIsStorefrontVisible(
        changes.status as 'active' | 'draft' | 'out_of_stock',
      )
    }

    const query: Record<string, unknown> = { _id: id, deletedAt: null }
    if (version !== undefined) query.__v = version

    const product = await Product.findOneAndUpdate(
      query,
      { $set: changes, $inc: { __v: 1 } },
      { returnDocument: 'after', runValidators: true },
    ).lean()

    if (!product) {
      return withNoStore(errorResponse(
        'This product was changed by another administrator. Reload and review the latest version.',
        409,
      ))
    }

    console.info('[products.update]', {
      requestId,
      productId: id,
      version: product.__v,
    })

    const nextPublicIds = Array.isArray(product.imagePublicIds) ? product.imagePublicIds : []
    const removedPublicIds = Array.isArray(existing.imagePublicIds)
      ? existing.imagePublicIds.filter((publicId) => !nextPublicIds.includes(publicId))
      : []
    await cleanupRemovedImages(requestId, removedPublicIds)

    return withNoStore(successResponse(
      serializeProduct(product as unknown as Record<string, unknown>),
      'Product updated successfully.',
    ))
  } catch (error) {
    const mongoError = error as { code?: number }
    if (mongoError?.code === 11000) {
      return withNoStore(errorResponse('A fish product with this name already exists.', 409))
    }
    logServerError('update', requestId, error)
    return withNoStore(errorResponse('Failed to update product.', 500))
  }
}

/** DELETE /api/products/[id] - admin-only soft delete with version check. */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const requestId = randomUUID()
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return withNoStore(auth)

    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return withNoStore(errorResponse('A valid stable product identifier is required.', 400))
    }

    await connectDB()
    const existing = await Product.findOne({ _id: id, deletedAt: null })
      .select('_id packageCategory imagePublicIds __v')
      .lean()
    if (!existing) return withNoStore(errorResponse('Product not found.', 404))

    const rawVersion = new URL(req.url).searchParams.get('version')
    const version = rawVersion === null ? undefined : Number(rawVersion)
    if (existing.packageCategory === 'fish' && (!Number.isInteger(version) || Number(version) < 0)) {
      return withNoStore(errorResponse('The current product version is required.', 428))
    }

    const query: Record<string, unknown> = { _id: id, deletedAt: null }
    if (version !== undefined) query.__v = version

    const product = await Product.findOneAndUpdate(
      query,
      {
        $set: { deletedAt: new Date(), isActive: false, status: 'draft' },
        $inc: { __v: 1 },
      },
      { returnDocument: 'after' },
    ).lean()

    if (!product) {
      return withNoStore(errorResponse(
        'This product was changed by another administrator. Reload and review the latest version.',
        409,
      ))
    }


    console.info('[products.delete]', {
      requestId,
      productId: id,
      version: product.__v,
    })

    await cleanupRemovedImages(requestId, existing.imagePublicIds)

    return withNoStore(successResponse(null, 'Product deleted successfully.'))
  } catch (error) {
    logServerError('delete', requestId, error)
    return withNoStore(errorResponse('Failed to delete product.', 500))
  }
}

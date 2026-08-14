import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'
import connectDB from '@/lib/mongodb'
import {
  buildFishCategories,
  buildFishKey,
  inferLegacyFishSubCategory,
  normalizeAquaticLifeType,
  normalizeFishSubCategory,
  statusIsStorefrontVisible,
} from '@/lib/fishProducts'
import Product from '@/models/Product'
import { authenticateAdmin } from '@/middleware/auth'
import { createProductSchema } from '@/validation/product'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  withNoStore,
} from '@/utils/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DATA_URL_PATTERN = '^data:'

function parsePositiveInteger(value: string | null, fallback: number, maximum?: number) {
  const parsed = Number.parseInt(value || '', 10)
  const positive = Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
  return maximum ? Math.min(maximum, positive) : positive
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function durableImageProjection() {
  return {
    $let: {
      vars: {
        // Legacy records may contain arrays/objects in image fields. MongoDB's
        // $regexMatch throws for non-string input, so normalize the type before
        // checking for embedded data URLs. A single malformed inactive record
        // must never make the entire authenticated admin listing fail.
        imageValue: {
          $cond: [
            { $eq: [{ $type: '$image' }, 'string'] },
            '$image',
            '',
          ],
        },
        thumbnailValue: {
          $cond: [
            { $eq: [{ $type: '$thumbnail' }, 'string'] },
            '$thumbnail',
            '',
          ],
        },
      },
      in: {
        $cond: [
          {
            $and: [
              { $ne: ['$$imageValue', ''] },
              { $not: [{ $regexMatch: { input: '$$imageValue', regex: DATA_URL_PATTERN, options: 'i' } }] },
            ],
          },
          '$$imageValue',
          {
            $cond: [
              {
                $and: [
                  { $ne: ['$$thumbnailValue', ''] },
                  { $not: [{ $regexMatch: { input: '$$thumbnailValue', regex: DATA_URL_PATTERN, options: 'i' } }] },
                ],
              },
              '$$thumbnailValue',
              '',
            ],
          },
        ],
      },
    },
  }
}

function sanitizedStringArrayProjection(field: string, rejectDataUrls = false, preserveEmpty = false) {
  const strings = {
    $map: {
      input: { $cond: [{ $isArray: field }, field, []] },
      as: 'value',
      in: {
        $cond: [
          { $eq: [{ $type: '$$value' }, 'string'] },
          '$$value',
          '',
        ],
      },
    },
  }
  if (preserveEmpty) return strings
  return {
    $filter: {
      input: strings,
      as: 'value',
      cond: rejectDataUrls
        ? {
            $and: [
              { $ne: ['$$value', ''] },
              { $not: [{ $regexMatch: { input: '$$value', regex: DATA_URL_PATTERN, options: 'i' } }] },
            ],
          }
        : { $ne: ['$$value', ''] },
    },
  }
}

async function attachAdminMedia(products: Record<string, unknown>[]) {
  const ids = products.map((product) => product._id).filter(Boolean)
  if (!ids.length) return products

  // Fetch media only after the lightweight list has been sorted and paginated.
  // This preserves the protection against oversized legacy embedded image data.
  const media = await Product.aggregate([
    { $match: { _id: { $in: ids } } },
    {
      $project: {
        gallery: sanitizedStringArrayProjection('$gallery', true),
        images: sanitizedStringArrayProjection('$images', true),
        imagePublicIds: sanitizedStringArrayProjection('$imagePublicIds', false, true),
      },
    },
  ])
  const mediaById = new Map(media.map((item) => [String(item._id), item]))
  return products.map((product) => {
    const item = mediaById.get(String(product._id))
    return item ? { ...product, gallery: item.gallery, images: item.images, imagePublicIds: item.imagePublicIds } : product
  })
}

const LIST_PROJECTION = {
  name: 1,
  slug: 1,
  tagline: 1,
  description: 1,
  shortDescription: 1,
  price: 1,
  discount: 1,
  discountPrice: 1,
  stock: 1,
  sku: 1,
  category: 1,
  subCategory: 1,
  brand: 1,
  colors: 1,
  sizes: 1,
  tags: 1,
  scent: 1,
  mood: 1,
  includes: 1,
  plantOptions: 1,
  featured: 1,
  bestSeller: 1,
  isActive: 1,
  status: 1,
  rating: 1,
  reviewsCount: 1,
  story: 1,
  packageCategory: 1,
  fishSubCategory: 1,
  aquaticLifeType: 1,
  fishKey: 1,
  createdAt: 1,
  updatedAt: 1,
  __v: 1,
  image: durableImageProjection(),
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

function diagnosticErrorResponse(requestId: string, error: unknown) {
  const err = error as { name?: string; message?: string; code?: number | string }
  return withNoStore(NextResponse.json({
    success: false,
    message: 'Failed to fetch products.',
    diagnostic: {
      requestId,
      errorName: String(err?.name || 'UnknownError').slice(0, 100),
      errorCode: err?.code === undefined ? null : String(err.code).slice(0, 100),
      errorMessage: String(err?.message || 'Unknown error').slice(0, 500),
    },
  }, { status: 500 }))
}

function canonicalizeFishProduct<T extends Record<string, unknown>>(data: T) {
  if (data.packageCategory !== 'fish') return data

  const fishSubCategory = normalizeFishSubCategory(
    data.fishSubCategory || data.subCategory,
    data.category,
  )
  if (!fishSubCategory) {
    throw new Error('INVALID_FISH_SUB_CATEGORY')
  }

  const aquaticLifeType = normalizeAquaticLifeType(
    data.aquaticLifeType,
    data.category,
    data.tags,
  )
  if (fishSubCategory === 'aquatic-life' && !aquaticLifeType) {
    throw new Error('INVALID_AQUATIC_LIFE_TYPE')
  }

  const status = (data.status || 'active') as 'active' | 'draft' | 'out_of_stock'
  return {
    ...data,
    packageCategory: 'fish',
    fishSubCategory,
    aquaticLifeType: fishSubCategory === 'aquatic-life' ? aquaticLifeType : '',
    subCategory: fishSubCategory,
    category: buildFishCategories(fishSubCategory, aquaticLifeType),
    fishKey: buildFishKey(String(data.name || '')),
    status,
    isActive: statusIsStorefrontVisible(status),
    deletedAt: null,
  }
}

function canonicalizeLegacyFishProductForRead<T extends Record<string, unknown>>(data: T): T {
  if (data.packageCategory !== 'fish') return data

  const fishSubCategory = inferLegacyFishSubCategory(data)
  if (!fishSubCategory) return data

  const aquaticLifeType = normalizeAquaticLifeType(
    data.aquaticLifeType,
    data.category,
    data.tags,
  )
  if (fishSubCategory === 'aquatic-life' && !aquaticLifeType) return data

  return {
    ...data,
    fishSubCategory,
    subCategory: fishSubCategory,
    aquaticLifeType: fishSubCategory === 'aquatic-life' ? aquaticLifeType : '',
    category: buildFishCategories(fishSubCategory, aquaticLifeType),
  }
}

/**
 * GET /api/products
 * Public by default. `includeInactive=true` is admin-only.
 */
export async function GET(req: NextRequest) {
  const requestId = randomUUID()
  let diagnosticsAuthorized = false
  try {
    const { searchParams } = new URL(req.url)
    if (searchParams.get('diagnostics') === 'true') {
      const diagnosticAuth = authenticateAdmin(req)
      if (diagnosticAuth instanceof NextResponse) return withNoStore(diagnosticAuth)
      diagnosticsAuthorized = true
    }
    const includeInactive = searchParams.get('includeInactive') === 'true'
    if (includeInactive) {
      const auth = authenticateAdmin(req)
      if (auth instanceof NextResponse) return withNoStore(auth)
    }

    await connectDB()

    const page = parsePositiveInteger(searchParams.get('page'), 1)
    const limit = parsePositiveInteger(searchParams.get('limit'), 20, 100)
    const skip = (page - 1) * limit
    const filter: Record<string, unknown> = { deletedAt: null }

    if (!includeInactive) filter.isActive = true

    const category = searchParams.get('category')
    if (category && category !== 'all') filter.category = category

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      const price: Record<string, number> = {}
      const parsedMinPrice = Number(minPrice)
      const parsedMaxPrice = Number(maxPrice)
      if (minPrice && Number.isFinite(parsedMinPrice)) price.$gte = parsedMinPrice
      if (maxPrice && Number.isFinite(parsedMaxPrice)) price.$lte = parsedMaxPrice
      if (Object.keys(price).length) filter.price = price
    }

    if (searchParams.get('featured') === 'true') filter.bestSeller = true

    const search = searchParams.get('search')
    if (search) {
      const safeSearch = escapeRegex(search.trim().slice(0, 100))
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tagline: { $regex: safeSearch, $options: 'i' } },
      ]
    }

    const packageCategory = searchParams.get('packageCategory')
    if (packageCategory) filter.packageCategory = packageCategory

    const excludePackageCategory = searchParams.get('excludePackageCategory')
    if (excludePackageCategory) filter.packageCategory = { $ne: excludePackageCategory }

    const sort = searchParams.get('sort') || 'featured'
    let sortQuery: Record<string, 1 | -1> = { bestSeller: -1, rating: -1, createdAt: -1, _id: -1 }
    if (sort === 'price-asc') sortQuery = { price: 1, _id: 1 }
    if (sort === 'price-desc') sortQuery = { price: -1, _id: 1 }
    if (sort === 'rating') sortQuery = { rating: -1, _id: 1 }
    if (sort === 'newest') sortQuery = { createdAt: -1, _id: -1 }
    if (sort === 'best-selling') sortQuery = { reviewsCount: -1, _id: 1 }

    const [rawProducts, total] = await Promise.all([
      Product.aggregate([
        { $match: filter },
        // Legacy documents can contain multi-megabyte embedded image arrays.
        // Drop fields that are not part of the listing before MongoDB sorts,
        // otherwise a small catalog can exceed the 32 MB in-memory sort limit.
        { $project: LIST_PROJECTION },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: limit },
      ]).allowDiskUse(true),
      Product.countDocuments(filter),
    ])
    const productsWithMedia = includeInactive
      ? await attachAdminMedia(rawProducts)
      : rawProducts
    const products = packageCategory === 'fish'
      ? productsWithMedia.map((product) => canonicalizeLegacyFishProductForRead(product))
      : productsWithMedia

    return withNoStore(successResponse({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }))
  } catch (error) {
    logServerError('list', requestId, error)
    if (diagnosticsAuthorized) return diagnosticErrorResponse(requestId, error)
    return withNoStore(errorResponse('Failed to fetch products.', 500))
  }
}

/** POST /api/products - admin-only product creation. */
export async function POST(req: NextRequest) {
  const requestId = randomUUID()
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return withNoStore(auth)

    await connectDB()
    const parsed = createProductSchema.safeParse(await req.json())
    if (!parsed.success) return withNoStore(validationErrorResponse(parsed.error))

    let data: Record<string, unknown>
    try {
      data = canonicalizeFishProduct(parsed.data)
    } catch (error) {
      const message = (error as Error).message === 'INVALID_AQUATIC_LIFE_TYPE'
        ? 'Aquatic Life products require a valid aquatic life type.'
        : 'Fish products require a valid fish sub-category.'
      return withNoStore(errorResponse(message, 400))
    }

    if (data.fishKey && await Product.exists({ fishKey: data.fishKey })) {
      return withNoStore(errorResponse('A fish product with this name already exists.', 409))
    }

    const baseSlug = slugify(String(data.name), { lower: true, strict: true })
    let slug = baseSlug
    if (await Product.exists({ slug })) slug = `${baseSlug}-${randomUUID().slice(0, 8)}`

    const product = new Product({
      ...data,
      slug,
      image: String(data.image || (data.images as string[] | undefined)?.[0] || ''),
      thumbnail: String(data.thumbnail || data.image || (data.images as string[] | undefined)?.[0] || ''),
    })
    await product.save()
    const persistedProduct = await Product.findById(product._id).lean()
    if (!persistedProduct) {
      throw new Error('PRODUCT_WRITE_VERIFICATION_FAILED')
    }
    console.info('[products.create]', {
      requestId,
      productId: product._id.toString(),
      packageCategory: product.packageCategory || 'catalog',
      version: product.__v,
      writeVerified: true,
    })

    return withNoStore(successResponse(persistedProduct, 'Product created successfully.', 201))
  } catch (error) {
    const mongoError = error as { code?: number }
    if (mongoError?.code === 11000) {
      return withNoStore(errorResponse('A product with the same stable identifier already exists.', 409))
    }
    logServerError('create', requestId, error)
    return withNoStore(errorResponse('Failed to create product.', 500))
  }
}

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

let databaseName: string
let token: string
let listProducts: typeof import('@/app/api/products/route').GET
let createProduct: typeof import('@/app/api/products/route').POST
let updateProduct: typeof import('@/app/api/products/[id]/route').PUT
let deleteProduct: typeof import('@/app/api/products/[id]/route').DELETE
let uploadImage: typeof import('@/app/api/upload/route').POST
let deleteUpload: typeof import('@/app/api/upload/route').DELETE
let getImage: typeof import('@/app/api/images/[id]/route').GET

type TestProduct = {
  _id: string
  __v: number
  name: string
  price: number
  image: string
  fishSubCategory: string
  isActive: boolean
  productType?: string
  candleCategory?: string
  category?: string[]
  discountPrice?: number | null
}

function request(
  url: string,
  method = 'GET',
  body?: Record<string, unknown>,
  authenticated = false,
) {
  return new NextRequest(url, {
    method,
    headers: {
      ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function productJson(response: Response) {
  return response.json() as Promise<{ data: TestProduct }>
}

async function listJson(response: Response) {
  return response.json() as Promise<{ data: { products: TestProduct[] } }>
}

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

function uploadRequest(bytes = onePixelPng, authenticated = true, type = 'image/png') {
  const body = new FormData()
  body.append('file', new File([bytes], 'test-image.png', { type }))
  return new NextRequest('http://test/api/upload', {
    method: 'POST',
    headers: authenticated ? { Authorization: `Bearer ${token}` } : {},
    body,
  })
}

const baseProduct = {
  name: 'E2E Glass Aquarium',
  tagline: 'Test aquarium',
  shortDescription: 'A durable test aquarium.',
  description: 'Integration test product.',
  price: 850,
  category: ['fish', 'aquariums'],
  subCategory: 'aquariums',
  packageCategory: 'fish',
  fishSubCategory: 'aquariums',
  aquaticLifeType: '',
  tags: ['Test'],
  image: '/assets/fishs.jpeg',
  thumbnail: '/assets/fishs.jpeg',
  images: ['/assets/fishs.jpeg'],
  gallery: [],
  status: 'active',
  isActive: true,
}

const baseCandleProduct = {
  name: 'Integration Essential Candle',
  tagline: 'Database candle',
  shortDescription: 'A candle stored by the integration suite.',
  description: 'Database-backed Candle product.',
  story: 'Created to verify the complete Candle workflow.',
  price: 600,
  discountPrice: 525,
  category: ['candles', 'essential'],
  subCategory: 'essential',
  packageCategory: 'candles',
  productType: 'candles',
  candleCategory: 'essential',
  tags: ['Integration'],
  image: '/assets/candles.jpeg',
  thumbnail: '/assets/candles.jpeg',
  images: ['/assets/candles.jpeg'],
  gallery: [],
  status: 'active',
  isActive: true,
}

describe('fish products API persistence and consistency', () => {
  beforeAll(async () => {
    const baseUri = process.env.MONGODB_URI
    if (!baseUri) throw new Error('MONGODB_URI is required for the isolated integration database.')
    databaseName = `dbit_${Date.now().toString(36)}_${process.pid}`
    const isolatedUri = new URL(baseUri)
    isolatedUri.pathname = `/${databaseName}`
    process.env.MONGODB_URI = isolatedUri.toString()
    process.env.EXPECTED_MONGODB_DATABASE = databaseName
    process.env.JWT_SECRET = 'integration-test-secret-with-sufficient-length'
    process.env.DATA_SOURCE_ID = 'integration-test'

    const collectionRoute = await import('@/app/api/products/route')
    const itemRoute = await import('@/app/api/products/[id]/route')
    const uploadRoute = await import('@/app/api/upload/route')
    const imageRoute = await import('@/app/api/images/[id]/route')
    const auth = await import('@/lib/auth')
    listProducts = collectionRoute.GET
    createProduct = collectionRoute.POST
    updateProduct = itemRoute.PUT
    deleteProduct = itemRoute.DELETE
    uploadImage = uploadRoute.POST
    deleteUpload = uploadRoute.DELETE
    getImage = imageRoute.GET
    token = auth.signToken('507f1f77bcf86cd799439011', 'admin')
  })

  afterAll(async () => {
    const mongoose = (await import('mongoose')).default
    if (
      mongoose.connection.readyState &&
      mongoose.connection.db?.databaseName === databaseName &&
      databaseName.startsWith('dbit_')
    ) {
      await mongoose.connection.db.dropDatabase()
    }
    await mongoose.disconnect()
  })

  it('persists CRUD, counts, cache invalidation, concurrency, and restart reads', async () => {
    const aquariumResponse = await createProduct(
      request('http://test/api/products', 'POST', baseProduct, true),
    )
    expect(aquariumResponse.status).toBe(201)
    const aquarium = (await productJson(aquariumResponse)).data
    expect(aquarium._id).toMatch(/^[0-9a-f]{24}$/)
    expect(aquarium.fishSubCategory).toBe('aquariums')
    const mongoose = (await import('mongoose')).default
    const storedImmediately = await mongoose.connection.db.collection('products').findOne({
      _id: new mongoose.Types.ObjectId(aquarium._id),
    })
    expect(storedImmediately).toMatchObject({
      name: baseProduct.name,
      packageCategory: 'fish',
      fishSubCategory: 'aquariums',
      category: ['fish', 'aquariums'],
      status: 'active',
    })

    const aquaticResponse = await createProduct(
      request('http://test/api/products', 'POST', {
        ...baseProduct,
        name: 'E2E Blue Shrimp',
        price: 125,
        category: ['fish', 'aquatic-life', 'shrimp'],
        subCategory: 'aquatic-life',
        fishSubCategory: 'aquatic-life',
        aquaticLifeType: 'shrimp',
      }, true),
    )
    expect(aquaticResponse.status).toBe(201)
    const aquatic = (await productJson(aquaticResponse)).data

    const browserA = await listProducts(request('http://test/api/products?packageCategory=fish&limit=100'))
    const browserB = await listProducts(request('http://test/api/products?packageCategory=fish&limit=100'))
    const listA = (await listJson(browserA)).data.products
    const listB = (await listJson(browserB)).data.products
    expect(listA).toEqual(listB)
    expect(listA.filter((product) => product.fishSubCategory === 'aquariums')).toHaveLength(1)
    expect(listA.filter((product) => product.fishSubCategory === 'aquatic-life')).toHaveLength(1)
    expect(browserA.headers.get('cache-control')).toContain('no-store')
    expect(browserA.headers.get('x-data-source')).toBe('integration-test')

    const unauthorizedInactiveList = await listProducts(
      request('http://test/api/products?packageCategory=fish&includeInactive=true&limit=100'),
    )
    expect(unauthorizedInactiveList.status).toBe(401)

    const unauthorizedDiagnostics = await listProducts(
      request('http://test/api/products?diagnostics=true&limit=100'),
    )
    expect(unauthorizedDiagnostics.status).toBe(401)

    const duplicate = await createProduct(
      request('http://test/api/products', 'POST', { ...baseProduct, name: '  e2e glass aquarium ' }, true),
    )
    expect(duplicate.status).toBe(409)

    const update = await updateProduct(
      request(`http://test/api/products/${aquarium._id}`, 'PUT', {
        name: 'E2E Glass Aquarium Updated',
        price: 900,
        fishSubCategory: 'aquariums',
        status: 'active',
        version: aquarium.__v,
      }, true),
      { params: Promise.resolve({ id: aquarium._id }) },
    )
    expect(update.status).toBe(200)
    const updated = (await productJson(update)).data
    expect(updated.price).toBe(900)
    expect(updated.__v).toBe(aquarium.__v + 1)

    const staleUpdate = await updateProduct(
      request(`http://test/api/products/${aquarium._id}`, 'PUT', {
        price: 1,
        version: aquarium.__v,
      }, true),
      { params: Promise.resolve({ id: aquarium._id }) },
    )
    expect(staleUpdate.status).toBe(409)

    const deactivate = await updateProduct(
      request(`http://test/api/products/${aquarium._id}`, 'PUT', {
        status: 'draft',
        version: updated.__v,
      }, true),
      { params: Promise.resolve({ id: aquarium._id }) },
    )
    const deactivated = (await productJson(deactivate)).data
    expect(deactivated.isActive).toBe(false)

    const publicAfterDeactivate = await listProducts(
      request('http://test/api/products?packageCategory=fish&limit=100'),
    )
    expect((await listJson(publicAfterDeactivate)).data.products.map((product) => product._id)).not.toContain(aquarium._id)

    const adminAfterDeactivate = await listProducts(
      request('http://test/api/products?packageCategory=fish&limit=100&includeInactive=true', 'GET', undefined, true),
    )
    expect((await listJson(adminAfterDeactivate)).data.products.map((product) => product._id)).toContain(aquarium._id)

    const deleted = await deleteProduct(
      request(`http://test/api/products/${aquatic._id}?version=${aquatic.__v}`, 'DELETE', undefined, true),
      { params: Promise.resolve({ id: aquatic._id }) },
    )
    expect(deleted.status).toBe(200)

    await mongoose.disconnect()
    const cache = (globalThis as typeof globalThis & {
      _mongooseCache?: { conn: unknown | null; promise: Promise<unknown> | null }
    })._mongooseCache
    if (cache) { cache.conn = null; cache.promise = null }

    const afterRestart = await listProducts(
      request('http://test/api/products?packageCategory=fish&limit=100&includeInactive=true', 'GET', undefined, true),
    )
    const persisted = (await listJson(afterRestart)).data.products
    expect(persisted.map((product) => product._id)).toContain(aquarium._id)
    expect(persisted.map((product) => product._id)).not.toContain(aquatic._id)
    const persistedAquarium = persisted.find((product) => product._id === aquarium._id)
    expect(persistedAquarium).toMatchObject({
      name: 'E2E Glass Aquarium Updated',
      price: 900,
      image: '/assets/fishs.jpeg',
      fishSubCategory: 'aquariums',
      isActive: false,
    })
  })

  it('persists validated Candle and Plant CRUD as one shared builder source', async () => {
    const invalidCandle = await createProduct(request('http://test/api/products', 'POST', {
      ...baseCandleProduct,
      name: 'Invalid Category Candle',
      candleCategory: '',
      category: ['candles'],
      subCategory: '',
    }, true))
    expect(invalidCandle.status).toBe(400)

    const candleResponse = await createProduct(
      request('http://test/api/products', 'POST', baseCandleProduct, true),
    )
    expect(candleResponse.status).toBe(201)
    const candle = (await productJson(candleResponse)).data
    expect(candle).toMatchObject({
      productType: 'candles',
      candleCategory: 'essential',
      category: ['candles', 'essential'],
      discountPrice: 525,
    })

    const plantResponse = await createProduct(request('http://test/api/products', 'POST', {
      ...baseCandleProduct,
      name: 'Integration Calm Plant',
      price: 450,
      discountPrice: null,
      productType: 'plants',
      packageCategory: 'plants',
      candleCategory: 'art',
      subCategory: 'art',
      category: ['plants', 'art'],
      image: '/assets/plants.jpeg',
      thumbnail: '/assets/plants.jpeg',
      images: ['/assets/plants.jpeg'],
    }, true))
    expect(plantResponse.status).toBe(201)
    const plant = (await productJson(plantResponse)).data
    expect(plant).toMatchObject({
      productType: 'plants',
      candleCategory: '',
      category: ['plants'],
    })

    const mongoose = (await import('mongoose')).default
    const stored = await mongoose.connection.db.collection('products').find({
      _id: { $in: [candle._id, plant._id].map((id) => new mongoose.Types.ObjectId(id)) },
    }).toArray()
    expect(stored).toHaveLength(2)
    expect(stored.find((product) => String(product._id) === plant._id)).toMatchObject({
      packageCategory: 'plants',
      productType: 'plants',
      candleCategory: '',
      subCategory: '',
      category: ['plants'],
    })

    const browserA = await listProducts(request('http://test/api/products?productType=builder&limit=100'))
    const browserB = await listProducts(request('http://test/api/products?productType=builder&limit=100'))
    expect(browserA.headers.get('cache-control')).toContain('no-store')
    const listA = (await listJson(browserA)).data.products
    const listB = (await listJson(browserB)).data.products
    expect(listA).toEqual(listB)
    expect(listA.filter((product) => product.productType === 'candles')).toHaveLength(1)
    expect(listA.filter((product) => product.productType === 'plants')).toHaveLength(1)

    const predefinedPackages = await listProducts(request(
      'http://test/api/products?excludePackageCategory=fish&excludeProductType=builder&limit=100',
    ))
    expect((await listJson(predefinedPackages)).data.products).toEqual([])

    const invalidTypeFilter = await listProducts(request('http://test/api/products?productType=fish'))
    expect(invalidTypeFilter.status).toBe(400)

    const unauthorizedAdminList = await listProducts(
      request('http://test/api/products?productType=builder&includeInactive=true&limit=100'),
    )
    expect(unauthorizedAdminList.status).toBe(401)

    const duplicate = await createProduct(request('http://test/api/products', 'POST', {
      ...baseCandleProduct,
      name: '  INTEGRATION essential candle ',
    }, true))
    expect(duplicate.status).toBe(409)

    const switchToPlantResponse = await updateProduct(
      request(`http://test/api/products/${candle._id}`, 'PUT', {
        productType: 'plants',
        version: candle.__v,
      }, true),
      { params: Promise.resolve({ id: candle._id }) },
    )
    expect(switchToPlantResponse.status).toBe(200)
    const switched = (await productJson(switchToPlantResponse)).data
    expect(switched).toMatchObject({
      productType: 'plants',
      candleCategory: '',
      category: ['plants'],
    })

    const staleEdit = await updateProduct(
      request(`http://test/api/products/${candle._id}`, 'PUT', {
        price: 700,
        version: candle.__v,
      }, true),
      { params: Promise.resolve({ id: candle._id }) },
    )
    expect(staleEdit.status).toBe(409)

    const deactivateResponse = await updateProduct(
      request(`http://test/api/products/${plant._id}`, 'PUT', {
        status: 'draft',
        version: plant.__v,
      }, true),
      { params: Promise.resolve({ id: plant._id }) },
    )
    expect(deactivateResponse.status).toBe(200)
    const deactivated = (await productJson(deactivateResponse)).data
    expect(deactivated.isActive).toBe(false)

    const publicAfterDeactivate = await listProducts(
      request('http://test/api/products?productType=plants&limit=100'),
    )
    expect((await listJson(publicAfterDeactivate)).data.products.map((product) => product._id)).toEqual([candle._id])

    await mongoose.disconnect()
    const cache = (globalThis as typeof globalThis & {
      _mongooseCache?: { conn: unknown | null; promise: Promise<unknown> | null }
    })._mongooseCache
    if (cache) { cache.conn = null; cache.promise = null }

    const afterRestart = await listProducts(request(
      'http://test/api/products?productType=builder&includeInactive=true&limit=100',
      'GET',
      undefined,
      true,
    ))
    const persisted = (await listJson(afterRestart)).data.products
    expect(persisted.map((product) => product._id).sort()).toEqual([candle._id, plant._id].sort())

    const deletePlant = await deleteProduct(
      request(`http://test/api/products/${plant._id}?version=${deactivated.__v}`, 'DELETE', undefined, true),
      { params: Promise.resolve({ id: plant._id }) },
    )
    expect(deletePlant.status).toBe(200)
    const deleteSwitched = await deleteProduct(
      request(`http://test/api/products/${candle._id}?version=${switched.__v}`, 'DELETE', undefined, true),
      { params: Promise.resolve({ id: candle._id }) },
    )
    expect(deleteSwitched.status).toBe(200)

    const finalList = await listProducts(request(
      'http://test/api/products?productType=builder&includeInactive=true&limit=100',
      'GET',
      undefined,
      true,
    ))
    expect((await listJson(finalList)).data.products).toEqual([])
  }, 180_000)

  it('persists predefined package edits with version checks and every editable field', async () => {
    const createResponse = await createProduct(request('http://test/api/products', 'POST', {
      name: 'Integration Return Package',
      tagline: 'A database-backed package.',
      description: 'Original package description.',
      price: 1250,
      discountPrice: null,
      stock: 12,
      sku: 'PKG-RETURN-IT',
      category: ['best-seller', 'calm'],
      bestSeller: true,
      scent: 'Sandalwood + Sage',
      tags: ['Calm'],
      image: '/assets/return.jpeg',
      thumbnail: '/assets/return.jpeg',
      images: ['/assets/return.jpeg', '/assets/return/1.jpeg'],
      gallery: ['/assets/return/1.jpeg'],
      status: 'active',
      packageCollection: 'return',
      size: 'medium',
      difficulty: 'beginner',
      light: 'medium',
      watering: 'weekly',
      petFriendly: false,
      airPurifying: false,
    }, true))
    expect(createResponse.status).toBe(201)
    const created = (await productJson(createResponse)).data

    const browserA = await listProducts(request(
      'http://test/api/products?excludePackageCategory=fish&excludeProductType=builder&limit=100',
    ))
    const browserB = await listProducts(request(
      'http://test/api/products?excludePackageCategory=fish&excludeProductType=builder&limit=100',
    ))
    expect((await listJson(browserA)).data.products).toEqual((await listJson(browserB)).data.products)
    expect(browserA.headers.get('cache-control')).toContain('no-store')

    const missingVersion = await updateProduct(
      request(`http://test/api/products/${created._id}`, 'PUT', { price: 1300 }, true),
      { params: Promise.resolve({ id: created._id }) },
    )
    expect(missingVersion.status).toBe(428)

    const updateResponse = await updateProduct(
      request(`http://test/api/products/${created._id}`, 'PUT', {
        name: 'Integration Return Package Updated',
        tagline: 'The confirmed updated tagline.',
        description: 'The confirmed updated description.',
        price: 1475,
        discountPrice: 1390,
        stock: 20,
        category: ['self-care'],
        bestSeller: false,
        scent: 'Cedar + Fig',
        tags: ['Edited', 'Persistent'],
        packageCollection: 'renewal',
        size: 'large',
        difficulty: 'advanced',
        light: 'bright',
        watering: 'biweekly',
        petFriendly: true,
        airPurifying: true,
        version: created.__v,
      }, true),
      { params: Promise.resolve({ id: created._id }) },
    )
    expect(updateResponse.status).toBe(200)
    const updated = (await updateResponse.json()).data
    expect(updated).toMatchObject({
      _id: created._id,
      name: 'Integration Return Package Updated',
      tagline: 'The confirmed updated tagline.',
      description: 'The confirmed updated description.',
      price: 1475,
      discountPrice: 1390,
      stock: 20,
      category: ['self-care'],
      bestSeller: false,
      scent: 'Cedar + Fig',
      tags: ['Edited', 'Persistent'],
      packageCollection: 'renewal',
      size: 'large',
      difficulty: 'advanced',
      light: 'bright',
      watering: 'biweekly',
      petFriendly: true,
      airPurifying: true,
      status: 'active',
      isActive: true,
      __v: created.__v + 1,
    })

    const staleUpdate = await updateProduct(
      request(`http://test/api/products/${created._id}`, 'PUT', {
        price: 1600,
        version: created.__v,
      }, true),
      { params: Promise.resolve({ id: created._id }) },
    )
    expect(staleUpdate.status).toBe(409)

    const publicList = await listProducts(request(
      'http://test/api/products?excludePackageCategory=fish&excludeProductType=builder&limit=100',
    ))
    const publicProduct = (await listJson(publicList)).data.products.find(
      (product) => product._id === created._id,
    ) as TestProduct & { images: string[] }
    expect(publicProduct).toMatchObject({ name: 'Integration Return Package Updated', price: 1475 })
    expect(publicProduct.images).toEqual(['/assets/return.jpeg', '/assets/return/1.jpeg'])
    expect(publicProduct).not.toHaveProperty('imagePublicIds')

    const deactivateResponse = await updateProduct(
      request(`http://test/api/products/${created._id}`, 'PUT', {
        status: 'draft',
        version: updated.__v,
      }, true),
      { params: Promise.resolve({ id: created._id }) },
    )
    expect(deactivateResponse.status).toBe(200)
    const deactivated = (await deactivateResponse.json()).data
    expect(deactivated).toMatchObject({ status: 'draft', isActive: false })

    const hiddenList = await listProducts(request(
      'http://test/api/products?excludePackageCategory=fish&excludeProductType=builder&limit=100',
    ))
    expect((await listJson(hiddenList)).data.products).toEqual([])

    const adminList = await listProducts(request(
      'http://test/api/products?excludePackageCategory=fish&excludeProductType=builder&includeInactive=true&limit=100',
      'GET',
      undefined,
      true,
    ))
    expect((await listJson(adminList)).data.products).toEqual([
      expect.objectContaining({ _id: created._id, name: 'Integration Return Package Updated' }),
    ])

    const deleteResponse = await deleteProduct(
      request(`http://test/api/products/${created._id}?version=${deactivated.__v}`, 'DELETE', undefined, true),
      { params: Promise.resolve({ id: created._id }) },
    )
    expect(deleteResponse.status).toBe(200)
  })

  it('rejects browser-local base64 image persistence', async () => {
    const response = await createProduct(
      request('http://test/api/products', 'POST', {
        ...baseProduct,
        name: 'Embedded Image Product',
        image: 'data:image/png;base64,AAAA',
      }, true),
    )
    expect(response.status).toBe(400)
  })

  it('persists uploaded images through create, edit, refresh, restart, and delete', async () => {
    expect((await uploadImage(uploadRequest(onePixelPng, false))).status).toBe(401)
    expect((await uploadImage(request('http://test/api/upload', 'POST', undefined, true))).status).toBe(400)
    expect((await uploadImage(uploadRequest(Buffer.from('not-an-image')))).status).toBe(400)

    const firstUploadResponse = await uploadImage(uploadRequest())
    expect(firstUploadResponse.status).toBe(201)
    const firstUpload = (await firstUploadResponse.json()).data as {
      url: string
      publicId: string
      bytes: number
      contentType: string
    }
    expect(firstUpload.url).toMatch(/^\/api\/images\/[0-9a-f]{24}$/)
    expect(firstUpload.publicId).toMatch(/^mongodb:[0-9a-f]{24}$/)
    expect(firstUpload.bytes).toBe(onePixelPng.length)
    expect(firstUpload.contentType).toBe('image/png')

    const firstImageId = firstUpload.url.split('/').pop() as string
    const firstRead = await getImage(
      request(`http://test${firstUpload.url}`),
      { params: Promise.resolve({ id: firstImageId }) },
    )
    expect(firstRead.status).toBe(200)
    expect(firstRead.headers.get('content-type')).toBe('image/png')
    expect(firstRead.headers.get('cache-control')).toContain('immutable')
    expect(Buffer.from(await firstRead.arrayBuffer())).toEqual(onePixelPng)

    const conditionalRead = await getImage(
      new NextRequest(`http://test${firstUpload.url}`, {
        headers: { 'If-None-Match': `"${firstImageId}"` },
      }),
      { params: Promise.resolve({ id: firstImageId }) },
    )
    expect(conditionalRead.status).toBe(304)

    const createResponse = await createProduct(
      request('http://test/api/products', 'POST', {
        ...baseProduct,
        name: 'Database Image Aquarium',
        image: firstUpload.url,
        thumbnail: firstUpload.url,
        images: [firstUpload.url],
        imagePublicIds: [firstUpload.publicId],
      }, true),
    )
    expect(createResponse.status).toBe(201)
    const created = (await productJson(createResponse)).data

    const protectedDelete = await deleteUpload(request(
      `http://test/api/upload?publicId=${encodeURIComponent(firstUpload.publicId)}`,
      'DELETE',
      undefined,
      true,
    ))
    expect(protectedDelete.status).toBe(409)

    const adminList = await listProducts(request(
      'http://test/api/products?packageCategory=fish&includeInactive=true&limit=100',
      'GET',
      undefined,
      true,
    ))
    const listed = ((await adminList.json()).data.products as Array<{
      _id: string
      gallery: string[]
      imagePublicIds: string[]
    }>).find((product) => product._id === created._id)
    expect(listed).toMatchObject({ gallery: [], imagePublicIds: [firstUpload.publicId] })

    const secondUploadResponse = await uploadImage(uploadRequest())
    expect(secondUploadResponse.status).toBe(201)
    const secondUpload = (await secondUploadResponse.json()).data as {
      url: string
      publicId: string
    }
    const secondImageId = secondUpload.url.split('/').pop() as string

    const updateResponse = await updateProduct(
      request(`http://test/api/products/${created._id}`, 'PUT', {
        image: secondUpload.url,
        thumbnail: secondUpload.url,
        images: [secondUpload.url],
        gallery: [],
        imagePublicIds: [secondUpload.publicId],
        version: created.__v,
      }, true),
      { params: Promise.resolve({ id: created._id }) },
    )
    expect(updateResponse.status).toBe(200)
    const updated = (await productJson(updateResponse)).data

    expect((await getImage(
      request(`http://test${firstUpload.url}`),
      { params: Promise.resolve({ id: firstImageId }) },
    )).status).toBe(404)

    const mongoose = (await import('mongoose')).default
    await mongoose.disconnect()
    const cache = (globalThis as typeof globalThis & {
      _mongooseCache?: { conn: unknown | null; promise: Promise<unknown> | null }
    })._mongooseCache
    if (cache) { cache.conn = null; cache.promise = null }

    expect((await getImage(
      request(`http://test${secondUpload.url}`),
      { params: Promise.resolve({ id: secondImageId }) },
    )).status).toBe(200)

    const deleteResponse = await deleteProduct(
      request(`http://test/api/products/${updated._id}?version=${updated.__v}`, 'DELETE', undefined, true),
      { params: Promise.resolve({ id: updated._id }) },
    )
    expect(deleteResponse.status).toBe(200)
    expect((await getImage(
      request(`http://test${secondUpload.url}`),
      { params: Promise.resolve({ id: secondImageId }) },
    )).status).toBe(404)

    const unusedUploadResponse = await uploadImage(uploadRequest())
    const unusedUpload = (await unusedUploadResponse.json()).data as { url: string; publicId: string }
    const unusedDelete = await deleteUpload(request(
      `http://test/api/upload?publicId=${encodeURIComponent(unusedUpload.publicId)}`,
      'DELETE',
      undefined,
      true,
    ))
    expect(unusedDelete.status).toBe(200)
  })

  it('loads inactive legacy records even when their image fields have invalid types', async () => {
    const mongoose = (await import('mongoose')).default
    const products = mongoose.connection.db.collection('products')
    const now = new Date()

    await products.insertMany([
      {
        name: 'Legacy Object Image',
        slug: 'legacy-object-image',
        price: 1,
        packageCategory: 'fish',
        fishSubCategory: 'aquariums',
        category: ['fish', 'aquariums'],
        image: { url: '/legacy-object.jpg' },
        thumbnail: [],
        status: 'draft',
        isActive: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Legacy Array Image',
        slug: 'legacy-array-image',
        price: 1,
        packageCategory: 'fish',
        fishSubCategory: 'aquatic-life',
        aquaticLifeType: 'shrimp',
        category: ['fish', 'aquatic-life', 'shrimp'],
        image: ['/legacy-array.jpg'],
        thumbnail: 123,
        status: 'draft',
        isActive: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const adminResponse = await listProducts(
      request(
        'http://test/api/products?packageCategory=fish&limit=100&includeInactive=true',
        'GET',
        undefined,
        true,
      ),
    )
    expect(adminResponse.status).toBe(200)

    const adminProducts = (await listJson(adminResponse)).data.products
    const malformedProducts = adminProducts.filter((product) => product.name.startsWith('Legacy '))
    expect(malformedProducts).toHaveLength(2)
    expect(malformedProducts.every((product) => product.image === '')).toBe(true)

    const publicResponse = await listProducts(
      request('http://test/api/products?packageCategory=fish&limit=100'),
    )
    const publicProducts = (await listJson(publicResponse)).data.products
    expect(publicProducts.some((product) => product.name.startsWith('Legacy '))).toBe(false)
  })

  it('normalizes unambiguous legacy aquarium metadata without failing the whole list', async () => {
    const mongoose = (await import('mongoose')).default
    const legacyId = new mongoose.Types.ObjectId()
    await mongoose.connection.db.collection('products').insertOne({
      _id: legacyId,
      name: 'Legacy Premium Aquarium',
      slug: `legacy-premium-aquarium-${legacyId}`,
      price: 2200,
      packageCategory: 'fish',
      category: ['fish'],
      subCategory: '',
      isActive: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await listProducts(
      request('http://test/api/products?packageCategory=fish&includeInactive=true&limit=100', 'GET', undefined, true),
    )
    expect(response.status).toBe(200)
    const legacy = (await listJson(response)).data.products.find(
      (product) => product._id === legacyId.toString(),
    )
    expect(legacy).toMatchObject({
      fishSubCategory: 'aquariums',
      category: ['fish', 'aquariums'],
    })
  })

  it('projects oversized legacy image arrays before sorting the product list', async () => {
    const mongoose = (await import('mongoose')).default
    const products = mongoose.connection.db.collection('products')
    const oversizedLegacyImage = `data:image/jpeg;base64,${'A'.repeat(9 * 1024 * 1024)}`
    const now = new Date()

    await products.insertMany(Array.from({ length: 4 }, (_, index) => ({
      name: `Oversized Legacy Product ${index}`,
      slug: `oversized-legacy-product-${index}`,
      price: index + 1,
      category: ['legacy'],
      images: [oversizedLegacyImage],
      image: '',
      thumbnail: '',
      status: 'active',
      isActive: true,
      deletedAt: null,
      createdAt: new Date(now.getTime() + index),
      updatedAt: now,
    })))

    const response = await listProducts(
      request('http://test/api/products?limit=100&sort=newest'),
    )
    expect(response.status).toBe(200)
    const listedProducts = (await listJson(response)).data.products
    expect(listedProducts.filter((product) => product.name.startsWith('Oversized Legacy Product'))).toHaveLength(4)
  }, 180_000)
})

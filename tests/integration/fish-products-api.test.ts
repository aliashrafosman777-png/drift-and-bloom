import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

let databaseName: string
let token: string
let listProducts: typeof import('@/app/api/products/route').GET
let createProduct: typeof import('@/app/api/products/route').POST
let updateProduct: typeof import('@/app/api/products/[id]/route').PUT
let deleteProduct: typeof import('@/app/api/products/[id]/route').DELETE

type TestProduct = {
  _id: string
  __v: number
  name: string
  price: number
  image: string
  fishSubCategory: string
  isActive: boolean
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
    const auth = await import('@/lib/auth')
    listProducts = collectionRoute.GET
    createProduct = collectionRoute.POST
    updateProduct = itemRoute.PUT
    deleteProduct = itemRoute.DELETE
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

    const mongoose = (await import('mongoose')).default
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
})

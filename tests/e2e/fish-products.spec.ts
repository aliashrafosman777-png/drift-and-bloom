import { expect, test } from '@playwright/test'

const token = () => {
  if (!process.env.E2E_ADMIN_TOKEN) throw new Error('E2E_ADMIN_TOKEN was not initialized.')
  return process.env.E2E_ADMIN_TOKEN
}

const headers = () => ({ Authorization: `Bearer ${token()}` })

const aquarium = {
  name: 'Cross Browser Aquarium',
  tagline: 'Cross-browser aquarium',
  shortDescription: 'Cross-browser aquarium fixture.',
  description: 'Created by the isolated Playwright suite.',
  price: 1000,
  category: ['fish', 'aquariums'],
  subCategory: 'aquariums',
  packageCategory: 'fish',
  fishSubCategory: 'aquariums',
  aquaticLifeType: '',
  tags: ['E2E'],
  image: '/assets/fishs.jpeg',
  thumbnail: '/assets/fishs.jpeg',
  images: ['/assets/fishs.jpeg'],
  gallery: [],
  status: 'active',
  isActive: true,
}

test('fish products persist across admin, browser contexts, private context, mutations, and package builder', async ({ browser }) => {
  const browserA = await browser.newContext()
  const browserB = await browser.newContext()
  const privateWindow = await browser.newContext()
  const staleBrowserProduct = JSON.stringify([{ id: 'browser-only', name: 'Stale Browser Fish' }])
  await browserA.addInitScript(({ authToken, staleProduct }) => {
    localStorage.setItem('db_auth_token_v1', authToken)
    localStorage.setItem('db_fish_products_v1', staleProduct)
  }, { authToken: token(), staleProduct: staleBrowserProduct })
  for (const context of [browserB, privateWindow]) {
    await context.addInitScript((staleProduct) => {
      localStorage.setItem('db_fish_products_v1', staleProduct)
    }, staleBrowserProduct)
  }

  let adminPage = await browserA.newPage()
  const storefrontB = await browserB.newPage()
  const storefrontPrivate = await privateWindow.newPage()
  const browserErrors: string[] = []
  for (const page of [adminPage, storefrontB, storefrontPrivate]) {
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })
  }

  const createdAquariumResponse = await adminPage.request.post('/api/products', {
    headers: headers(),
    data: aquarium,
  })
  expect(createdAquariumResponse.status()).toBe(201)
  const createdAquarium = (await createdAquariumResponse.json()).data

  const createdLifeResponse = await adminPage.request.post('/api/products', {
    headers: headers(),
    data: {
      ...aquarium,
      name: 'Cross Browser Shrimp',
      price: 150,
      category: ['fish', 'aquatic-life', 'shrimp'],
      subCategory: 'aquatic-life',
      fishSubCategory: 'aquatic-life',
      aquaticLifeType: 'shrimp',
    },
  })
  expect(createdLifeResponse.status()).toBe(201)
  const createdLife = (await createdLifeResponse.json()).data

  await adminPage.goto('/admin/fish-products')
  await expect(adminPage.getByText('Stale Browser Fish')).toHaveCount(0)
  await expect.poll(() => adminPage.evaluate(() => localStorage.getItem('db_fish_products_v1'))).toBeNull()
  await expect(adminPage.getByText('2 products — 1 Aquariums, 1 Aquatic Life')).toBeVisible()

  for (const page of [storefrontB, storefrontPrivate]) {
    await page.goto('/build-your-package?category=fish')
    await expect(page.getByText('1 product available')).toHaveCount(2)
    await expect(page.getByText('Stale Browser Fish')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('db_fish_products_v1'))).toBeNull()
  }

  const controlUrl = process.env.E2E_CONTROL_URL
  if (!controlUrl) throw new Error('E2E_CONTROL_URL was not initialized.')
  const restartResponse = await fetch(`${controlUrl}/restart`, { method: 'POST' })
  expect(restartResponse.status).toBe(204)

  const afterRestartResponse = await adminPage.request.get(
    '/api/products?packageCategory=fish&includeInactive=true&limit=100',
    { headers: headers() },
  )
  expect(afterRestartResponse.status()).toBe(200)
  expect((await afterRestartResponse.json()).data.products.map((product: { _id: string }) => product._id).sort()).toEqual(
    [createdAquarium._id, createdLife._id].sort(),
  )
  await adminPage.close()
  adminPage = await browserA.newPage()
  adminPage.on('pageerror', (error) => browserErrors.push(error.message))
  adminPage.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  await adminPage.goto('/admin/fish-products')
  await expect(adminPage.getByText('2 products — 1 Aquariums, 1 Aquatic Life')).toBeVisible()

  const updatedResponse = await adminPage.request.put(`/api/products/${createdAquarium._id}`, {
    headers: headers(),
    data: {
      name: 'Cross Browser Aquarium Updated',
      price: 1100,
      fishSubCategory: 'aquariums',
      status: 'active',
      version: createdAquarium.__v,
    },
  })
  expect(updatedResponse.status()).toBe(200)
  const updatedAquarium = (await updatedResponse.json()).data

  await storefrontB.reload()
  await storefrontB.getByRole('button').filter({ hasText: 'Aquariums' }).click()
  await expect(storefrontB.getByText('Cross Browser Aquarium Updated')).toBeVisible()
  await expect(storefrontB.getByText('EGP 1,100')).toBeVisible()

  const deactivateResponse = await adminPage.request.put(`/api/products/${createdLife._id}`, {
    headers: headers(),
    data: { status: 'draft', version: createdLife.__v },
  })
  expect(deactivateResponse.status()).toBe(200)
  const deactivatedLife = (await deactivateResponse.json()).data

  await storefrontPrivate.reload()
  await expect(storefrontPrivate.getByText('0 products available')).toBeVisible()
  await adminPage.reload()
  await expect(adminPage.getByText('2 products — 1 Aquariums, 1 Aquatic Life')).toBeVisible()

  await storefrontB.getByRole('button', { name: 'Add Cross Browser Aquarium Updated to package' }).click()
  await expect(
    storefrontB.getByLabel('Selected products').getByText('EGP 1,100', { exact: true }),
  ).toBeVisible()
  await storefrontB.getByRole('button', { name: /Add Package to Cart/i }).click()
  await expect(storefrontB).toHaveURL(/\/cart$/)
  await expect(
    storefrontB.getByRole('link', { name: 'Custom Calming Space Package', exact: true }),
  ).toBeVisible()

  const deleteResponse = await adminPage.request.delete(
    `/api/products/${createdLife._id}?version=${deactivatedLife.__v}`,
    { headers: headers() },
  )
  expect(deleteResponse.status()).toBe(200)

  const finalList = await adminPage.request.get('/api/products?packageCategory=fish&includeInactive=true&limit=100', {
    headers: headers(),
  })
  const finalProducts = (await finalList.json()).data.products as Array<{ _id: string; __v: number }>
  expect(finalProducts.map((product) => product._id)).toEqual([createdAquarium._id])
  expect(finalProducts[0].__v).toBe(updatedAquarium.__v)
  expect(browserErrors).toEqual([])

  await browserA.close()
  await browserB.close()
  await privateWindow.close()
})

test('admin can create and edit a fish product with durable database images', async ({ browser }) => {
  const context = await browser.newContext()
  await context.addInitScript((authToken) => {
    localStorage.setItem('db_auth_token_v1', authToken)
  }, token())
  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })

  await page.goto('/admin/fish-products')
  await page.getByRole('button', { name: 'Add Fish Product' }).click()
  await page.getByLabel('Product Name').fill('UI Image Aquarium')
  await page.getByLabel('Short Description').fill('Uploaded through the admin product form.')
  await page.getByLabel('Price (EGP)').fill('725')
  await page.getByLabel('Fish Sub-Category').selectOption('aquariums')
  await page.getByRole('button', { name: 'Images' }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: 'first.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
  })
  await page.getByRole('button', { name: 'Tags & Status' }).click()
  await page.getByRole('button', { name: 'Add Product' }).click()
  await expect(page.getByText('Fish product added successfully!')).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'UI Image Aquarium' })).toBeVisible()

  const createdListResponse = await page.request.get(
    '/api/products?packageCategory=fish&includeInactive=true&limit=100',
    { headers: headers() },
  )
  expect(createdListResponse.status()).toBe(200)
  const created = ((await createdListResponse.json()).data.products as Array<{
    _id: string
    __v: number
    name: string
    image: string
    imagePublicIds: string[]
  }>).find((product) => product.name === 'UI Image Aquarium')
  expect(created).toBeTruthy()
  expect(created?.image).toMatch(/^\/api\/images\/[0-9a-f]{24}$/)
  expect(created?.imagePublicIds).toHaveLength(1)
  expect((await page.request.get(created!.image)).status()).toBe(200)

  const row = page.getByRole('row').filter({ hasText: 'UI Image Aquarium' })
  await row.getByTitle('Edit').click()
  await page.getByRole('button', { name: 'Images' }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: 'replacement.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAQAAABFaP0WAAAADUlEQVR42mNk+M/wHwAF/gL+N2rXJwAAAABJRU5ErkJggg==',
      'base64',
    ),
  })
  await page.getByTitle('Set as main').click({ force: true })
  await page.getByTitle('Remove').last().click({ force: true })
  await page.getByRole('button', { name: 'Tags & Status' }).click()
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByText('Fish product updated successfully!')).toBeVisible()

  const updatedListResponse = await page.request.get(
    '/api/products?packageCategory=fish&includeInactive=true&limit=100',
    { headers: headers() },
  )
  const updated = ((await updatedListResponse.json()).data.products as Array<{
    _id: string
    __v: number
    name: string
    image: string
    gallery: string[]
    imagePublicIds: string[]
  }>).find((product) => product._id === created!._id)
  expect(updated?.image).not.toBe(created?.image)
  expect(updated?.gallery).toEqual([])
  expect(updated?.imagePublicIds).toHaveLength(1)
  expect((await page.request.get(created!.image)).status()).toBe(404)
  expect((await page.request.get(updated!.image)).status()).toBe(200)

  const deleteResponse = await page.request.delete(
    `/api/products/${updated!._id}?version=${updated!.__v}`,
    { headers: headers() },
  )
  expect(deleteResponse.status()).toBe(200)
  expect((await page.request.get(updated!.image)).status()).toBe(404)
  expect(browserErrors).toEqual([])

  await context.close()
})

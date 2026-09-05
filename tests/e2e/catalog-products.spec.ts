import { expect, test, type BrowserContext, type Page } from '@playwright/test'

const firstPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
const replacementPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAQAAABFaP0WAAAADUlEQVR42mNk+M/wHwAF/gL+N2rXJwAAAABJRU5ErkJggg==',
  'base64',
)

const token = () => {
  if (!process.env.E2E_ADMIN_TOKEN) throw new Error('E2E_ADMIN_TOKEN was not initialized.')
  return process.env.E2E_ADMIN_TOKEN
}
const headers = () => ({ Authorization: `Bearer ${token()}` })

async function openAdminContext(context: BrowserContext) {
  await context.addInitScript((authToken) => {
    localStorage.setItem('db_auth_token_v1', authToken)
    localStorage.setItem('db_candle_products_v1', JSON.stringify([{ id: 'browser-only-candle' }]))
    localStorage.setItem('db_plant_products_v1', JSON.stringify([{ id: 'browser-only-plant' }]))
  }, token())
  return context.newPage()
}

async function createThroughAdmin(page: Page, input: {
  name: string
  type: 'candles' | 'plants'
  category?: 'essential' | 'signature' | 'art'
  price: string
  discountPrice?: string
}) {
  await page.getByRole('button', { name: 'Add Product', exact: true }).click()
  await page.getByLabel('Product Name').fill(input.name)
  await page.getByLabel('Short Description').fill(`${input.name} package-builder description.`)
  await page.getByLabel('Full Description').fill(`Full description for ${input.name}.`)
  await page.getByLabel('Product Story').fill(`The database story for ${input.name}.`)
  await page.getByLabel('Product Type').selectOption(input.type)
  if (input.type === 'candles') {
    await page.getByLabel('Category').selectOption(input.category || 'essential')
  } else {
    await expect(page.getByLabel('Category')).toHaveCount(0)
  }
  await page.getByLabel('Price (EGP)').fill(input.price)
  if (input.discountPrice) await page.getByLabel('Discount Price').fill(input.discountPrice)
  await page.getByRole('button', { name: 'Images', exact: true }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: `${input.type}.png`,
    mimeType: 'image/png',
    buffer: firstPng,
  })
  await page.getByRole('button', { name: 'Tags & Status', exact: true }).click()
  await page.getByPlaceholder('Type a tag and press Enter...').fill('E2E Managed')
  await page.getByPlaceholder('Type a tag and press Enter...').press('Enter')
  await page.locator('button[form="catalog-product-form"]').click()
  await expect(page.getByText('Product added successfully!')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('row').filter({ hasText: input.name })).toBeVisible()
}

test('Candles and Plants persist across browsers, admin CRUD, restart, and package cart flow', async ({ browser }) => {
  test.setTimeout(240_000)

  const browserA = await browser.newContext()
  const browserB = await browser.newContext()
  const privateWindow = await browser.newContext()
  const adminPage = await openAdminContext(browserA)
  for (const context of [browserB, privateWindow]) {
    await context.addInitScript(() => {
      localStorage.setItem('db_candle_products_v1', JSON.stringify([{ id: 'stale' }]))
      localStorage.setItem('db_plant_products_v1', JSON.stringify([{ id: 'stale' }]))
    })
  }
  const storefrontB = await browserB.newPage()
  const storefrontPrivate = await privateWindow.newPage()
  const browserErrors: string[] = []
  for (const page of [adminPage, storefrontB, storefrontPrivate]) {
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })
  }

  await adminPage.goto('/admin/candles-plants')
  await expect(adminPage.getByText('0 products — 0 Candles, 0 Plants')).toBeVisible()
  await expect.poll(() => adminPage.evaluate(() => localStorage.getItem('db_candle_products_v1'))).toBeNull()
  await expect.poll(() => adminPage.evaluate(() => localStorage.getItem('db_plant_products_v1'))).toBeNull()

  await createThroughAdmin(adminPage, {
    name: 'Cross Browser Essential Candle',
    type: 'candles',
    category: 'essential',
    price: '650',
    discountPrice: '525',
  })

  // Prove that switching Candle -> Plant clears the hidden Candle category.
  await adminPage.getByRole('button', { name: 'Add Product', exact: true }).click()
  await adminPage.getByLabel('Product Type').selectOption('candles')
  await adminPage.getByLabel('Category').selectOption('signature')
  await adminPage.getByLabel('Product Type').selectOption('plants')
  await expect(adminPage.getByLabel('Category')).toHaveCount(0)
  await adminPage.getByRole('button', { name: 'Close' }).click()

  await createThroughAdmin(adminPage, {
    name: 'Cross Browser Calm Plant',
    type: 'plants',
    price: '430',
  })

  const signatureResponse = await adminPage.request.post('/api/products', {
    headers: headers(),
    data: {
      name: 'Cross Browser Signature Candle',
      tagline: 'Signature candle',
      shortDescription: 'Signature candle description.',
      description: 'Signature candle full description.',
      story: 'Signature candle story.',
      price: 700,
      productType: 'candles',
      candleCategory: 'signature',
      packageCategory: 'candles',
      category: ['candles', 'signature'],
      subCategory: 'signature',
      tags: ['Signature'],
      image: '/assets/candles.jpeg',
      thumbnail: '/assets/candles.jpeg',
      images: ['/assets/candles.jpeg'],
      status: 'active',
    },
  })
  expect(signatureResponse.status()).toBe(201)
  const signature = (await signatureResponse.json()).data

  const artResponse = await adminPage.request.post('/api/products', {
    headers: headers(),
    data: {
      ...signature,
      _id: undefined,
      __v: undefined,
      slug: undefined,
      name: 'Cross Browser Art Candle',
      candleCategory: 'art',
      category: ['candles', 'art'],
      subCategory: 'art',
      price: 800,
    },
  })
  expect(artResponse.status()).toBe(201)
  const art = (await artResponse.json()).data

  await adminPage.reload()
  await expect(adminPage.getByText('4 products — 3 Candles, 1 Plants')).toBeVisible()

  const adminListResponse = await adminPage.request.get(
    '/api/products?productType=builder&includeInactive=true&limit=100',
    { headers: headers() },
  )
  expect(adminListResponse.status()).toBe(200)
  const adminProducts = (await adminListResponse.json()).data.products as Array<{
    _id: string
    __v: number
    name: string
    image: string
    imagePublicIds: string[]
    productType: string
    candleCategory: string
  }>
  const essential = adminProducts.find((product) => product.name === 'Cross Browser Essential Candle')!
  const plant = adminProducts.find((product) => product.name === 'Cross Browser Calm Plant')!
  expect(essential.image).toMatch(/^\/api\/images\/[0-9a-f]{24}$/)
  expect(plant).toMatchObject({ productType: 'plants', candleCategory: '' })

  for (const page of [storefrontB, storefrontPrivate]) {
    await page.goto('/build-your-package?category=candles')
    await expect(page.getByRole('heading', { name: 'Cross Browser Essential Candle', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cross Browser Signature Candle', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cross Browser Art Candle', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cross Browser Calm Plant', exact: true })).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('db_candle_products_v1'))).toBeNull()

    await page.goto('/build-your-package?category=plants')
    await expect(page.getByRole('heading', { name: 'Cross Browser Calm Plant', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cross Browser Essential Candle', exact: true })).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('db_plant_products_v1'))).toBeNull()
  }

  // Replace the main image and edit text/tags through the real admin form.
  const essentialRow = adminPage.getByRole('row').filter({ hasText: 'Cross Browser Essential Candle' })
  await essentialRow.getByTitle('Edit').click()
  await adminPage.getByLabel('Product Name').fill('Cross Browser Essential Candle Updated')
  await adminPage.getByRole('button', { name: 'Images', exact: true }).click()
  await adminPage.locator('input[type="file"]').setInputFiles({
    name: 'replacement.png',
    mimeType: 'image/png',
    buffer: replacementPng,
  })
  await adminPage.getByTitle('Set as main').click({ force: true })
  await adminPage.getByTitle('Remove').last().click({ force: true })
  await adminPage.getByRole('button', { name: 'Tags & Status', exact: true }).click()
  await adminPage.getByPlaceholder('Type a tag and press Enter...').fill('Edited')
  await adminPage.getByPlaceholder('Type a tag and press Enter...').press('Enter')
  await adminPage.locator('button[form="catalog-product-form"]').click()
  await expect(adminPage.getByText('Product updated successfully!')).toBeVisible()

  const afterEditList = await adminPage.request.get(
    '/api/products?productType=builder&includeInactive=true&limit=100',
    { headers: headers() },
  )
  const updatedEssential = ((await afterEditList.json()).data.products as typeof adminProducts)
    .find((product) => product._id === essential._id)!
  expect(updatedEssential.image).not.toBe(essential.image)
  expect((await adminPage.request.get(essential.image)).status()).toBe(404)
  expect((await adminPage.request.get(updatedEssential.image)).status()).toBe(200)

  const deactivateSignature = await adminPage.request.put(`/api/products/${signature._id}`, {
    headers: headers(),
    data: { status: 'draft', version: signature.__v },
  })
  expect(deactivateSignature.status()).toBe(200)

  const deleteArt = await adminPage.request.delete(`/api/products/${art._id}?version=${art.__v}`, {
    headers: headers(),
  })
  expect(deleteArt.status()).toBe(200)

  await storefrontPrivate.goto('/build-your-package?category=candles')
  await expect(storefrontPrivate.getByRole('heading', { name: 'Cross Browser Essential Candle Updated', exact: true })).toBeVisible()
  await expect(storefrontPrivate.getByRole('heading', { name: 'Cross Browser Signature Candle', exact: true })).toHaveCount(0)
  await expect(storefrontPrivate.getByRole('heading', { name: 'Cross Browser Art Candle', exact: true })).toHaveCount(0)

  const controlUrl = process.env.E2E_CONTROL_URL
  if (!controlUrl) throw new Error('E2E_CONTROL_URL was not initialized.')
  expect((await fetch(`${controlUrl}/restart`, { method: 'POST' })).status).toBe(204)

  const afterRestart = await adminPage.request.get(
    '/api/products?productType=builder&includeInactive=true&limit=100',
    { headers: headers() },
  )
  expect(afterRestart.status()).toBe(200)
  const afterRestartProducts = (await afterRestart.json()).data.products as typeof adminProducts
  expect(afterRestartProducts.map((product) => product._id).sort()).toEqual(
    [updatedEssential._id, plant._id, signature._id].sort(),
  )

  await storefrontB.goto('/build-your-package?category=candles')
  await storefrontB.getByRole('button', { name: 'Add Cross Browser Essential Candle Updated to package' }).click()
  const summary = storefrontB.getByLabel('Your package summary')
  await expect(summary.getByText('EGP 525', { exact: true }).last()).toBeVisible()
  await expect(summary.getByLabel('Original price EGP 650').first()).toHaveCSS('text-decoration-line', 'line-through')
  await summary.getByRole('button', { name: /Add Package to Cart/i }).click()
  await expect(storefrontB).toHaveURL(/\/cart$/)
  await expect(storefrontB.getByRole('link', { name: 'Custom Calming Space Package', exact: true })).toBeVisible()
  await expect(storefrontB.getByText('LE 525', { exact: true }).first()).toBeVisible()
  await expect(storefrontB.getByLabel('Original price LE 650').first()).toHaveCSS('text-decoration-line', 'line-through')

  expect(browserErrors).toEqual([])
  await browserA.close()
  await browserB.close()
  await privateWindow.close()
})

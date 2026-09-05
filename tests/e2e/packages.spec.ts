import { expect, test, type Page } from '@playwright/test'

const packagePng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

const updatedPackagePng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8z8BQDwAFgQIAKx3ZVwAAAABJRU5ErkJggg==',
  'base64',
)

function token() {
  if (!process.env.E2E_ADMIN_TOKEN) throw new Error('E2E_ADMIN_TOKEN was not initialized.')
  return process.env.E2E_ADMIN_TOKEN
}

async function expectImageSource(pageImage: ReturnType<Page['locator']>, source: string) {
  await expect.poll(async () => {
    const optimizedSource = await pageImage.getAttribute('src')
    return decodeURIComponent(optimizedSource || '')
  }).toContain(source)
}

async function openAdminPage(page: Page) {
  await page.addInitScript((authToken) => {
    localStorage.setItem('db_auth_token_v1', authToken)
    localStorage.setItem('db_custom_products_v1', JSON.stringify([{ id: 'browser-only-package' }]))
  }, token())
  await page.goto('/admin/products')
  await expect(page.getByText('0 packages in your catalog.')).toBeVisible()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('db_custom_products_v1'))).toBeNull()
}

test('package create and edit are confirmed in MongoDB and synchronized across browsers and restart', async ({ browser }) => {
  test.setTimeout(240_000)
  const adminContext = await browser.newContext()
  const storefrontContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  const storefrontPage = await storefrontContext.newPage()
  const browserErrors: string[] = []

  for (const page of [adminPage, storefrontPage]) {
    page.on('pageerror', (error) => browserErrors.push(`${page.url()}: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(`${page.url()}: ${message.text()}`)
    })
  }

  await openAdminPage(adminPage)
  await adminPage.getByRole('button', { name: 'Add Package' }).click()
  // "Stillness" previously triggered a hard-coded storefront image override.
  await adminPage.getByLabel('Package Name').fill('Stillness')
  await adminPage.getByLabel('Candle Scent').fill('Sandalwood + Sage')
  await adminPage.getByLabel('Short Description (Tagline)').fill('Created through the real package form.')
  await adminPage.getByLabel('Full Description').fill('Original package description stored in MongoDB.')
  await adminPage.getByLabel('Category').selectOption('calm')
  await adminPage.getByLabel('Collection').selectOption('return')
  await adminPage.getByLabel('Price (LE)').fill('1250')
  await adminPage.getByLabel('Stock Qty').fill('10')
  await adminPage.getByLabel('SKU').fill('E2E-PACKAGE-1')

  await adminPage.getByRole('button', { name: 'Images', exact: true }).click()
  await adminPage.locator('input[type="file"]').setInputFiles({
    name: 'package.png',
    mimeType: 'image/png',
    buffer: packagePng,
  })
  await expect(adminPage.getByText('Main', { exact: true })).toBeVisible()

  await adminPage.getByRole('button', { name: 'Tags & Status', exact: true }).click()
  await adminPage.getByPlaceholder('Type a tag and press Enter...').fill('E2E Package')
  await adminPage.getByPlaceholder('Type a tag and press Enter...').press('Enter')
  await adminPage.locator('button[form="product-form"]').click()
  await expect(adminPage.getByText('Package added successfully!')).toBeVisible()
  await expect(adminPage.getByRole('dialog')).toHaveCount(0)
  await expect(adminPage.getByRole('row').filter({ hasText: 'Stillness' })).toBeVisible()

  const headers = { Authorization: `Bearer ${token()}` }
  const firstListResponse = await adminPage.request.get(
    '/api/products?excludePackageCategory=fish&excludeProductType=builder&includeInactive=true&limit=100',
    { headers },
  )
  expect(firstListResponse.status()).toBe(200)
  const created = (await firstListResponse.json()).data.products.find(
    (product: { name: string }) => product.name === 'Stillness',
  )
  expect(created).toBeTruthy()
  expect(created.image).toMatch(/^\/api\/images\/[0-9a-f]{24}$/)

  await storefrontPage.goto('/packages')
  const storefrontCard = storefrontPage.getByRole('article').filter({ hasText: 'Stillness' })
  await expectImageSource(storefrontCard.locator('img'), created.image)

  const row = adminPage.getByRole('row').filter({ hasText: 'Stillness' })
  await row.getByTitle('Edit').click()
  await expect(adminPage.getByRole('dialog')).toBeVisible()
  await adminPage.getByLabel('Short Description (Tagline)').fill('Confirmed updated package tagline.')
  await adminPage.getByLabel('Full Description').fill('Confirmed updated package description.')
  await adminPage.getByLabel('Category').selectOption('self-care')
  await adminPage.getByLabel('Collection').selectOption('renewal')
  await adminPage.getByLabel('Price (LE)').fill('1475')
  await adminPage.getByLabel('Discount Price').fill('1390')
  await adminPage.getByLabel('Stock Qty').fill('20')
  await adminPage.getByLabel('Candle Scent').fill('Cedar + Fig')

  await adminPage.getByRole('button', { name: 'Images', exact: true }).click()
  await expect(adminPage.getByText('Main', { exact: true })).toBeVisible()
  await adminPage.getByTitle('Remove').first().click({ force: true })
  await adminPage.locator('input[type="file"]').setInputFiles({
    name: 'package-updated.png',
    mimeType: 'image/png',
    buffer: updatedPackagePng,
  })
  await expect(adminPage.getByText('Main', { exact: true })).toBeVisible()
  await adminPage.getByRole('button', { name: 'Product Details', exact: true }).click()
  await adminPage.getByLabel('Package Size').selectOption('large')
  await adminPage.getByLabel('Difficulty Level').selectOption('advanced')
  await adminPage.getByLabel('Light Requirement').selectOption('bright')
  await adminPage.getByLabel('Watering Frequency').selectOption('biweekly')
  await adminPage.getByRole('switch').nth(0).click()
  await adminPage.getByRole('switch').nth(1).click()
  await adminPage.getByRole('button', { name: 'Tags & Status', exact: true }).click()
  await adminPage.getByPlaceholder('Type a tag and press Enter...').fill('Edited')
  await adminPage.getByPlaceholder('Type a tag and press Enter...').press('Enter')
  await adminPage.locator('button[form="product-form"]').click()
  await expect(adminPage.getByText('Package updated successfully!')).toBeVisible()
  await expect(adminPage.getByRole('dialog')).toHaveCount(0)

  const afterEditResponse = await adminPage.request.get(
    '/api/products?excludePackageCategory=fish&excludeProductType=builder&includeInactive=true&limit=100',
    { headers },
  )
  expect(afterEditResponse.status()).toBe(200)
  const updated = (await afterEditResponse.json()).data.products.find(
    (product: { _id: string }) => product._id === created._id,
  )
  expect(updated).toMatchObject({
    _id: created._id,
    name: 'Stillness',
    tagline: 'Confirmed updated package tagline.',
    description: 'Confirmed updated package description.',
    price: 1475,
    discountPrice: 1390,
    stock: 20,
    category: ['self-care'],
    packageCollection: 'renewal',
    size: 'large',
    difficulty: 'advanced',
    light: 'bright',
    watering: 'biweekly',
    petFriendly: true,
    airPurifying: true,
    scent: 'Cedar + Fig',
    status: 'active',
    isActive: true,
  })
  expect(updated.__v).toBe(created.__v + 1)
  expect(updated.image).toMatch(/^\/api\/images\/[0-9a-f]{24}$/)
  expect(updated.image).not.toBe(created.image)

  await storefrontPage.reload()
  await expectImageSource(storefrontCard.locator('img'), updated.image)
  await expect(storefrontPage.getByText('LE 1,475', { exact: true })).toBeVisible()
  await storefrontPage.goto(`/packages/${updated.slug}`)
  await expect(storefrontPage.getByRole('heading', { name: 'Stillness' })).toBeVisible()
  await expectImageSource(storefrontPage.getByRole('img', { name: 'Stillness Collection' }), updated.image)
  await expect(storefrontPage.getByText('Confirmed updated package description.')).toBeVisible()

  const controlUrl = process.env.E2E_CONTROL_URL
  if (!controlUrl) throw new Error('E2E_CONTROL_URL was not initialized.')
  expect((await fetch(`${controlUrl}/restart`, { method: 'POST' })).status).toBe(204)

  const afterRestartResponse = await adminPage.request.get(
    '/api/products?excludePackageCategory=fish&excludeProductType=builder&includeInactive=true&limit=100',
    { headers },
  )
  const afterRestart = (await afterRestartResponse.json()).data.products.find(
    (product: { _id: string }) => product._id === created._id,
  )
  expect(afterRestart).toMatchObject({ name: 'Stillness', image: updated.image, price: 1475 })

  const deleteResponse = await adminPage.request.delete(
    `/api/products/${created._id}?version=${afterRestart.__v}`,
    { headers },
  )
  expect(deleteResponse.status()).toBe(200)
  expect(browserErrors).toEqual([])

  await adminContext.close()
  await storefrontContext.close()
})

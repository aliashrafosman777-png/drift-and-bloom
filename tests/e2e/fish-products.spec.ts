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

  const adminPage = await browserA.newPage()
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

import { expect, test, type Page } from '@playwright/test'

const publicRoutes = [
  '/',
  '/packages',
  '/packages/return',
  '/packages/growth',
  '/packages/stillness',
  '/packages/home',
  '/packages/grounded',
  '/packages/joy',
  '/packages/love',
  '/packages/dream',
  '/packages/renewal',
  '/packages/balance',
  '/build-your-package',
  '/build-your-package?category=fish',
  '/build-package',
  '/cart',
  '/find-your-soul',
  '/login',
  '/register',
  '/support',
  '/admin/login',
]

const adminRoutes = [
  '/admin',
  '/admin/products',
  '/admin/fish-products',
  '/admin/orders',
  '/admin/customers',
  '/admin/messages',
]

function watchPage(page: Page, issues: string[]) {
  page.on('pageerror', (error) => {
    issues.push(`${page.url()} uncaught error: ${error.message}`)
  })
  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push(`${page.url()} console error: ${message.text()}`)
    }
  })
  page.on('requestfailed', (request) => {
    issues.push(`${page.url()} failed request: ${request.method()} ${request.url()} (${request.failure()?.errorText})`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400) {
      issues.push(`${page.url()} unsuccessful response: ${response.status()} ${response.url()}`)
    }
  })
}

async function visitRoutes(page: Page, routes: string[], issues: string[]) {
  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), `${route} document status`).toBeLessThan(400)
    await page.waitForTimeout(300)

    const bodyText = await page.locator('body').innerText()
    expect(bodyText.trim().length, `${route} rendered body`).toBeGreaterThan(0)
    expect(bodyText, `${route} did not render Next.js error UI`).not.toContain('Application error: a client-side exception has occurred')
  }

  expect(issues).toEqual([])
}

test('all public storefront routes render without runtime, console, or server errors', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const issues: string[] = []
  watchPage(page, issues)

  await visitRoutes(page, publicRoutes, issues)
  await context.close()
})

test('all authenticated admin routes render without runtime, console, or server errors', async ({ browser }) => {
  const token = process.env.E2E_ADMIN_TOKEN
  if (!token) throw new Error('E2E_ADMIN_TOKEN was not initialized.')

  const context = await browser.newContext()
  await context.addInitScript((authToken) => {
    localStorage.setItem('db_auth_token_v1', authToken)
  }, token)
  const page = await context.newPage()
  const issues: string[] = []
  watchPage(page, issues)

  await visitRoutes(page, adminRoutes, issues)
  await context.close()
})

test('public and authenticated read APIs return successful structured responses', async ({ request }) => {
  const token = process.env.E2E_ADMIN_TOKEN
  if (!token) throw new Error('E2E_ADMIN_TOKEN was not initialized.')

  const publicEndpoints = [
    '/api/products?limit=100',
    '/api/products?packageCategory=fish&limit=100',
    '/api/categories',
  ]
  const adminEndpoints = [
    '/api/auth/profile',
    '/api/admin/stats',
    '/api/admin/customers',
    '/api/admin/messages',
    '/api/orders',
    '/api/coupons',
    '/api/game/progress',
    '/api/products?packageCategory=fish&includeInactive=true&limit=100',
  ]

  for (const endpoint of publicEndpoints) {
    const response = await request.get(endpoint)
    expect(response.status(), endpoint).toBe(200)
    const body = await response.json()
    expect(body, endpoint).toMatchObject({ success: true })
  }

  for (const endpoint of adminEndpoints) {
    const response = await request.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status(), endpoint).toBe(200)
    const body = await response.json()
    expect(body, endpoint).toMatchObject({ success: true })
  }

  const protectedResponse = await request.get('/api/admin/stats')
  expect(protectedResponse.status()).toBe(401)
  expect(await protectedResponse.json()).toMatchObject({ success: false })
})

test('soul quiz completes and renders a recommendation without browser errors', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const issues: string[] = []
  watchPage(page, issues)

  await page.goto('/find-your-soul', { waitUntil: 'domcontentloaded' })

  for (let question = 0; question < 30; question += 1) {
    await page.locator('button[aria-pressed]').first().click()
    const resultButton = page.getByRole('button', { name: 'See my result' })
    if (await resultButton.isVisible()) {
      await resultButton.click()
      break
    }
    await page.getByRole('button', { name: 'Next question' }).click()
  }

  await expect(page.getByText('Your Soul is:')).toBeVisible()
  expect(issues).toEqual([])
  await context.close()
})

import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ShopFlow/)
  })

  test('shows hero headline', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('has navbar with key links', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'All Products', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: /find vendors/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /farmers/i })).toBeVisible()
  })

  test('nav Products link goes to products page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('navigation').getByRole('link', { name: 'All Products', exact: true }).click()
    await page.waitForURL(/\/products/)
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible()
  })

  test('no hydration error in console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const hydrationErrors = errors.filter((e) => e.includes('hydrat'))
    expect(hydrationErrors).toHaveLength(0)
  })
})

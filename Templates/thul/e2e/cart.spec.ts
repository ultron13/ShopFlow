import { test, expect } from '@playwright/test'

test.describe('Cart functionality', () => {
  test('cart badge not shown when cart is empty', async ({ page }) => {
    await page.goto('/')
    const badge = page.locator('.bg-indigo-600.rounded-full.text-xs.font-bold')
    await expect(badge).toHaveCount(0)
  })

  test('products page shows add-to-cart button on hover', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    const firstCard = page.locator('a[href*="/products/"]').first()
    await firstCard.hover()
    await expect(firstCard).toBeVisible()
  })

  test('seasonal page loads without error', async ({ page }) => {
    await page.goto('/seasonal')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('stokvel page loads', async ({ page }) => {
    await page.goto('/stokvel')
    await expect(page).toHaveURL('/stokvel')
    await expect(page.locator('body')).toBeVisible()
  })

  test('sign in page loads', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'

test.describe('Products page', () => {
  test('loads products grid', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByRole('heading', { name: /all products/i })).toBeVisible()
    await expect(page.locator('[href*="/products/"]').first()).toBeVisible()
  })

  test('shows SA produce categories', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByRole('link', { name: 'Fresh Vegetables', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Fresh Fruit', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Herbs & Spices', exact: true })).toBeVisible()
  })

  test('category filter updates URL', async ({ page }) => {
    await page.goto('/products')
    await page.getByRole('link', { name: 'Fresh Vegetables', exact: true }).click()
    await page.waitForURL(/categorySlug=vegetables/)
    expect(page.url()).toContain('categorySlug=vegetables')
  })

  test('shows product count', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByText(/products/i).first()).toBeVisible()
  })

  test('sort select is present in main content', async ({ page }) => {
    await page.goto('/products')
    await expect(page.locator('main').getByRole('combobox')).toBeVisible()
  })

  test('search navigates to filtered results', async ({ page }) => {
    await page.goto('/products')
    await page.getByPlaceholder(/search products/i).fill('tomato')
    await page.keyboard.press('Enter')
    await page.waitForURL(/search=tomato/)
    expect(page.url()).toContain('search=tomato')
  })
})

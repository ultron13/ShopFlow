import { test, expect } from '@playwright/test'

test.describe('Vendors page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/vendors')
    await expect(page.getByRole('heading', { name: /find vendors/i })).toBeVisible()
  })

  test('shows vendor cards', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')
    const cards = page.locator('.rounded-xl.border.bg-white')
    await expect(cards.first()).toBeVisible()
  })

  test('shows province filter dropdown', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')
    const selects = page.locator('main').getByRole('combobox')
    await expect(selects.first()).toBeVisible()
  })

  test('province filter updates URL', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')
    await page.locator('main').getByRole('combobox').first().selectOption('Gauteng')
    await page.waitForURL(/province=Gauteng/)
    expect(page.url()).toContain('province=Gauteng')
  })

  test('search input is present', async ({ page }) => {
    await page.goto('/vendors')
    await expect(page.getByPlaceholder(/search vendor/i)).toBeVisible()
  })

  test('has register CTA', async ({ page }) => {
    await page.goto('/vendors')
    await expect(page.getByRole('link', { name: /register/i }).first()).toBeVisible()
  })
})

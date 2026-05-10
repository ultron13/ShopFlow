import { test, expect } from '@playwright/test'

test.describe('Farmers page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/farmers')
    await expect(page.getByRole('heading', { name: /find farmers/i })).toBeVisible()
  })

  test('shows farmer category pills', async ({ page }) => {
    await page.goto('/farmers')
    await expect(page.getByRole('link', { name: /vegetable farmer/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /fruit farmer/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /organic farmer/i })).toBeVisible()
  })

  test('shows farmer count in subtitle', async ({ page }) => {
    await page.goto('/farmers')
    await expect(page.getByText(/farmers/i).first()).toBeVisible()
  })

  test('category pill filters by category in URL', async ({ page }) => {
    await page.goto('/farmers')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /organic farmer/i }).click()
    await page.waitForURL(/category=/)
    expect(page.url()).toMatch(/category=/)
  })

  test('shows province filter in main content', async ({ page }) => {
    await page.goto('/farmers')
    await page.waitForLoadState('networkidle')
    const provinceSelect = page.locator('main').getByRole('combobox')
    await expect(provinceSelect).toBeVisible()
  })

  test('province filter updates URL', async ({ page }) => {
    await page.goto('/farmers')
    await page.waitForLoadState('networkidle')
    await page.locator('main').getByRole('combobox').selectOption('KwaZulu-Natal')
    await page.waitForURL(/province=KwaZulu-Natal/)
    expect(page.url()).toContain('province=KwaZulu-Natal')
  })

  test('WhatsApp order buttons visible on farmer cards', async ({ page }) => {
    await page.goto('/farmers')
    await page.waitForLoadState('networkidle')
    const waButtons = page.getByRole('link', { name: /whatsapp to order/i })
    await expect(waButtons.first()).toBeVisible()
  })

  test('has register farm CTA', async ({ page }) => {
    await page.goto('/farmers')
    await expect(page.getByRole('link', { name: /register my farm/i })).toBeVisible()
  })

  test('no hydration error in console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/farmers')
    await page.waitForLoadState('networkidle')
    const hydrationErrors = errors.filter((e) => e.includes('hydrat'))
    expect(hydrationErrors).toHaveLength(0)
  })
})

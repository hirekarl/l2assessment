import { test, expect } from '@playwright/test'

test.describe('Visual Snapshot Regression', () => {
  test('HomePage layout snapshot matches baseline', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.05,
    })
  })

  test('AnalyzePage layout snapshot matches baseline', async ({ page }) => {
    await page.goto('/analyze')
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('analyze-page.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})

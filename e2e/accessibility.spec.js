import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = ['/', '/analyze', '/history', '/dashboard']

test.describe('Accessibility', () => {
  for (const route of routes) {
    test(`${route} has no detectable axe violations`, async ({ page }) => {
      await page.goto(route)
      // Pages are lazy-loaded behind Suspense, so wait for the real content
      // (not just the loading spinner) before auditing.
      await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }

  test('Analyze results view has no detectable axe violations', async ({ page }) => {
    await page.goto('/analyze')
    await page
      .getByPlaceholder('Paste customer message here...')
      .fill('The app crashed again, this is urgent')
    await page.getByRole('button', { name: 'Analyze Message' }).click()
    await expect(page.getByText('Analysis Results')).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
})

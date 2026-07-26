import { test, expect } from '@playwright/test'

// This static build has no /api backend, so every analysis runs through the
// local keyword-based fallback — which is exactly what these flows exercise:
// the fallback banner, category/urgency routing, escalation, and history.

test.describe('Analyze -> History flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze')
  })

  test('analyzes a message and shows the fallback banner with category/urgency', async ({ page }) => {
    await page.getByPlaceholder('Paste customer message here...').fill('My invoice is wrong, please refund me')
    await page.getByRole('button', { name: 'Analyze Message' }).click()

    await expect(page.getByText('Analysis Results')).toBeVisible()
    await expect(page.getByText('⚠ Fallback Mode')).toBeVisible()
    await expect(page.getByText('Billing Issue')).toBeVisible()
  })

  test('shows the escalate banner for a high-urgency outage message', async ({ page }) => {
    await page.getByPlaceholder('Paste customer message here...').fill('The service is down for everyone, this is urgent')
    await page.getByRole('button', { name: 'Analyze Message' }).click()

    await expect(page.getByText('⚠ ESCALATE')).toBeVisible()
    await expect(page.getByText('Technical Problem')).toBeVisible()
  })

  test('persists the analyzed message to History', async ({ page }) => {
    const message = `E2E test message ${Date.now()}`
    await page.getByPlaceholder('Paste customer message here...').fill(message)
    await page.getByRole('button', { name: 'Analyze Message' }).click()
    await expect(page.getByText('Analysis Results')).toBeVisible()

    await page.getByRole('link', { name: 'History' }).click()
    await expect(page.getByText(new RegExp(message))).toBeVisible()
  })

  test('Clear resets the form and hides results', async ({ page }) => {
    await page.getByPlaceholder('Paste customer message here...').fill('a question about my account')
    await page.getByRole('button', { name: 'Analyze Message' }).click()
    await expect(page.getByText('Analysis Results')).toBeVisible()

    await page.getByRole('button', { name: 'Clear' }).click()

    await expect(page.getByText('Analysis Results')).not.toBeVisible()
    await expect(page.getByPlaceholder('Paste customer message here...')).toHaveValue('')
  })
})

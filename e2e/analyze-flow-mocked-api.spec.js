import { test, expect } from '@playwright/test'

// Intercepts /api/categorize at the network layer via page.route, so these
// scenarios work against the static preview build (no real backend needed)
// while exercising response paths analyze-flow.spec.js's real fallback can't:
// a successful LLM response, and a backend-reported (502) provider failure.

test.describe('Analyze flow with a mocked /api/categorize', () => {
  test('shows the AI-analyzed banner for a successful llm response', async ({ page }) => {
    await page.route('**/api/categorize', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          category: 'Billing Issue',
          urgency: 'High',
          reasoning: 'Customer reports a duplicate charge.',
          source: 'llm',
        }),
      })
    )

    await page.goto('/analyze')
    await page
      .getByPlaceholder('Paste customer message here...')
      .fill('I was charged twice for my subscription')
    await page.getByRole('button', { name: 'Analyze Message' }).click()

    await expect(page.getByText('Analysis Results')).toBeVisible()
    await expect(page.getByText('✓ AI-analyzed')).toBeVisible()
    await expect(page.getByText('Billing Issue')).toBeVisible()
  })

  test('shows the fallback banner with the backend-reported reason on a 502 provider failure', async ({
    page,
  }) => {
    await page.route('**/api/categorize', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          category: 'Technical Problem',
          urgency: 'High',
          reasoning: 'Keyword-based fallback classification.',
          source: 'mock',
          mockReason: 'Rate limit exceeded',
        }),
      })
    )

    await page.goto('/analyze')
    await page
      .getByPlaceholder('Paste customer message here...')
      .fill('The app keeps crashing on login')
    await page.getByRole('button', { name: 'Analyze Message' }).click()

    await expect(page.getByText('Analysis Results')).toBeVisible()
    await expect(page.getByText(/Rate limit exceeded/)).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('lands on the Home page and links to Analyze, History, and Dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Welcome to Relay AI Customer Triage')).toBeVisible()

    const nav = page.getByRole('navigation')

    await nav.getByRole('link', { name: 'Analyze', exact: true }).click()
    await expect(page).toHaveURL(/\/analyze$/)
    await expect(page.getByText('Analyze Customer Message')).toBeVisible()

    await nav.getByRole('link', { name: 'History', exact: true }).click()
    await expect(page).toHaveURL(/\/history$/)
    await expect(page.getByText('Analysis History')).toBeVisible()

    await nav.getByRole('link', { name: 'Dashboard', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText('Overview of message triage analytics')).toBeVisible()
  })
})

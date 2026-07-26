import { test, expect } from '@playwright/test'

test.describe('Dark mode toggle', () => {
  test('toggles the dark class on <html> and persists across reload', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const isDark = () => html.evaluate(el => el.classList.contains('dark'))

    const initiallyDark = await isDark()
    const toggleName = initiallyDark ? 'Switch to light mode' : 'Switch to dark mode'

    await page.getByRole('button', { name: toggleName }).click()
    expect(await isDark()).toBe(!initiallyDark)

    await page.reload()
    expect(await isDark()).toBe(!initiallyDark)
  })
})

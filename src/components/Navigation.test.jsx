import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import Navigation from './Navigation.jsx'
import { ThemeProvider } from '../contexts/ThemeContext.jsx'

function renderNavigation(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Navigation', () => {
  it('renders links to all four pages', () => {
    renderNavigation()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Analyze')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('highlights the active route', () => {
    renderNavigation('/analyze')
    expect(screen.getByText('Analyze')).toHaveClass('bg-blue-700')
    expect(screen.getByText('Home')).not.toHaveClass('bg-blue-700')
  })

  it('highlights History when on /history', () => {
    renderNavigation('/history')
    expect(screen.getByText('History')).toHaveClass('bg-blue-700')
  })

  it('highlights Dashboard when on /dashboard', () => {
    renderNavigation('/dashboard')
    expect(screen.getByText('Dashboard')).toHaveClass('bg-blue-700')
  })

  it('toggles the theme icon when clicked', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false })
    renderNavigation()

    const toggle = screen.getByRole('button', { name: /switch to dark mode/i })
    await user.click(toggle)

    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })
})

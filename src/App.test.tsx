import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App, { AppShell, PageLoader } from './App'
import { ThemeProvider } from './contexts/ThemeContext'

describe('App', () => {
  beforeAll(async () => {
    await import('./pages/HomePage')
    await import('./pages/AnalyzePage')
    await import('./pages/HistoryPage')
    await import('./pages/DashboardPage')
  })
  it('renders the navigation and the home page by default', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    expect(screen.getByText('Relay AI')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Welcome to Relay AI Customer Triage')).toBeInTheDocument()
    })
  })

  it('renders the analyze page route', async () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/analyze']}>
          <AppShell />
        </MemoryRouter>
      </ThemeProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Analyze Customer Message')).toBeInTheDocument()
    })
  })

  it('renders the history page route', async () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/history']}>
          <AppShell />
        </MemoryRouter>
      </ThemeProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument()
    })
  })

  it('renders the dashboard page route', async () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppShell />
        </MemoryRouter>
      </ThemeProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('renders the PageLoader component', () => {
    const { container } = render(<PageLoader />)
    expect(container.firstChild).toHaveClass('flex items-center justify-center')
  })
})

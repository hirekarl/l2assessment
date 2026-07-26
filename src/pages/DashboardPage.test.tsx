import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('shows zeroed stats and empty states with no history', () => {
    render(<DashboardPage />)
    expect(screen.getAllByText('No data yet')).toHaveLength(2)
    expect(screen.getByText(/Start by analyzing/)).toBeInTheDocument()
  })

  it('renders stats, category distribution, and urgency breakdown from history', () => {
    localStorage.setItem(
      'triageHistory',
      JSON.stringify([
        { category: 'Billing Issue', urgency: 'High', timestamp: new Date().toISOString() },
        { category: 'Feature Request', urgency: 'Low', timestamp: new Date().toISOString() },
      ])
    )

    render(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Billing Issue')).toBeInTheDocument()
    expect(screen.getByText('Feature Request')).toBeInTheDocument()
  })
})

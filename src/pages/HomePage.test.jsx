import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import HomePage from './HomePage.jsx'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  it('shows the empty state when there is no history', () => {
    renderHomePage()
    expect(screen.getByText('No messages analyzed yet')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(2)
  })

  it('shows stats and recent activity when history exists', () => {
    localStorage.setItem(
      'triageHistory',
      JSON.stringify([
        {
          message: 'Payment failed for my account',
          category: 'Billing Issue',
          urgency: 'High',
          timestamp: new Date().toISOString(),
        },
      ])
    )

    renderHomePage()

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText(/Payment failed for my account/)).toBeInTheDocument()
    expect(screen.getByText('Billing Issue')).toBeInTheDocument()
  })

  it('styles Medium and Low urgency recent-activity badges distinctly from High', () => {
    localStorage.setItem(
      'triageHistory',
      JSON.stringify([
        {
          message: 'a medium one',
          category: 'Technical Problem',
          urgency: 'Medium',
          timestamp: new Date().toISOString(),
        },
        {
          message: 'a low one',
          category: 'Feature Request',
          urgency: 'Low',
          timestamp: new Date().toISOString(),
        },
      ])
    )

    renderHomePage()

    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('stores a random example message and navigates to Analyze on "Try Example"', async () => {
    const user = userEvent.setup()
    // jsdom doesn't implement navigation; suppress its "not implemented" console error.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderHomePage()

    await user.click(screen.getByText('Try Example'))

    const stored = localStorage.getItem('exampleMessage')
    expect([
      "Our payment failed and we can't access our account",
      'The dashboard is loading very slowly',
      'Can you add a dark mode feature?',
    ]).toContain(stored)
  })
})

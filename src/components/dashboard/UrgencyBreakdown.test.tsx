import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UrgencyBreakdown from './UrgencyBreakdown'

describe('UrgencyBreakdown', () => {
  it('shows an empty state with no data', () => {
    render(<UrgencyBreakdown urgencyData={{ High: 0, Medium: 0, Low: 0 }} total={0} />)
    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('renders counts for each urgency level', () => {
    render(<UrgencyBreakdown urgencyData={{ High: 2, Medium: 1, Low: 5 }} total={8} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

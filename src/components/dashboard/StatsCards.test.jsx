import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsCards from './StatsCards.jsx'

describe('StatsCards', () => {
  it('renders all four stat values', () => {
    render(<StatsCards stats={{ total: 12, today: 3, highUrgencyPercent: 25, avgPerDay: 2 }} />)

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Total Messages')).toBeInTheDocument()
    expect(screen.getByText('Avg Per Day')).toBeInTheDocument()
  })
})

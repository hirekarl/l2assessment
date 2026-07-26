import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryDistribution from './CategoryDistribution.jsx'

describe('CategoryDistribution', () => {
  it('shows an empty state with no data', () => {
    render(<CategoryDistribution categoryData={[]} total={0} />)
    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('shows 0% for each row when total is 0 despite non-empty categoryData', () => {
    render(<CategoryDistribution categoryData={[{ name: 'Billing Issue', count: 1 }]} total={0} />)
    expect(screen.getByText('1 (0%)')).toBeInTheDocument()
  })

  it('renders each category with its count and percentage', () => {
    render(
      <CategoryDistribution
        categoryData={[
          { name: 'Billing Issue', count: 3 },
          { name: 'Feature Request', count: 1 },
        ]}
        total={4}
      />
    )

    expect(screen.getByText('Billing Issue')).toBeInTheDocument()
    expect(screen.getByText('3 (75%)')).toBeInTheDocument()
    expect(screen.getByText('Feature Request')).toBeInTheDocument()
    expect(screen.getByText('1 (25%)')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryFilters from './HistoryFilters.jsx'

const history = [
  { category: 'Billing Issue' },
  { category: 'Billing Issue' },
  { category: 'Feature Request' }
]

describe('HistoryFilters', () => {
  it('hides Clear All and filter chips when history is empty', () => {
    render(<HistoryFilters history={[]} categories={[]} filter="all" onFilterChange={() => {}} onClearAll={() => {}} />)
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
  })

  it('renders a chip per category with its count', () => {
    render(<HistoryFilters
      history={history}
      categories={['Billing Issue', 'Feature Request']}
      filter="all"
      onFilterChange={() => {}}
      onClearAll={() => {}}
    />)
    expect(screen.getByText('All (3)')).toBeInTheDocument()
    expect(screen.getByText('Billing Issue (2)')).toBeInTheDocument()
    expect(screen.getByText('Feature Request (1)')).toBeInTheDocument()
  })

  it('calls onFilterChange with "all" when the All chip is clicked', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    render(<HistoryFilters
      history={history}
      categories={['Billing Issue', 'Feature Request']}
      filter="Billing Issue"
      onFilterChange={onFilterChange}
      onClearAll={() => {}}
    />)

    await user.click(screen.getByText('All (3)'))
    expect(onFilterChange).toHaveBeenCalledWith('all')
  })

  it('calls onFilterChange with the clicked category', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    render(<HistoryFilters
      history={history}
      categories={['Billing Issue', 'Feature Request']}
      filter="all"
      onFilterChange={onFilterChange}
      onClearAll={() => {}}
    />)

    await user.click(screen.getByText('Feature Request (1)'))
    expect(onFilterChange).toHaveBeenCalledWith('Feature Request')
  })

  it('calls onClearAll when Clear All is clicked', async () => {
    const user = userEvent.setup()
    const onClearAll = vi.fn()
    render(<HistoryFilters history={history} categories={[]} filter="all" onFilterChange={() => {}} onClearAll={onClearAll} />)

    await user.click(screen.getByText('Clear All'))
    expect(onClearAll).toHaveBeenCalled()
  })
})

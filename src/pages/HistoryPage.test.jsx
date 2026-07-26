import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryPage from './HistoryPage.jsx'

function seed(entries) {
  localStorage.setItem('triageHistory', JSON.stringify(entries))
}

describe('HistoryPage', () => {
  it('shows an empty state with no history', () => {
    render(<HistoryPage />)
    expect(screen.getByText('No history yet')).toBeInTheDocument()
  })

  it('sorts history newest-first', () => {
    seed([
      { message: 'older', category: 'General Inquiry', urgency: 'Low', timestamp: '2026-01-01T00:00:00.000Z' },
      { message: 'newer', category: 'General Inquiry', urgency: 'Low', timestamp: '2026-06-01T00:00:00.000Z' }
    ])
    render(<HistoryPage />)

    const messages = screen.getAllByText(/"(older|newer)"/).map(el => el.textContent)
    expect(messages[0]).toContain('newer')
    expect(messages[1]).toContain('older')
  })

  it('filters by category when a filter chip is clicked', async () => {
    seed([
      { message: 'a billing issue', category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
      { message: 'a feature idea', category: 'Feature Request', urgency: 'Low', timestamp: new Date().toISOString() }
    ])
    const user = userEvent.setup()
    render(<HistoryPage />)

    await user.click(screen.getByText('Feature Request (1)'))

    expect(screen.getByText(/a feature idea/)).toBeInTheDocument()
    expect(screen.queryByText(/a billing issue/)).not.toBeInTheDocument()
  })

  it('clears all history after confirmation', async () => {
    seed([{ message: 'to be cleared', category: 'General Inquiry', urgency: 'Low', timestamp: new Date().toISOString() }])
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<HistoryPage />)

    await user.click(screen.getByText('Clear All'))

    expect(screen.getByText('No history yet')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('triageHistory'))).toEqual([])
  })

  it('does not clear history if the confirmation is declined', async () => {
    seed([{ message: 'stays', category: 'General Inquiry', urgency: 'Low', timestamp: new Date().toISOString() }])
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<HistoryPage />)

    await user.click(screen.getByText('Clear All'))

    expect(screen.getByText(/stays/)).toBeInTheDocument()
  })

  it('expands an item to show its full details on click, and collapses it again on a second click', async () => {
    seed([{
      message: 'short', category: 'General Inquiry', urgency: 'Low',
      recommendedAction: 'Do the thing', reasoning: 'Because', timestamp: new Date().toISOString()
    }])
    const user = userEvent.setup()
    render(<HistoryPage />)

    await user.click(screen.getByText(/"short"/))
    expect(screen.getByText('Do the thing')).toBeInTheDocument()

    await user.click(screen.getByText(/"short"/))
    expect(screen.queryByText('Do the thing')).not.toBeInTheDocument()
  })
})

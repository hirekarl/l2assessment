import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryItem from './HistoryItem'
import type { TriageHistoryItem } from '../../types/triage'

const baseItem: TriageHistoryItem = {
  timestamp: '2026-01-01T12:00:00.000Z',
  message: 'A short message',
  category: 'Billing Issue',
  urgency: 'High',
  escalate: true,
  recommendedAction: 'Escalate to billing.',
  reasoning: 'Because reasons.',
  source: 'llm',
}

describe('HistoryItem', () => {
  it('renders the truncated message, category, and urgency badges', () => {
    render(<HistoryItem item={baseItem} isExpanded={false} onToggle={() => {}} />)
    expect(screen.getByText(/A short message/)).toBeInTheDocument()
    expect(screen.getByText('Billing Issue')).toBeInTheDocument()
    expect(screen.getByText('High Urgency')).toBeInTheDocument()
    expect(screen.getByText('Escalate')).toBeInTheDocument()
  })

  it('does not show the Fallback badge for llm-sourced entries', () => {
    render(
      <HistoryItem item={{ ...baseItem, source: 'llm' }} isExpanded={false} onToggle={() => {}} />
    )
    expect(screen.queryByText('⚠ Fallback')).not.toBeInTheDocument()
  })

  it('shows the Fallback badge for mock-sourced entries', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, source: 'mock', mockReason: 'Invalid API key' }}
        isExpanded={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('⚠ Fallback')).toBeInTheDocument()
  })

  it('falls back to a generic tooltip when a mock entry has no mockReason', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, source: 'mock', mockReason: undefined }}
        isExpanded={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('⚠ Fallback')).toHaveAttribute('title', 'Fallback mode')
  })

  it('truncates messages longer than 100 characters with an ellipsis', () => {
    const longMessage = 'a'.repeat(150)
    render(
      <HistoryItem
        item={{ ...baseItem, message: longMessage }}
        isExpanded={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText(`"${'a'.repeat(100)}..."`)).toBeInTheDocument()
  })

  it('styles Medium urgency distinctly', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, urgency: 'Medium' }}
        isExpanded={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('Medium Urgency')).toBeInTheDocument()
  })

  it('hides expanded details when collapsed and shows them when expanded', () => {
    const { rerender } = render(
      <HistoryItem item={baseItem} isExpanded={false} onToggle={() => {}} />
    )
    expect(screen.queryByText('Full Message')).not.toBeInTheDocument()

    rerender(<HistoryItem item={baseItem} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Full Message')).toBeInTheDocument()
    expect(screen.getByText('Escalate to billing.')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<HistoryItem item={baseItem} isExpanded={false} onToggle={onToggle} />)

    await user.click(screen.getByText(/A short message/))
    expect(onToggle).toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultsPanel from './ResultsPanel.jsx'

const baseResults = {
  category: 'Billing Issue',
  urgency: 'High',
  recommendedAction: 'Escalate to billing.',
  reasoning: 'Duplicate charge reported.',
  escalate: true,
  source: 'llm'
}

describe('ResultsPanel', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('shows the AI-analyzed banner for llm-sourced results', () => {
    render(<ResultsPanel results={baseResults} />)
    expect(screen.getByText('✓ AI-analyzed')).toBeInTheDocument()
  })

  it('shows the fallback banner with the reason for mock-sourced results', () => {
    render(<ResultsPanel results={{ ...baseResults, source: 'mock', mockReason: 'Invalid API key' }} />)
    expect(screen.getByText('⚠ Fallback Mode')).toBeInTheDocument()
    expect(screen.getByText(/Invalid API key/)).toBeInTheDocument()
  })

  it('shows the escalate banner only when escalate is true', () => {
    const { rerender } = render(<ResultsPanel results={baseResults} />)
    expect(screen.getByText('⚠ ESCALATE')).toBeInTheDocument()

    rerender(<ResultsPanel results={{ ...baseResults, escalate: false }} />)
    expect(screen.queryByText('⚠ ESCALATE')).not.toBeInTheDocument()
  })

  it('styles Medium urgency distinctly from High and Low', () => {
    render(<ResultsPanel results={{ ...baseResults, urgency: 'Medium' }} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders category, urgency, recommended action, and reasoning', () => {
    render(<ResultsPanel results={baseResults} />)
    expect(screen.getByText('Billing Issue')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Escalate to billing.')).toBeInTheDocument()
    expect(screen.getByText('Duplicate charge reported.')).toBeInTheDocument()
  })

  it('copies a formatted summary to the clipboard when Copy Results is clicked', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    render(<ResultsPanel results={baseResults} />)

    await user.click(screen.getByText('📋 Copy Results'))

    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining('Category: Billing Issue')
    )
    expect(window.alert).toHaveBeenCalledWith('Results copied to clipboard!')
  })
})

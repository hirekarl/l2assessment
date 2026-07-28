import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnalyzePage from './AnalyzePage'
import { categorizeMessage } from '../utils/llmHelper'
import { useTriageHistory } from '../hooks/useTriageHistory'

vi.mock('../utils/llmHelper', () => ({
  categorizeMessage: vi.fn(),
}))

vi.mock('../hooks/useTriageHistory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useTriageHistory')>()
  return { ...actual, useTriageHistory: vi.fn(actual.useTriageHistory) }
})

describe('AnalyzePage', () => {
  it('shows an inline error and does not analyze when the message is empty', async () => {
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.click(screen.getByText('Analyze Message'))

    expect(await screen.findByText('Please enter a message to analyze')).toBeInTheDocument()
    expect(categorizeMessage).not.toHaveBeenCalled()
  })

  it('analyzes a message and displays the results', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'Billing Issue',
      urgency: 'High',
      reasoning: 'Duplicate charge.',
      source: 'llm',
    })
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.type(
      screen.getByPlaceholderText('Paste customer message here...'),
      'I was charged twice'
    )
    await user.click(screen.getByText('Analyze Message'))

    expect(await screen.findByText('Analysis Results')).toBeInTheDocument()
    expect(screen.getByText('✓ AI-analyzed')).toBeInTheDocument()
    expect(screen.getByText('Billing Issue')).toBeInTheDocument()
  })

  it('pre-fills the message from a stored example and clears it', async () => {
    localStorage.setItem('exampleMessage', 'Example customer message')
    render(<AnalyzePage />)

    expect(screen.getByDisplayValue('Example customer message')).toBeInTheDocument()
    expect(localStorage.getItem('exampleMessage')).toBeNull()
  })

  it('clears the message, error, and results when Clear is clicked', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'General Inquiry',
      urgency: 'Low',
      reasoning: 'ok',
      source: 'llm',
    })
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.type(screen.getByPlaceholderText('Paste customer message here...'), 'a question')
    await user.click(screen.getByText('Analyze Message'))
    expect(await screen.findByText('Analysis Results')).toBeInTheDocument()

    await user.click(screen.getByText('Clear'))

    expect(screen.queryByText('Analysis Results')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste customer message here...')).toHaveValue('')
  })

  it('shows an inline error alert if analysis fails unexpectedly', async () => {
    vi.mocked(categorizeMessage).mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.type(screen.getByPlaceholderText('Paste customer message here...'), 'anything')
    await user.click(screen.getByText('Analyze Message'))

    expect(
      await screen.findByText('Error analyzing message. Please try again.')
    ).toBeInTheDocument()
  })

  it('dismisses the inline error alert', async () => {
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.click(screen.getByText('Analyze Message'))
    expect(await screen.findByText('Please enter a message to analyze')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Dismiss'))

    expect(screen.queryByText('Please enter a message to analyze')).not.toBeInTheDocument()
  })

  it('renders results with a distinct notice when saving to history fails', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'General Inquiry',
      urgency: 'Low',
      reasoning: 'ok',
      source: 'llm',
    })
    vi.mocked(useTriageHistory).mockReturnValue({
      history: [],
      appendEntry: () => {
        throw new Error('quota exceeded')
      },
      clearHistory: () => {},
    })
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.type(screen.getByPlaceholderText('Paste customer message here...'), 'a question')
    await user.click(screen.getByText('Analyze Message'))

    expect(await screen.findByText('Analysis Results')).toBeInTheDocument()
    expect(screen.getByText("Analysis complete, but couldn't save to history.")).toBeInTheDocument()
  })
})

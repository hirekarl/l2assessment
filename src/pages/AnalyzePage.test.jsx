import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnalyzePage from './AnalyzePage.jsx'
import { categorizeMessage } from '../utils/llmHelper.js'

vi.mock('../utils/llmHelper.js', () => ({
  categorizeMessage: vi.fn()
}))

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('alerts and does not analyze when the message is empty', async () => {
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.click(screen.getByText('Analyze Message'))

    expect(window.alert).toHaveBeenCalledWith('Please enter a message to analyze')
    expect(categorizeMessage).not.toHaveBeenCalled()
  })

  it('analyzes a message and displays the results', async () => {
    categorizeMessage.mockResolvedValue({
      category: 'Billing Issue',
      urgency: 'High',
      reasoning: 'Duplicate charge.',
      source: 'llm'
    })
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.type(screen.getByPlaceholderText('Paste customer message here...'), 'I was charged twice')
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

  it('clears the message and results when Clear is clicked', async () => {
    categorizeMessage.mockResolvedValue({
      category: 'General Inquiry', urgency: 'Low', reasoning: 'ok', source: 'llm'
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

  it('shows an error alert if analysis fails unexpectedly', async () => {
    categorizeMessage.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<AnalyzePage />)

    await user.type(screen.getByPlaceholderText('Paste customer message here...'), 'anything')
    await user.click(screen.getByText('Analyze Message'))

    await vi.waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error analyzing message. Please try again.')
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageForm from './MessageForm'

describe('MessageForm', () => {
  it('shows the character count for the current message', () => {
    render(
      <MessageForm
        message="hello"
        onMessageChange={() => {}}
        onAnalyze={() => {}}
        onClear={() => {}}
        isLoading={false}
      />
    )
    expect(screen.getByText('5 characters')).toBeInTheDocument()
  })

  it('calls onMessageChange as the user types', async () => {
    const user = userEvent.setup()
    const onMessageChange = vi.fn()
    render(
      <MessageForm
        message=""
        onMessageChange={onMessageChange}
        onAnalyze={() => {}}
        onClear={() => {}}
        isLoading={false}
      />
    )

    await user.type(screen.getByPlaceholderText('Paste customer message here...'), 'hi')
    expect(onMessageChange).toHaveBeenCalled()
  })

  it('calls onAnalyze when the Analyze button is clicked', async () => {
    const user = userEvent.setup()
    const onAnalyze = vi.fn()
    render(
      <MessageForm
        message="hi"
        onMessageChange={() => {}}
        onAnalyze={onAnalyze}
        onClear={() => {}}
        isLoading={false}
      />
    )

    await user.click(screen.getByText('Analyze Message'))
    expect(onAnalyze).toHaveBeenCalled()
  })

  it('calls onClear when the Clear button is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <MessageForm
        message="hi"
        onMessageChange={() => {}}
        onAnalyze={() => {}}
        onClear={onClear}
        isLoading={false}
      />
    )

    await user.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalled()
  })

  it('disables inputs and shows a spinner while loading', () => {
    render(
      <MessageForm
        message="hi"
        onMessageChange={() => {}}
        onAnalyze={() => {}}
        onClear={() => {}}
        isLoading={true}
      />
    )
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste customer message here...')).toBeDisabled()
  })
})

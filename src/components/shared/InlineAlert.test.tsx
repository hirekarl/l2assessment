import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import InlineAlert from './InlineAlert'

describe('InlineAlert', () => {
  it('renders an error variant with role="alert" and assertive live region', () => {
    render(<InlineAlert variant="error" message="Something broke" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Something broke')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders a notice variant with role="status" and polite live region', () => {
    render(<InlineAlert variant="notice" message="Saved with a caveat" />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Saved with a caveat')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('does not render a dismiss button when onDismiss is omitted', () => {
    render(<InlineAlert variant="error" message="No dismiss here" />)

    expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<InlineAlert variant="error" message="Dismiss me" onDismiss={onDismiss} />)

    await user.click(screen.getByLabelText('Dismiss'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

const reportErrorMock = vi.fn()
vi.mock('../../utils/observability', () => ({
  reportError: (...args: unknown[]) => reportErrorMock(...args),
}))

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal Content</div>
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    reportErrorMock.mockClear()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal Content')).toBeInTheDocument()
  })

  it('renders default error UI when an uncaught error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(reportErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error View</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error View')).toBeInTheDocument()
  })

  it('resets error state when Try Again is clicked', () => {
    let throwError = true
    const DynamicChild = () => {
      if (throwError) throw new Error('Dynamic error')
      return <div>Recovered Content</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    throwError = false
    fireEvent.click(screen.getByText('Try Again'))

    rerender(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('Recovered Content')).toBeInTheDocument()
  })
})

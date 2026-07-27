import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary class component.
 * Catches uncaught render errors in child tree and presents a recovery UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          className="max-w-xl mx-auto my-12 p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl shadow-sm text-center"
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-6">
            An unexpected error occurred while rendering this page.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

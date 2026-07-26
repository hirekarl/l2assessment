import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

describe('App', () => {
  it('renders the navigation and the home page by default', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    expect(screen.getByText('Relay AI')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Relay AI Customer Triage')).toBeInTheDocument()
  })
})

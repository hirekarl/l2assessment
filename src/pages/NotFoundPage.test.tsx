import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('sets the title and noindex robots meta, then restores both on unmount', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'robots')
    meta.setAttribute('content', 'index, follow')
    document.head.appendChild(meta)
    const previousTitle = document.title

    const { unmount, getByText } = render(<NotFoundPage />)

    expect(getByText('Page not found')).toBeInTheDocument()
    expect(document.title).toBe('Page Not Found — Relay AI')
    expect(meta.getAttribute('content')).toBe('noindex, nofollow')

    unmount()

    expect(document.title).toBe(previousTitle)
    expect(meta.getAttribute('content')).toBe('index, follow')

    document.head.removeChild(meta)
  })

  it('renders and unmounts without throwing when no robots meta tag is present', () => {
    expect(document.querySelector('meta[name="robots"]')).toBeNull()

    const { unmount, getByText } = render(<NotFoundPage />)
    expect(getByText('Page not found')).toBeInTheDocument()

    expect(() => unmount()).not.toThrow()
  })
})

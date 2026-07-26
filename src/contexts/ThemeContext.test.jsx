import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider } from './ThemeContext.jsx'
import { useTheme } from './useTheme.js'

function wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('ThemeProvider / useTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.classList.remove('dark')
  })

  it('throws when useTheme is called outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    )
  })

  it('defaults to the OS preference when no theme is stored', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('uses the stored preference over the OS preference', () => {
    localStorage.setItem('theme', 'light')
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })

  it('toggleTheme flips the theme and persists it', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false })
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

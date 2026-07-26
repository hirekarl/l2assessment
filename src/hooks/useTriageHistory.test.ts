import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTriageHistory } from './useTriageHistory'

describe('useTriageHistory', () => {
  it('starts empty when localStorage has no history', () => {
    const { result } = renderHook(() => useTriageHistory())
    expect(result.current.history).toEqual([])
  })

  it('reads pre-existing history from localStorage on mount', () => {
    localStorage.setItem('triageHistory', JSON.stringify([{ message: 'hi' }]))
    const { result } = renderHook(() => useTriageHistory())
    expect(result.current.history).toEqual([{ message: 'hi' }])
  })

  it('appendEntry adds an entry to state and persists it', () => {
    const { result } = renderHook(() => useTriageHistory())

    act(() => {
      result.current.appendEntry({ message: 'first' })
    })

    expect(result.current.history).toEqual([{ message: 'first' }])
    expect(JSON.parse(localStorage.getItem('triageHistory') || '[]')).toEqual([
      { message: 'first' },
    ])
  })

  it('appendEntry accumulates multiple entries in order', () => {
    const { result } = renderHook(() => useTriageHistory())

    act(() => {
      result.current.appendEntry({ message: 'first' })
    })
    act(() => {
      result.current.appendEntry({ message: 'second' })
    })

    expect(result.current.history.map((h) => h.message)).toEqual(['first', 'second'])
  })

  it('clearHistory empties both state and localStorage', () => {
    const { result } = renderHook(() => useTriageHistory())

    act(() => {
      result.current.appendEntry({ message: 'first' })
    })
    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.history).toEqual([])
    expect(JSON.parse(localStorage.getItem('triageHistory') || '[]')).toEqual([])
  })
})

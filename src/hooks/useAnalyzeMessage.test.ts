import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalyzeMessage } from './useAnalyzeMessage'
import { categorizeMessage } from '../utils/llmHelper'

vi.mock('../utils/llmHelper', () => ({
  categorizeMessage: vi.fn(),
}))

describe('useAnalyzeMessage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts with no results and not loading', () => {
    const { result } = renderHook(() => useAnalyzeMessage())
    expect(result.current.results).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets isLoading during analysis and populates results on success', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'Technical Problem',
      urgency: 'High',
      reasoning: 'Outage reported.',
      source: 'llm',
    })

    const { result } = renderHook(() => useAnalyzeMessage())

    let analyzePromise: Promise<void> | undefined
    act(() => {
      analyzePromise = result.current.analyze('The site is down')
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      await analyzePromise
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.results).toMatchObject({
      message: 'The site is down',
      category: 'Technical Problem',
      urgency: 'High',
      escalate: true,
      source: 'llm',
    })
  })

  it('persists the analysis result to triage history', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'Feature Request',
      urgency: 'Low',
      reasoning: 'Nice-to-have.',
      source: 'llm',
    })

    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await result.current.analyze('Add dark mode please')
    })

    const history = JSON.parse(localStorage.getItem('triageHistory') || '[]')
    expect(history).toHaveLength(1)
    expect(history[0].category).toBe('Feature Request')
  })

  it('resets isLoading and rethrows if categorization fails unexpectedly', async () => {
    vi.mocked(categorizeMessage).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await expect(result.current.analyze('anything')).rejects.toThrow('boom')
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.results).toBeNull()
  })

  it('reset() clears the current results', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'General Inquiry',
      urgency: 'Low',
      reasoning: 'A question.',
      source: 'llm',
    })
    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await result.current.analyze('How does this work?')
    })
    expect(result.current.results).not.toBeNull()

    act(() => {
      result.current.reset()
    })
    expect(result.current.results).toBeNull()
  })
})

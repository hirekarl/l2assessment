import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalyzeMessage } from './useAnalyzeMessage'
import { categorizeMessage } from '../utils/llmHelper'
import { useTriageHistory } from './useTriageHistory'

vi.mock('../utils/llmHelper', () => ({
  categorizeMessage: vi.fn(),
}))

const logEventMock = vi.fn()
const reportErrorMock = vi.fn()
vi.mock('../utils/observability', () => ({
  logEvent: (...args: unknown[]) => logEventMock(...args),
  reportError: (...args: unknown[]) => reportErrorMock(...args),
}))

vi.mock('./useTriageHistory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./useTriageHistory')>()
  return { ...actual, useTriageHistory: vi.fn(actual.useTriageHistory) }
})

describe('useAnalyzeMessage', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTriageHistory).mockRestore()
  })

  it('starts with no results, not loading, and persistFailed false', () => {
    const { result } = renderHook(() => useAnalyzeMessage())
    expect(result.current.results).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.persistFailed).toBe(false)
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
    expect(result.current.persistFailed).toBe(false)
  })

  it('resets isLoading and rethrows if categorization fails unexpectedly', async () => {
    vi.mocked(categorizeMessage).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await expect(result.current.analyze('anything')).rejects.toThrow('boom')
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.results).toBeNull()
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'analyze_message_failed',
      expect.objectContaining({ message: 'boom' })
    )
    expect(reportErrorMock).toHaveBeenCalledWith(expect.any(Error), { stage: 'analyze' })
  })

  it('stringifies a non-Error rejection in the logged analyze failure', async () => {
    vi.mocked(categorizeMessage).mockRejectedValue('offline')
    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await expect(result.current.analyze('anything')).rejects.toBe('offline')
    })

    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'analyze_message_failed',
      expect.objectContaining({ message: 'offline' })
    )
  })

  it('still renders results and sets persistFailed when saving to history fails', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'General Inquiry',
      urgency: 'Low',
      reasoning: 'A question.',
      source: 'llm',
    })
    vi.mocked(useTriageHistory).mockReturnValue({
      history: [],
      appendEntry: () => {
        throw new Error('quota exceeded')
      },
      clearHistory: () => {},
    })

    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await result.current.analyze('How does this work?')
    })

    expect(result.current.results).not.toBeNull()
    expect(result.current.persistFailed).toBe(true)
    expect(logEventMock).toHaveBeenCalledWith(
      'warn',
      'triage_history_persist_failed',
      expect.objectContaining({ message: 'quota exceeded' })
    )
    expect(reportErrorMock).toHaveBeenCalledWith(expect.any(Error), { stage: 'appendEntry' })
  })

  it('stringifies a non-Error value thrown while persisting to history', async () => {
    vi.mocked(categorizeMessage).mockResolvedValue({
      category: 'General Inquiry',
      urgency: 'Low',
      reasoning: 'A question.',
      source: 'llm',
    })
    vi.mocked(useTriageHistory).mockReturnValue({
      history: [],
      appendEntry: () => {
        throw 'storage disabled'
      },
      clearHistory: () => {},
    })

    const { result } = renderHook(() => useAnalyzeMessage())

    await act(async () => {
      await result.current.analyze('How does this work?')
    })

    expect(logEventMock).toHaveBeenCalledWith(
      'warn',
      'triage_history_persist_failed',
      expect.objectContaining({ message: 'storage disabled' })
    )
  })

  it('reset() clears the current results and persistFailed', async () => {
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
    expect(result.current.persistFailed).toBe(false)
  })
})

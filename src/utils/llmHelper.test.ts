import { describe, it, expect, vi, afterEach } from 'vitest'
import { categorizeMessage } from './llmHelper'

const logEventMock = vi.fn()
const reportErrorMock = vi.fn()
vi.mock('./observability', () => ({
  logEvent: (...args: unknown[]) => logEventMock(...args),
  reportError: (...args: unknown[]) => reportErrorMock(...args),
}))

describe('categorizeMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    logEventMock.mockClear()
    reportErrorMock.mockClear()
  })

  it('returns the API response with source "llm" when the backend succeeds', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        category: 'Billing Issue',
        urgency: 'High',
        reasoning: 'Customer reports a duplicate charge.',
        source: 'llm',
      }),
    } as unknown as Response)

    const result = await categorizeMessage('I was charged twice')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/categorize',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'I was charged twice' }),
      })
    )
    expect(result).toEqual({
      category: 'Billing Issue',
      urgency: 'High',
      reasoning: 'Customer reports a duplicate charge.',
      source: 'llm',
    })
  })

  it('reads the mock body as-is on a 502 provider-failure response instead of discarding it', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({
        category: 'Technical Problem',
        urgency: 'High',
        reasoning: 'Keyword match.',
        source: 'mock',
        mockReason: 'Rate limit exceeded',
      }),
    } as unknown as Response)

    const result = await categorizeMessage('The app keeps crashing')

    expect(result.source).toBe('mock')
    expect(result.mockReason).toBe('Rate limit exceeded')
    expect(result.category).toBe('Technical Problem')
    expect(logEventMock).not.toHaveBeenCalled()
  })

  it('falls back to local mock categorization with a "Backend unavailable" reason on a non-2xx, non-502 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as unknown as Response)

    const result = await categorizeMessage('The app keeps crashing')

    expect(result.source).toBe('mock')
    expect(result.mockReason).toBe('Backend unavailable')
    expect(result.category).toBe('Technical Problem')
    expect(logEventMock).toHaveBeenCalledWith(
      'warn',
      'categorize_fetch_failed',
      expect.objectContaining({ mockReason: 'Backend unavailable' })
    )
    expect(reportErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ mockReason: 'Backend unavailable' })
    )
  })

  it('falls back with a "Network error" reason when fetch itself throws a TypeError', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await categorizeMessage('Can you add an export feature?')

    expect(result.source).toBe('mock')
    expect(result.mockReason).toBe('Network error')
    expect(result.category).toBe('Feature Request')
    expect(logEventMock).toHaveBeenCalledWith(
      'warn',
      'categorize_fetch_failed',
      expect.objectContaining({ mockReason: 'Network error' })
    )
  })

  it('stringifies a non-Error rejection in the logged message', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue('offline')

    const result = await categorizeMessage('a question')

    expect(result.source).toBe('mock')
    expect(logEventMock).toHaveBeenCalledWith(
      'warn',
      'categorize_fetch_failed',
      expect.objectContaining({ message: 'offline' })
    )
  })

  it('falls back gracefully when the response body is not valid JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    } as unknown as Response)

    const result = await categorizeMessage('How do I reset my password?')

    expect(result.source).toBe('mock')
    expect(result.category).toBe('General Inquiry')
  })
})

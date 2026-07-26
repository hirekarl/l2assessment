import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { categorizeMessage } from './llmHelper.js'

describe('categorizeMessage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the API response with source "llm" when the backend succeeds', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        category: 'Billing Issue',
        urgency: 'High',
        reasoning: 'Customer reports a duplicate charge.',
        source: 'llm',
      }),
    })

    const result = await categorizeMessage('I was charged twice')

    expect(global.fetch).toHaveBeenCalledWith(
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

  it('falls back to local mock categorization with a "Backend unavailable" reason on a non-2xx response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    const result = await categorizeMessage('The app keeps crashing')

    expect(result.source).toBe('mock')
    expect(result.mockReason).toBe('Backend unavailable')
    expect(result.category).toBe('Technical Problem')
  })

  it('falls back with a "Network error" reason when fetch itself throws a TypeError', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await categorizeMessage('Can you add an export feature?')

    expect(result.source).toBe('mock')
    expect(result.mockReason).toBe('Network error')
    expect(result.category).toBe('Feature Request')
  })

  it('falls back gracefully when the response body is not valid JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    })

    const result = await categorizeMessage('How do I reset my password?')

    expect(result.source).toBe('mock')
    expect(result.category).toBe('General Inquiry')
  })
})

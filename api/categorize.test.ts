import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

class FakeAuthenticationError extends Error {}
class FakeRateLimitError extends Error {}
class FakeAPIConnectionError extends Error {}
class FakeAPIError extends Error {}

const createMock = vi.fn()

function FakeGroq() {
  return { chat: { completions: { create: createMock } } }
}
FakeGroq.AuthenticationError = FakeAuthenticationError
FakeGroq.RateLimitError = FakeRateLimitError
FakeGroq.APIConnectionError = FakeAPIConnectionError
FakeGroq.APIError = FakeAPIError

vi.mock('groq-sdk', () => ({ default: FakeGroq }))

interface MockResponse {
  statusCode: number | null
  body: Record<string, unknown> | null
  status: (code: number) => MockResponse
  json: (payload: unknown) => MockResponse
}

function mockRes(): MockResponse {
  return {
    statusCode: null,
    body: null,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload as Record<string, unknown>
      return this
    },
  }
}

describe('POST /api/categorize', () => {
  const originalKey = process.env.GROQ_API_KEY

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    process.env.GROQ_API_KEY = 'gsk_test_key'
    createMock.mockReset()
  })

  afterEach(() => {
    process.env.GROQ_API_KEY = originalKey
    vi.restoreAllMocks()
  })

  it('rejects non-POST methods', async () => {
    const { default: handler } = await import('./categorize')
    const res = mockRes()
    await handler({ method: 'GET' }, res)
    expect(res.statusCode).toBe(405)
  })

  it('rejects a missing message body', async () => {
    const { default: handler } = await import('./categorize')
    const res = mockRes()
    await handler({ method: 'POST', body: {} }, res)
    expect(res.statusCode).toBe(400)
  })

  it('rejects when req.body itself is undefined', async () => {
    const { default: handler } = await import('./categorize')
    const res = mockRes()
    await handler({ method: 'POST' }, res)
    expect(res.statusCode).toBe(400)
  })

  it('defaults reasoning to a placeholder when the model omits it', async () => {
    createMock.mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ category: 'General Inquiry', urgency: 'Low' }) } },
      ],
    })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.reasoning).toBe('No reasoning provided.')
  })

  it('reuses the memoized Groq client across multiple invocations', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: 'General Inquiry',
              urgency: 'Low',
              reasoning: 'x',
            }),
          },
        },
      ],
    })
    const { default: handler } = await import('./categorize')
    const res1 = mockRes()
    const res2 = mockRes()

    await handler({ method: 'POST', body: { message: 'first' } }, res1)
    await handler({ method: 'POST', body: { message: 'second' } }, res2)

    expect(res1.statusCode).toBe(200)
    expect(res2.statusCode).toBe(200)
  })

  it('returns an llm-sourced result on success', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: 'Billing Issue',
              urgency: 'High',
              reasoning: 'Duplicate charge.',
            }),
          },
        },
      ],
    })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'I was charged twice' } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      category: 'Billing Issue',
      urgency: 'High',
      reasoning: 'Duplicate charge.',
      source: 'llm',
    })
  })

  it('normalizes an invalid category/urgency from the model', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: 'Not Real',
              urgency: 'Critical',
              reasoning: 'x',
            }),
          },
        },
      ],
    })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.category).toBe('General Inquiry')
    expect(res.body?.urgency).toBe('Medium')
  })

  it('falls back to mock categorization with "Missing API key" when GROQ_API_KEY is unset', async () => {
    delete process.env.GROQ_API_KEY
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'The app is broken' } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.body?.source).toBe('mock')
    expect(res.body?.mockReason).toBe('Missing API key')
    expect(res.body?.category).toBe('Technical Problem')
  })

  it('classifies an AuthenticationError as "Invalid API key"', async () => {
    createMock.mockRejectedValue(new FakeAuthenticationError('bad key'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.source).toBe('mock')
    expect(res.body?.mockReason).toBe('Invalid API key')
  })

  it('classifies a RateLimitError as "Rate limit exceeded"', async () => {
    createMock.mockRejectedValue(new FakeRateLimitError('slow down'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('Rate limit exceeded')
  })

  it('classifies an APIConnectionError as "Network error"', async () => {
    createMock.mockRejectedValue(new FakeAPIConnectionError('no route'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('Network error')
  })

  it('classifies a generic APIError as "AI service error"', async () => {
    createMock.mockRejectedValue(new FakeAPIError('server exploded'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('AI service error')
  })

  it('classifies malformed JSON from the model as "Invalid response format"', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('Invalid response format')
  })

  it('classifies any other error as "Unknown error"', async () => {
    createMock.mockRejectedValue(new Error('mystery failure'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('Unknown error')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

class FakeAuthenticationError extends Error {}
class FakeRateLimitError extends Error {}
class FakeAPIConnectionError extends Error {}
class FakeAPIError extends Error {}

const createMock = vi.fn()
const groqConstructorMock = vi.fn()

function FakeGroq(config: unknown) {
  groqConstructorMock(config)
  return { chat: { completions: { create: createMock } } }
}
FakeGroq.AuthenticationError = FakeAuthenticationError
FakeGroq.RateLimitError = FakeRateLimitError
FakeGroq.APIConnectionError = FakeAPIConnectionError
FakeGroq.APIError = FakeAPIError

vi.mock('groq-sdk', () => ({ default: FakeGroq }))

const logEventMock = vi.fn()
const reportErrorMock = vi.fn()
vi.mock('./_lib/observability', () => ({
  logEvent: (...args: unknown[]) => logEventMock(...args),
  reportError: (...args: unknown[]) => reportErrorMock(...args),
}))

interface MockResponse {
  statusCode: number | null
  body: Record<string, unknown> | null
  headers: Record<string, string>
  status: (code: number) => MockResponse
  json: (payload: unknown) => MockResponse
  setHeader: (name: string, value: string) => MockResponse
}

function mockRes(): MockResponse {
  return {
    statusCode: null,
    body: null,
    headers: {},
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload as Record<string, unknown>
      return this
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value
      return this
    },
  }
}

/** A response mock whose first .json() call throws, simulating the mock-fallback construction itself failing. */
function mockResThatThrowsOnceOnJson(
  thrownValue: unknown = new Error('fallback construction exploded')
): MockResponse {
  const res = mockRes()
  let jsonCalls = 0
  const originalJson = res.json.bind(res)
  res.json = (payload: unknown) => {
    jsonCalls++
    if (jsonCalls === 1) throw thrownValue
    return originalJson(payload)
  }
  return res
}

describe('POST /api/categorize', () => {
  const originalKey = process.env.GROQ_API_KEY

  beforeEach(() => {
    vi.resetModules()
    process.env.GROQ_API_KEY = 'gsk_test_key'
    createMock.mockReset()
    groqConstructorMock.mockReset()
    logEventMock.mockReset()
    reportErrorMock.mockReset()
  })

  afterEach(() => {
    process.env.GROQ_API_KEY = originalKey
    vi.restoreAllMocks()
  })

  it('rejects non-POST methods and sets security headers', async () => {
    const { default: handler } = await import('./categorize')
    const res = mockRes()
    await handler({ method: 'GET' }, res)
    expect(res.statusCode).toBe(405)
    expect(res.headers['X-Content-Type-Options']).toBe('nosniff')
    expect(res.headers['X-Frame-Options']).toBe('DENY')
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

  it('defaults to General Inquiry/Medium when Groq content is an empty string', async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: '' } }],
    })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      source: 'llm',
      category: 'General Inquiry',
      urgency: 'Medium',
      reasoning: 'No reasoning provided.',
    })
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
    expect(groqConstructorMock).toHaveBeenCalledTimes(1)
  })

  it('constructs the Groq client with an explicit timeout and retry budget', async () => {
    createMock.mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ category: 'General Inquiry', urgency: 'Low' }) } },
      ],
    })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(groqConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 3000, maxRetries: 1 })
    )
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

    expect(res.statusCode).toBe(502)
    expect(res.body?.source).toBe('mock')
    expect(res.body?.mockReason).toBe('Missing API key')
    expect(res.body?.category).toBe('Technical Problem')
    expect(createMock).not.toHaveBeenCalled()
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'groq_fallback',
      expect.objectContaining({ mockReason: 'Missing API key' })
    )
    expect(reportErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ route: 'categorize', mockReason: 'Missing API key' })
    )
  })

  it('classifies an AuthenticationError as "Invalid API key" without retrying', async () => {
    createMock.mockRejectedValue(new FakeAuthenticationError('bad key'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.source).toBe('mock')
    expect(res.body?.mockReason).toBe('Invalid API key')
    expect(createMock).toHaveBeenCalledTimes(1)
    expect(logEventMock).toHaveBeenCalledWith('error', 'groq_fallback', expect.any(Object))
  })

  it('classifies a RateLimitError as "Rate limit exceeded" without retrying, at warn level', async () => {
    createMock.mockRejectedValue(new FakeRateLimitError('slow down'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.mockReason).toBe('Rate limit exceeded')
    expect(createMock).toHaveBeenCalledTimes(1)
    expect(logEventMock).toHaveBeenCalledWith('warn', 'groq_fallback', expect.any(Object))
  })

  it('classifies an APIConnectionError as "Network error" without retrying, at warn level', async () => {
    createMock.mockRejectedValue(new FakeAPIConnectionError('no route'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.mockReason).toBe('Network error')
    expect(createMock).toHaveBeenCalledTimes(1)
    expect(logEventMock).toHaveBeenCalledWith('warn', 'groq_fallback', expect.any(Object))
  })

  it('classifies a generic APIError as "AI service error" without retrying', async () => {
    createMock.mockRejectedValue(new FakeAPIError('server exploded'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.mockReason).toBe('AI service error')
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('retries once on malformed JSON and succeeds on the second attempt', async () => {
    createMock
      .mockResolvedValueOnce({ choices: [{ message: { content: 'not json' } }] })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: 'Technical Problem',
                urgency: 'High',
                reasoning: 'Recovered on retry.',
              }),
            },
          },
        ],
      })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'it broke' } }, res)

    expect(res.body?.source).toBe('llm')
    expect(res.body?.category).toBe('Technical Problem')
    expect(createMock).toHaveBeenCalledTimes(2)
    const retryMessages = createMock.mock.calls[1]![0].messages as Array<{ content: string }>
    expect(retryMessages.some((m) => m.content.includes('could not be parsed'))).toBe(true)
  })

  it('retries on a TypeError from a null JSON response and succeeds on the second attempt', async () => {
    createMock
      .mockResolvedValueOnce({ choices: [{ message: { content: 'null' } }] })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: 'General Inquiry',
                urgency: 'Low',
                reasoning: 'Recovered on retry.',
              }),
            },
          },
        ],
      })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.source).toBe('llm')
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('retries on a ZodError from a non-object JSON response and succeeds on the second attempt', async () => {
    createMock
      .mockResolvedValueOnce({ choices: [{ message: { content: '[]' } }] })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: 'General Inquiry',
                urgency: 'Low',
                reasoning: 'Recovered on retry.',
              }),
            },
          },
        ],
      })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.source).toBe('llm')
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('classifies malformed JSON from the model as "Invalid response format" after exhausting retries', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.mockReason).toBe('Invalid response format')
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('classifies a null JSON response as "Invalid response format" after exhausting retries', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'null' } }] })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('Invalid response format')
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('classifies a non-object JSON response as "Invalid response format" after exhausting retries', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: '[]' } }] })
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.body?.mockReason).toBe('Invalid response format')
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('classifies any other error as "Unknown error" without retrying, at error level', async () => {
    createMock.mockRejectedValue(new Error('mystery failure'))
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.mockReason).toBe('Unknown error')
    expect(createMock).toHaveBeenCalledTimes(1)
    expect(logEventMock).toHaveBeenCalledWith('error', 'groq_fallback', expect.any(Object))
  })

  it('stringifies a non-Error rejection in the logged message', async () => {
    createMock.mockRejectedValue('a plain string rejection')
    const { default: handler } = await import('./categorize')
    const res = mockRes()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(502)
    expect(res.body?.mockReason).toBe('Unknown error')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'groq_fallback',
      expect.objectContaining({ message: 'a plain string rejection' })
    )
  })

  it('stringifies a non-Error value thrown while serving the mock fallback', async () => {
    createMock.mockRejectedValue(new Error('mystery failure'))
    const { default: handler } = await import('./categorize')
    const res = mockResThatThrowsOnceOnJson('a plain string throw')

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(500)
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'fallback_failure',
      expect.objectContaining({ message: 'a plain string throw' })
    )
  })

  it('returns 500 when serving the mock fallback response itself throws', async () => {
    createMock.mockRejectedValue(new Error('mystery failure'))
    const { default: handler } = await import('./categorize')
    const res = mockResThatThrowsOnceOnJson()

    await handler({ method: 'POST', body: { message: 'hi' } }, res)

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Internal server error' })
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'fallback_failure',
      expect.objectContaining({ message: 'fallback construction exploded' })
    )
    expect(reportErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ route: 'categorize', stage: 'mock-fallback' })
    )
  })
})

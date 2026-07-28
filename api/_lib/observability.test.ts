import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const errorMock = vi.fn()
const RollbarMock = vi.fn().mockImplementation(function RollbarMockImpl() {
  return { error: errorMock }
})

vi.mock('rollbar', () => ({ default: RollbarMock }))

describe('api/_lib/observability', () => {
  const originalToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN

  beforeEach(() => {
    vi.resetModules()
    RollbarMock.mockClear()
    errorMock.mockClear()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.ROLLBAR_SERVER_ACCESS_TOKEN = originalToken
    vi.restoreAllMocks()
  })

  describe('logEvent', () => {
    it('emits a structured JSON line at the given level', async () => {
      const { logEvent } = await import('./observability')

      logEvent('warn', 'groq_fallback', { mockReason: 'Network error' })

      expect(console.warn).toHaveBeenCalledTimes(1)
      const [line] = vi.mocked(console.warn).mock.calls[0]!
      const parsed = JSON.parse(line as string)
      expect(parsed).toMatchObject({
        level: 'warn',
        event: 'groq_fallback',
        mockReason: 'Network error',
      })
      expect(typeof parsed.timestamp).toBe('string')
    })

    it('defaults fields to an empty object', async () => {
      const { logEvent } = await import('./observability')

      logEvent('info', 'startup')

      const [line] = vi.mocked(console.info).mock.calls[0]!
      expect(JSON.parse(line as string)).toMatchObject({ level: 'info', event: 'startup' })
    })
  })

  describe('reportError', () => {
    it('no-ops when ROLLBAR_SERVER_ACCESS_TOKEN is unset', async () => {
      delete process.env.ROLLBAR_SERVER_ACCESS_TOKEN
      const { reportError } = await import('./observability')

      reportError(new Error('boom'), { route: 'categorize' })

      expect(RollbarMock).not.toHaveBeenCalled()
    })

    it('constructs and reports via Rollbar when the token is set', async () => {
      process.env.ROLLBAR_SERVER_ACCESS_TOKEN = 'test-token'
      const { reportError } = await import('./observability')

      const error = new Error('boom')
      reportError(error, { route: 'categorize' })

      expect(RollbarMock).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'test-token' })
      )
      expect(errorMock).toHaveBeenCalledWith(error, { route: 'categorize' })
    })

    it('memoizes the Rollbar client across multiple calls', async () => {
      process.env.ROLLBAR_SERVER_ACCESS_TOKEN = 'test-token'
      const { reportError } = await import('./observability')

      reportError(new Error('first'), {})
      reportError(new Error('second'), {})

      expect(RollbarMock).toHaveBeenCalledTimes(1)
      expect(errorMock).toHaveBeenCalledTimes(2)
    })

    it('wraps a non-Error value in an Error before reporting', async () => {
      process.env.ROLLBAR_SERVER_ACCESS_TOKEN = 'test-token'
      const { reportError } = await import('./observability')

      reportError('a string failure', {})

      expect(errorMock).toHaveBeenCalledWith(expect.any(Error), {})
      expect(errorMock.mock.calls[0]![0].message).toBe('a string failure')
    })
  })
})

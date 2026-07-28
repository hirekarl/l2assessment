import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const errorMock = vi.fn()
const RollbarMock = vi.fn().mockImplementation(function RollbarMockImpl() {
  return { error: errorMock }
})

vi.mock('rollbar', () => ({ default: RollbarMock }))

describe('src/utils/observability', () => {
  beforeEach(() => {
    vi.resetModules()
    RollbarMock.mockClear()
    errorMock.mockClear()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('logEvent', () => {
    it('emits a structured JSON line at the given level', async () => {
      const { logEvent } = await import('./observability')

      logEvent('error', 'categorize_fetch_failed', { mockReason: 'Backend unavailable' })

      expect(console.error).toHaveBeenCalledTimes(1)
      const [line] = vi.mocked(console.error).mock.calls[0]!
      const parsed = JSON.parse(line as string)
      expect(parsed).toMatchObject({
        level: 'error',
        event: 'categorize_fetch_failed',
        mockReason: 'Backend unavailable',
      })
      expect(typeof parsed.timestamp).toBe('string')
    })

    it('defaults fields to an empty object', async () => {
      const { logEvent } = await import('./observability')

      logEvent('info', 'mounted')

      const [line] = vi.mocked(console.info).mock.calls[0]!
      expect(JSON.parse(line as string)).toMatchObject({ level: 'info', event: 'mounted' })
    })
  })

  describe('reportError', () => {
    it('no-ops when VITE_ROLLBAR_CLIENT_TOKEN is unset', async () => {
      vi.stubEnv('VITE_ROLLBAR_CLIENT_TOKEN', '')
      const { reportError } = await import('./observability')

      reportError(new Error('boom'), { stage: 'appendEntry' })

      expect(RollbarMock).not.toHaveBeenCalled()
    })

    it('constructs and reports via Rollbar when the token is set', async () => {
      vi.stubEnv('VITE_ROLLBAR_CLIENT_TOKEN', 'client-token')
      const { reportError } = await import('./observability')

      const error = new Error('boom')
      reportError(error, { stage: 'appendEntry' })

      expect(RollbarMock).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'client-token' })
      )
      expect(errorMock).toHaveBeenCalledWith(error, { stage: 'appendEntry' })
    })

    it('memoizes the Rollbar client across multiple calls', async () => {
      vi.stubEnv('VITE_ROLLBAR_CLIENT_TOKEN', 'client-token')
      const { reportError } = await import('./observability')

      reportError(new Error('first'), {})
      reportError(new Error('second'), {})

      expect(RollbarMock).toHaveBeenCalledTimes(1)
      expect(errorMock).toHaveBeenCalledTimes(2)
    })

    it('wraps a non-Error value in an Error before reporting', async () => {
      vi.stubEnv('VITE_ROLLBAR_CLIENT_TOKEN', 'client-token')
      const { reportError } = await import('./observability')

      reportError('a string failure', {})

      expect(errorMock).toHaveBeenCalledWith(expect.any(Error), {})
      expect(errorMock.mock.calls[0]![0].message).toBe('a string failure')
    })
  })
})

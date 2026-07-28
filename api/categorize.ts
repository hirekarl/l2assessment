import Groq from 'groq-sdk'
import { ZodError } from 'zod'
import {
  SYSTEM_PROMPT,
  CategorizationResultSchema,
  getMockCategorization,
} from '../shared/categorization'
import { logEvent, reportError } from './_lib/observability'
import type { CategorizationResult, MockReason } from '../src/types/triage'

const MAX_ATTEMPTS = 2

/** Request timeout for a single Groq call, tuned to stay well under the Hobby plan's 10s function cap. */
const GROQ_TIMEOUT_MS = 3000

/** SDK-level retries for a single Groq call (transient network/429/5xx errors). */
const GROQ_MAX_RETRIES = 1

/** Mock reasons severe enough to warrant error-level reporting rather than a tracked warning. */
const ERROR_LEVEL_REASONS = new Set<MockReason>([
  'Missing API key',
  'Invalid API key',
  'Unknown error',
])

/** Instruction appended on a retry after the previous Groq response failed to parse/validate. */
const RETRY_NOTE =
  'Your previous response could not be parsed as valid JSON. Respond with valid JSON only, matching the required structure exactly.'

/** Thrown when GROQ_API_KEY is not configured in the server environment. */
class MissingApiKeyError extends Error {}

let groqClient: Groq | null = null

/** Lazily constructs (and memoizes) the server-side Groq client. */
function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new MissingApiKeyError('GROQ_API_KEY is not set')
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey, timeout: GROQ_TIMEOUT_MS, maxRetries: GROQ_MAX_RETRIES })
  }
  return groqClient
}

/**
 * Maps a caught error to a short, user-safe reason string.
 * @param error - The caught exception.
 * @returns User-safe mock reason string.
 */
function classifyMockReason(error: unknown): MockReason {
  if (error instanceof MissingApiKeyError) return 'Missing API key'
  if (error instanceof Groq.AuthenticationError) return 'Invalid API key'
  if (error instanceof Groq.RateLimitError) return 'Rate limit exceeded'
  if (error instanceof Groq.APIConnectionError) return 'Network error'
  if (error instanceof Groq.APIError) return 'AI service error'
  if (isRetryableParseError(error)) return 'Invalid response format'
  return 'Unknown error'
}

/**
 * True when the error indicates Groq responded but the content didn't parse or
 * validate as a CategorizationResult — as opposed to the Groq API call itself
 * failing (auth, rate limit, network, missing key), which should not be retried.
 */
function isRetryableParseError(error: unknown): boolean {
  return error instanceof SyntaxError || error instanceof TypeError || error instanceof ZodError
}

interface RequestLike {
  method?: string
  body?: {
    message?: unknown
  }
}

interface ResponseLike {
  status: (code: number) => ResponseLike
  json: (payload: unknown) => ResponseLike
  setHeader?: (name: string, value: string) => ResponseLike
}

/**
 * Sets standard security headers on serverless API responses.
 */
function applySecurityHeaders(res: ResponseLike): void {
  res.setHeader?.('X-Content-Type-Options', 'nosniff')
  res.setHeader?.('X-Frame-Options', 'DENY')
  res.setHeader?.('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader?.('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

/**
 * Calls Groq once and parses/validates the response into a CategorizationResult.
 * Throws SyntaxError/TypeError/ZodError on unparseable or malformed content, or the
 * underlying Groq SDK error on an API-level failure.
 * @param client - The Groq client.
 * @param message - The customer message to classify.
 * @param isRetry - When true, appends a corrective note asking for valid JSON.
 */
async function requestCategorization(
  client: Groq,
  message: string,
  isRetry: boolean
): Promise<CategorizationResult> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `<customer_message>\n${message}\n</customer_message>` },
  ]
  if (isRetry) {
    messages.push({ role: 'system', content: RETRY_NOTE })
  }

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  const rawContent = response.choices[0]!.message.content || '{}'
  const parsedRaw = JSON.parse(rawContent)
  if (typeof parsedRaw.reasoning !== 'string' || !parsedRaw.reasoning.trim()) {
    parsedRaw.reasoning = 'No reasoning provided.'
  }
  return CategorizationResultSchema.parse(parsedRaw)
}

/**
 * Vercel serverless function: POST { message } -> triage classification.
 * Holds the Groq API key server-side so it is never exposed to the browser.
 * @param req - Node's IncomingMessage; parsed body at req.body.
 * @param res - Node's ServerResponse (Vercel adds .status()/.json() helpers).
 */
export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  applySecurityHeaders(res)

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { message } = req.body ?? {}
  if (typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  try {
    const client = getGroqClient()
    let parsedData: CategorizationResult | undefined
    let lastError: unknown
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        parsedData = await requestCategorization(client, message, attempt > 0)
        break
      } catch (error) {
        if (!isRetryableParseError(error)) throw error
        lastError = error
      }
    }
    if (!parsedData) throw lastError

    res.status(200).json({
      ...parsedData,
      source: 'llm',
    })
  } catch (error) {
    const mockReason = classifyMockReason(error)
    const level = ERROR_LEVEL_REASONS.has(mockReason) ? 'error' : 'warn'
    logEvent(level, 'groq_fallback', {
      mockReason,
      message: error instanceof Error ? error.message : String(error),
    })
    reportError(error, { route: 'categorize', mockReason })
    try {
      res.status(502).json({ ...getMockCategorization(message), source: 'mock', mockReason })
    } catch (fallbackError) {
      logEvent('error', 'fallback_failure', {
        message: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      })
      reportError(fallbackError, { route: 'categorize', stage: 'mock-fallback' })
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

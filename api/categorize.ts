import Groq from 'groq-sdk'
import {
  SYSTEM_PROMPT,
  CategorizationResultSchema,
  getMockCategorization,
} from '../shared/categorization'
import type { MockReason } from '../src/types/triage'

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
    groqClient = new Groq({ apiKey })
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
  if (error instanceof SyntaxError) return 'Invalid response format'
  return 'Unknown error'
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
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const rawContent = response.choices[0]!.message.content || '{}'
    const parsedRaw = JSON.parse(rawContent)
    if (typeof parsedRaw.reasoning !== 'string' || !parsedRaw.reasoning.trim()) {
      parsedRaw.reasoning = 'No reasoning provided.'
    }
    const parsedData = CategorizationResultSchema.parse(parsedRaw)

    res.status(200).json({
      ...parsedData,
      source: 'llm',
    })
  } catch (error) {
    const mockReason = classifyMockReason(error)
    console.warn(`Groq API failed (${mockReason}), using mock response:`, error)
    res.status(200).json({ ...getMockCategorization(message), source: 'mock', mockReason })
  }
}

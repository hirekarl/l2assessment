import { getMockCategorization } from '../../shared/categorization'
import { logEvent, reportError } from './observability'
import type { TriageResult } from '../types/triage'

/**
 * Categorizes a customer message via the /api/categorize serverless function,
 * which holds the Groq API key server-side. The backend returns 502 (with a
 * valid mock body + specific mockReason) when the AI provider itself fails,
 * so that response is read as-is rather than discarded. Falls back to local
 * keyword-based mock categorization only when the backend is unreachable or
 * returns something unexpected.
 * @param message - The raw customer message text.
 * @returns Categorization result with source transparency metadata.
 */
export async function categorizeMessage(message: string): Promise<TriageResult> {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    if (response.ok || response.status === 502) {
      return (await response.json()) as TriageResult
    }

    throw new Error(`Backend returned ${response.status}`)
  } catch (error) {
    const mockReason = error instanceof TypeError ? 'Network error' : 'Backend unavailable'
    logEvent('warn', 'categorize_fetch_failed', {
      mockReason,
      message: error instanceof Error ? error.message : String(error),
    })
    reportError(error, { mockReason })
    return { ...getMockCategorization(message), source: 'mock', mockReason }
  }
}

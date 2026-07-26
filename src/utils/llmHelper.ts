import { getMockCategorization } from '../../shared/categorization'
import type { TriageResult } from '../types/triage'

/**
 * Categorizes a customer message via the /api/categorize serverless function,
 * which holds the Groq API key server-side. Falls back to local keyword-based
 * mock categorization if the backend itself is unreachable.
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

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    return (await response.json()) as TriageResult
  } catch (error) {
    const mockReason = error instanceof TypeError ? 'Network error' : 'Backend unavailable'
    console.warn(`Categorize API unreachable (${mockReason}), using local mock:`, error)
    return { ...getMockCategorization(message), source: 'mock', mockReason }
  }
}

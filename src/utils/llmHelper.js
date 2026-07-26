import { getMockCategorization } from '../../shared/categorization.js';

/**
 * Categorizes a customer message via the /api/categorize serverless function,
 * which holds the Groq API key server-side. Falls back to local keyword-based
 * mock categorization if the backend itself is unreachable.
 * @param {string} message - The raw customer message text.
 * @returns {Promise<{category: string, urgency: string, reasoning: string, source: 'llm'|'mock', mockReason?: string}>}
 */
export async function categorizeMessage(message) {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const mockReason = error instanceof TypeError ? 'Network error' : 'Backend unavailable';
    console.warn(`Categorize API unreachable (${mockReason}), using local mock:`, error);
    return { ...getMockCategorization(message), source: 'mock', mockReason };
  }
}

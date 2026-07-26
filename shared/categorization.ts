import type { Category, CategorizationResult, Urgency } from '../src/types/triage'

/**
 * Categorization logic shared between the server-side Groq client (api/categorize.ts)
 * and the client-side last-resort fallback (src/utils/llmHelper.ts).
 */

/** System prompt sent to the Groq chat completion for message triage. */
export const SYSTEM_PROMPT = `You are a customer support triage assistant for Relay AI, a SaaS customer operations platform.

Analyze the incoming customer support message and classify it. Respond with valid JSON only — no markdown, no extra text.

Use exactly one of these categories:
- "Billing Issue": payments, charges, invoices, subscriptions, refunds, cancellations
- "Technical Problem": bugs, errors, outages, crashes, slow performance, broken features
- "Feature Request": suggestions for new functionality or product improvements
- "General Inquiry": how-to questions, account info, general feedback, compliments

Urgency rules:
- "High": customer is blocked, losing money, or expressing strong frustration. Signals: service is down, data loss, words like "urgent", "ASAP", "immediately", "outage", repeated exclamation marks, writing in ALL CAPS out of anger
- "Low": casual question, positive feedback, or a future improvement suggestion with no immediate impact
- "Medium": everything else — a genuine issue but not an emergency

Respond with this JSON structure:
{
  "category": "<one of the four categories above>",
  "urgency": "<High|Medium|Low>",
  "reasoning": "<1-2 sentences explaining your classification>"
}`

/** The only valid category values a classification result may have. */
export const VALID_CATEGORIES: Category[] = [
  'Billing Issue',
  'Technical Problem',
  'Feature Request',
  'General Inquiry',
]

/** The only valid urgency values a classification result may have. */
export const VALID_URGENCIES: Urgency[] = ['High', 'Medium', 'Low']

/**
 * Keyword-based categorization used whenever the real LLM is unavailable
 * (missing/invalid API key, rate limit, network failure, or backend outage).
 * @param message - The raw customer message text.
 * @returns Categorization result { category, urgency, reasoning }
 */
export function getMockCategorization(message: string): CategorizationResult {
  const lower = message.toLowerCase()

  const hasAny = (...terms: string[]): boolean => terms.some((t) => lower.includes(t))

  if (
    hasAny(
      'bill',
      'payment',
      'charge',
      'invoice',
      'credit card',
      'subscription',
      'refund',
      'cancel'
    )
  ) {
    return {
      category: 'Billing Issue',
      urgency: hasAny('urgent', 'asap', 'immediately', 'fraud') ? 'High' : 'Medium',
      reasoning:
        'Message contains billing-related keywords such as payments, charges, or account cancellation.',
    }
  }

  if (
    hasAny(
      'bug',
      'error',
      'broken',
      'not working',
      'crash',
      'down',
      'outage',
      'slow',
      'issue',
      'problem'
    )
  ) {
    const isHigh =
      hasAny('down', 'outage', 'urgent', 'asap', 'immediately') || message.includes('!!')
    return {
      category: 'Technical Problem',
      urgency: isHigh ? 'High' : 'Medium',
      reasoning:
        "Message describes a technical malfunction or error that is impacting the customer's use of the product.",
    }
  }

  if (
    hasAny(
      'feature',
      'improve',
      'suggestion',
      'wish',
      'enhancement',
      'would be great',
      'would love'
    )
  ) {
    return {
      category: 'Feature Request',
      urgency: 'Low',
      reasoning:
        'Customer is requesting a new feature or product improvement rather than reporting an issue.',
    }
  }

  return {
    category: 'General Inquiry',
    urgency: 'Low',
    reasoning:
      'Message appears to be a general question or inquiry that does not indicate a critical issue.',
  }
}

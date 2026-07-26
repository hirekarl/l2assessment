/**
 * Domain types for Customer Inbox Triage application.
 */

/** Valid support message categories. */
export type Category = 'Billing Issue' | 'Technical Problem' | 'Feature Request' | 'General Inquiry'

/** Valid urgency levels. */
export type Urgency = 'High' | 'Medium' | 'Low'

/** Source of the categorization result. */
export type SourceType = 'llm' | 'mock'

/** Reason why local keyword fallback was used. */
export type MockReason =
  | 'Missing API key'
  | 'Invalid API key'
  | 'Rate limit exceeded'
  | 'Network error'
  | 'AI service error'
  | 'Invalid response format'
  | 'Unknown error'

/** Base output of the categorization process. */
export interface CategorizationResult {
  category: Category
  urgency: Urgency
  reasoning: string
}

/** Triage result including source transparency metadata. */
export interface TriageResult extends CategorizationResult {
  source: SourceType
  mockReason?: string
  recommendedAction?: string
  escalate?: boolean
}

/** Triage history item stored in localStorage. */
export interface TriageHistoryItem extends TriageResult {
  id?: string
  timestamp: string
  message: string
}

/** Category distribution count and percentage for analytics. */
export interface CategoryDistributionItem {
  category: Category
  count: number
  percentage: number
}

/** Urgency distribution count and percentage for analytics. */
export interface UrgencyDistributionItem {
  urgency: Urgency
  count: number
  percentage: number
}

/** Aggregate statistics calculated for the dashboard view. */
export interface DashboardStats {
  totalMessages: number
  highUrgencyCount: number
  llmSuccessRate: number
  topCategory: string
  categoryDistribution: CategoryDistributionItem[]
  urgencyDistribution: UrgencyDistributionItem[]
  highUrgencyMessages: TriageHistoryItem[]
  fallbackCount: number
}

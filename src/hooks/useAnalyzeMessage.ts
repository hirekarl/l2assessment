import { useState } from 'react'
import { categorizeMessage } from '../utils/llmHelper'
import { getRecommendedAction, shouldEscalate } from '../utils/templates'
import { useTriageHistory } from './useTriageHistory'
import type { Category, MockReason, SourceType, Urgency } from '../types/triage'

export interface AnalysisResult {
  message: string
  category: Category
  urgency: Urgency
  recommendedAction: string
  escalate: boolean
  reasoning: string
  source: SourceType
  mockReason?: MockReason | string
  timestamp: string
}

export interface UseAnalyzeMessageReturn {
  results: AnalysisResult | null
  isLoading: boolean
  analyze: (message: string) => Promise<void>
  reset: () => void
}

/**
 * Encapsulates the analyze-message flow: calling the categorization
 * provider, deriving the recommended action/escalation, and persisting
 * the result to history.
 * @returns Object { results, isLoading, analyze, reset }
 */
export function useAnalyzeMessage(): UseAnalyzeMessageReturn {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { appendEntry } = useTriageHistory()

  const analyze = async (message: string) => {
    setIsLoading(true)
    setResults(null)

    try {
      const { category, urgency, reasoning, source, mockReason } = await categorizeMessage(message)
      const recommendedAction = getRecommendedAction(category, urgency)
      const escalate = shouldEscalate(category, urgency)

      const analysisResult: AnalysisResult = {
        message,
        category,
        urgency,
        recommendedAction,
        escalate,
        reasoning,
        source,
        mockReason,
        timestamp: new Date().toISOString(),
      }

      setResults(analysisResult)
      appendEntry(analysisResult)
    } catch (error) {
      console.error('Error analyzing message:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => setResults(null)

  return { results, isLoading, analyze, reset }
}

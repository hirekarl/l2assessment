import { useState } from 'react'
import { categorizeMessage } from '../utils/llmHelper'
import { getRecommendedAction, shouldEscalate } from '../utils/templates'
import { useTriageHistory } from './useTriageHistory'

/**
 * Encapsulates the analyze-message flow: calling the categorization
 * provider, deriving the recommended action/escalation, and persisting
 * the result to history.
 * @returns {{results: object|null, isLoading: boolean, analyze: (message: string) => Promise<void>, reset: () => void}}
 */
export function useAnalyzeMessage() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { appendEntry } = useTriageHistory()

  const analyze = async (message) => {
    setIsLoading(true)
    setResults(null)

    try {
      const { category, urgency, reasoning, source, mockReason } = await categorizeMessage(message)
      const recommendedAction = getRecommendedAction(category, urgency)
      const escalate = shouldEscalate(category, urgency)

      const analysisResult = {
        message,
        category,
        urgency,
        recommendedAction,
        escalate,
        reasoning,
        source,
        mockReason,
        timestamp: new Date().toISOString()
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

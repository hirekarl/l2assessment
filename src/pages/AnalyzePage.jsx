import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { categorizeMessage } from '../utils/llmHelper'
import { getRecommendedAction, shouldEscalate } from '../utils/templates'

function AnalyzePage() {
  const [message, setMessage] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check for example message from home page
    const exampleMessage = localStorage.getItem('exampleMessage')
    if (exampleMessage) {
      setMessage(exampleMessage)
      localStorage.removeItem('exampleMessage')
    }
  }, [])

  const handleAnalyze = async () => {
    if (!message.trim()) {
      alert('Please enter a message to analyze')
      return
    }

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

      // Save to history
      const history = JSON.parse(localStorage.getItem('triageHistory') || '[]')
      history.push(analysisResult)
      localStorage.setItem('triageHistory', JSON.stringify(history))
    } catch (error) {
      console.error('Error analyzing message:', error)
      alert('Error analyzing message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessage('')
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analyze Customer Message</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Paste a customer support message below to automatically categorize and prioritize.
          </p>

          {/* Input Section */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Customer Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste customer message here..."
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {message.length} characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold ${
                isLoading
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Message'
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Analysis Results</h2>

            {results.source === 'mock' ? (
              <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">⚠ Fallback Mode</span>
                <span className="text-amber-700 dark:text-amber-400 text-sm">
                  AI unavailable ({results.mockReason}) — using basic keyword matching.
                </span>
              </div>
            ) : (
              <div className="mb-4 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-700 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="text-green-700 dark:text-green-400 font-bold text-sm">✓ AI-analyzed</span>
              </div>
            )}

            {results.escalate && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="text-red-700 dark:text-red-400 font-bold text-sm">⚠ ESCALATE</span>
                <span className="text-red-600 dark:text-red-400 text-sm">This message requires immediate attention from a senior agent.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Category</div>
                <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-semibold">
                  {results.category}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Urgency Level</div>
                <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  results.urgency === 'High' ? 'bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-300' :
                  results.urgency === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-300' :
                  'bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-300'
                }`}>
                  {results.urgency}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Recommended Action</div>
                <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="text-gray-800 dark:text-gray-200">{results.recommendedAction}</p>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">AI Reasoning</div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown>
                      {results.reasoning}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  const text = `Category: ${results.category}\nUrgency: ${results.urgency}\nRecommendation: ${results.recommendedAction}\n\nReasoning: ${results.reasoning}`
                  navigator.clipboard.writeText(text)
                  alert('Results copied to clipboard!')
                }}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold"
              >
                📋 Copy Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyzePage

import ReactMarkdown from 'react-markdown'

/**
 * The full analysis-results card: source banner, escalation banner,
 * category/urgency/action/reasoning, and a copy-to-clipboard action.
 * @param {Object} props
 * @param {Object} props.results
 */
function ResultsPanel({ results }) {
  const copyResults = () => {
    const text = `Category: ${results.category}\nUrgency: ${results.urgency}\nRecommendation: ${results.recommendedAction}\n\nReasoning: ${results.reasoning}`
    navigator.clipboard.writeText(text)
    alert('Results copied to clipboard!')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Analysis Results</h2>

      {results.source === 'mock' ? (
        <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
            ⚠ Fallback Mode
          </span>
          <span className="text-amber-700 dark:text-amber-400 text-sm">
            AI unavailable ({results.mockReason}) — using basic keyword matching.
          </span>
        </div>
      ) : (
        <div className="mb-4 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-700 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-green-700 dark:text-green-400 font-bold text-sm">
            ✓ AI-analyzed
          </span>
        </div>
      )}

      {results.escalate && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-red-700 dark:text-red-400 font-bold text-sm">⚠ ESCALATE</span>
          <span className="text-red-700 dark:text-red-400 text-sm">
            This message requires immediate attention from a senior agent.
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Category
          </div>
          <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-semibold">
            {results.category}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Urgency Level
          </div>
          <div
            className={`inline-block px-4 py-2 rounded-lg font-semibold ${
              results.urgency === 'High'
                ? 'bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-300'
                : results.urgency === 'Medium'
                  ? 'bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-300'
                  : 'bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-300'
            }`}
          >
            {results.urgency}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Recommended Action
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-gray-800 dark:text-gray-200">{results.recommendedAction}</p>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            AI Reasoning
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown>{results.reasoning}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={copyResults}
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold"
        >
          📋 Copy Results
        </button>
      </div>
    </div>
  )
}

export default ResultsPanel

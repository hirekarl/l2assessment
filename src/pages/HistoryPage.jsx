import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

function HistoryPage() {
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem('triageHistory') || '[]')
  )
  const [filter, setFilter] = useState('all')
  const [expandedIndex, setExpandedIndex] = useState(null)

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.setItem('triageHistory', '[]')
      setHistory([])
    }
  }

  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  const filteredHistory = filter === 'all'
    ? sortedHistory
    : sortedHistory.filter(item => item.category === filter)

  const categories = [...new Set(history.map(item => item.category))]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis History</h1>
              <p className="text-gray-600 dark:text-gray-300">View and manage past message analyses</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          {history.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All ({history.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    filter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category} ({history.filter(h => h.category === category).length})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* History List */}
        {filteredHistory.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-xl text-gray-600 dark:text-gray-300 mb-2">No history yet</div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Analyzed messages will appear here
            </p>
            <a
              href="/analyze"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Analyze a Message
            </a>
          </div>
        )}

        <div className="space-y-4">
          {filteredHistory.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                      "{item.message.substring(0, 100)}{item.message.length > 100 ? '...' : ''}"
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">
                        {item.category}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        item.urgency === 'High' ? 'bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-300' :
                        item.urgency === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-300' :
                        'bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-300'
                      }`}>
                        {item.urgency} Urgency
                      </span>
                      {item.escalate && (
                        <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
                          Escalate
                        </span>
                      )}
                      {item.source === 'mock' && (
                        <span
                          className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full font-semibold"
                          title={item.mockReason ? `Fallback: ${item.mockReason}` : 'Fallback mode'}
                        >
                          ⚠ Fallback
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 ml-4">
                    {expandedIndex === index ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {expandedIndex === index && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Full Message</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        {item.message}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Recommended Action</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 bg-purple-50 dark:bg-purple-950/40 p-3 rounded border border-purple-200 dark:border-purple-800">
                        {item.recommendedAction}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">AI Reasoning</div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                          <ReactMarkdown>
                            {item.reasoning}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage

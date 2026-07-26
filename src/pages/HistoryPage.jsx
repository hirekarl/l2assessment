import { useState } from 'react'
import { useTriageHistory } from '../hooks/useTriageHistory'
import HistoryFilters from '../components/history/HistoryFilters'
import HistoryItem from '../components/history/HistoryItem'

function HistoryPage() {
  const { history, clearHistory } = useTriageHistory()
  const [filter, setFilter] = useState('all')
  const [expandedIndex, setExpandedIndex] = useState(null)

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory()
    }
  }

  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const filteredHistory =
    filter === 'all' ? sortedHistory : sortedHistory.filter((item) => item.category === filter)

  const categories = [...new Set(history.map((item) => item.category))]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <HistoryFilters
          history={history}
          categories={categories}
          filter={filter}
          onFilterChange={setFilter}
          onClearAll={handleClearAll}
        />

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
            <HistoryItem
              key={index}
              item={item}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage

import type { TriageHistoryItem } from '../../types/triage'

export interface HistoryFiltersProps {
  history: TriageHistoryItem[] | { category: string }[]
  categories: string[]
  filter: string
  onFilterChange: (filter: string) => void
  onClearAll: () => void
}

/**
 * Category filter chips plus the Clear All action.
 */
function HistoryFilters({
  history,
  categories,
  filter,
  onFilterChange,
  onClearAll,
}: HistoryFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis History</h1>
          <p className="text-gray-600 dark:text-gray-300">View and manage past message analyses</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({history.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onFilterChange(category)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category} ({history.filter((h) => h.category === category).length})
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryFilters

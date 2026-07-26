import ReactMarkdown from 'react-markdown'
import type { TriageHistoryItem } from '../../types/triage'

export interface HistoryItemProps {
  item:
    | TriageHistoryItem
    | (Partial<TriageHistoryItem> & {
        message: string
        category: string
        urgency: string
        timestamp: string
      })
  isExpanded: boolean
  onToggle: () => void
}

/**
 * A single collapsible history entry.
 */
function HistoryItem({ item, isExpanded, onToggle }: HistoryItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <button
        type="button"
        aria-expanded={isExpanded}
        className="w-full text-left p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <div className="text-gray-800 dark:text-gray-200 font-medium mb-2">
              "{item.message.substring(0, 100)}
              {item.message.length > 100 ? '...' : ''}"
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">
                {item.category}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  item.urgency === 'High'
                    ? 'bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-300'
                    : item.urgency === 'Medium'
                      ? 'bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-300'
                      : 'bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-300'
                }`}
              >
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
          <div className="text-gray-400 dark:text-gray-500 ml-4">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Full Message
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                {item.message}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Recommended Action
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 bg-purple-50 dark:bg-purple-950/40 p-3 rounded border border-purple-200 dark:border-purple-800">
                {item.recommendedAction}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                AI Reasoning
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                  <ReactMarkdown>{item.reasoning}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryItem

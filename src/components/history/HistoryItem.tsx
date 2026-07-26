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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 overflow-hidden transition-all duration-150">
      <button
        type="button"
        aria-expanded={isExpanded}
        className="w-full text-left p-5 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-750 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <div className="text-gray-800 dark:text-gray-200 font-medium mb-2.5 leading-snug">
              "{item.message.substring(0, 100)}
              {item.message.length > 100 ? '...' : ''}"
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">
                {item.category}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  item.urgency === 'High'
                    ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300'
                    : item.urgency === 'Medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300'
                      : 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300'
                }`}
              >
                {item.urgency} Urgency
              </span>
              {item.escalate && (
                <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-semibold shadow-xs">
                  Escalate
                </span>
              )}
              {item.source === 'mock' && (
                <span
                  className="text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full font-semibold"
                  title={item.mockReason ? `Fallback: ${item.mockReason}` : 'Fallback mode'}
                >
                  ⚠ Fallback
                </span>
              )}
            </div>
          </div>
          <div className="text-gray-400 dark:text-gray-500 ml-4 font-bold text-xs">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700/80 p-5 bg-gray-50/60 dark:bg-gray-900/60 space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Full Message
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 leading-relaxed">
              {item.message}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Recommended Action
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-purple-50 dark:bg-purple-950/40 p-3.5 rounded-lg border border-purple-200 dark:border-purple-800 font-medium leading-relaxed">
              {item.recommendedAction}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              AI Reasoning
            </div>
            <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                <ReactMarkdown>{item.reasoning}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryItem

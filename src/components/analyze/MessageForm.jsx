/**
 * Message textarea plus the Analyze/Clear action buttons.
 * @param {{
 *   message: string,
 *   onMessageChange: (value: string) => void,
 *   onAnalyze: () => void,
 *   onClear: () => void,
 *   isLoading: boolean
 * }} props
 */
function MessageForm({ message, onMessageChange, onAnalyze, onClear, isLoading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analyze Customer Message</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Paste a customer support message below to automatically categorize and prioritize.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Customer Message
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Paste customer message here..."
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {message.length} characters
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onAnalyze}
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
          onClick={onClear}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default MessageForm

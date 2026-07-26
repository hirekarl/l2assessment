import type { UrgencyDataMap } from '../../hooks/useDashboardStats'

export interface UrgencyBreakdownProps {
  urgencyData: UrgencyDataMap
  total: number
}

/**
 * High/Medium/Low urgency counts.
 */
function UrgencyBreakdown({ urgencyData, total }: UrgencyBreakdownProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Urgency Breakdown</h2>
      {total === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">No data yet</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">High</span>
            </div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {urgencyData.High}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Medium</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {urgencyData.Medium}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Low</span>
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {urgencyData.Low}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UrgencyBreakdown

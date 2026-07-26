export interface StatsCardsSummary {
  total: number
  today: number
  highUrgencyPercent: number
  avgPerDay: number
}

export interface StatsCardsProps {
  stats: StatsCardsSummary
}

/**
 * The four top-line summary stat cards on the Dashboard.
 */
function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Messages</div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today</div>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.today}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Urgency</div>
        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
          {stats.highUrgencyPercent}%
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Per Day</div>
        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
          {stats.avgPerDay}
        </div>
      </div>
    </div>
  )
}

export default StatsCards

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-6 hover:-translate-y-0.5 transition-all duration-150">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
          Total Messages
        </div>
        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
          {stats.total}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-6 hover:-translate-y-0.5 transition-all duration-150">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Today</div>
        <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {stats.today}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-6 hover:-translate-y-0.5 transition-all duration-150">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
          High Urgency
        </div>
        <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
          {stats.highUrgencyPercent}%
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-6 hover:-translate-y-0.5 transition-all duration-150">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
          Avg Per Day
        </div>
        <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
          {stats.avgPerDay}
        </div>
      </div>
    </div>
  )
}

export default StatsCards

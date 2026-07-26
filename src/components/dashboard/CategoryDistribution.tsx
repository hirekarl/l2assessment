import type { CategoryDataPoint } from '../../hooks/useDashboardStats'

export interface CategoryDistributionProps {
  categoryData: CategoryDataPoint[]
  total: number
}

/**
 * Bar-per-category breakdown of triage volume.
 */
function CategoryDistribution({ categoryData, total }: CategoryDistributionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
        Category Distribution
      </h2>
      {categoryData.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 font-medium">
          No data yet
        </div>
      ) : (
        <div className="space-y-4">
          {categoryData.map((cat) => {
            const percentage = total > 0 ? (cat.count / total) * 100 : 0
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-gray-800 dark:text-gray-200">{cat.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {cat.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200/80 dark:bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CategoryDistribution

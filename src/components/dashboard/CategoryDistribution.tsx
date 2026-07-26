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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Category Distribution
      </h2>
      {categoryData.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">No data yet</div>
      ) : (
        <div className="space-y-3">
          {categoryData.map((cat) => {
            const percentage = total > 0 ? (cat.count / total) * 100 : 0
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {cat.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
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

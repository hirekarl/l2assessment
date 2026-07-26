import { useDashboardStats } from '../hooks/useDashboardStats'
import StatsCards from '../components/dashboard/StatsCards'
import CategoryDistribution from '../components/dashboard/CategoryDistribution'
import UrgencyBreakdown from '../components/dashboard/UrgencyBreakdown'
import InsightsPanel from '../components/dashboard/InsightsPanel'

/** Dashboard page: aggregate stats, category/urgency breakdowns, and derived insights. */
function DashboardPage() {
  const { stats, categoryData, urgencyData } = useDashboardStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Overview of message triage analytics</p>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-2 gap-6">
          <CategoryDistribution categoryData={categoryData} total={stats.total} />
          <UrgencyBreakdown urgencyData={urgencyData} total={stats.total} />
        </div>

        <InsightsPanel stats={stats} />
      </div>
    </div>
  )
}

export default DashboardPage

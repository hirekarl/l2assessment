function DashboardPage() {
  const history = JSON.parse(localStorage.getItem('triageHistory') || '[]')
  const today = new Date().toDateString()
  const todayMessages = history.filter(item =>
    new Date(item.timestamp).toDateString() === today
  )

  // Calculate stats
  const highUrgency = history.filter(h => h.urgency === 'High').length
  const totalDays = history.length > 0 ? 7 : 1
  const fallbackCount = history.filter(item => item.source === 'mock').length

  const stats = {
    total: history.length,
    today: todayMessages.length,
    highUrgencyPercent: history.length > 0 ? Math.round((highUrgency / history.length) * 100) : 0,
    avgPerDay: Math.round(history.length / totalDays),
    fallbackCount
  }

  // Category distribution
  const categories = {}
  history.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1
  })
  const categoryData = Object.entries(categories).map(([name, count]) => ({ name, count }))

  // Urgency breakdown
  const urgencyData = { High: 0, Medium: 0, Low: 0 }
  history.forEach(item => {
    urgencyData[item.urgency] = (urgencyData[item.urgency] || 0) + 1
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Overview of message triage analytics</p>
        </div>

        {/* Stats Cards */}
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
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.highUrgencyPercent}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Per Day</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgPerDay}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Category Distribution</h2>
            {categoryData.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">No data yet</div>
            ) : (
              <div className="space-y-3">
                {categoryData.map((cat) => {
                  const percentage = stats.total > 0 ? (cat.count / stats.total) * 100 : 0
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{cat.count} ({percentage.toFixed(0)}%)</span>
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

          {/* Urgency Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Urgency Breakdown</h2>
            {stats.total === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">No data yet</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">High</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{urgencyData.High}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">Medium</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{urgencyData.Medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">Low</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{urgencyData.Low}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">💡 Insights</h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            {stats.highUrgencyPercent > 30 && (
              <p>⚠️ High urgency messages represent {stats.highUrgencyPercent}% of total volume - consider additional support resources</p>
            )}
            {stats.today > 10 && (
              <p>📈 High activity today with {stats.today} messages analyzed</p>
            )}
            {stats.fallbackCount > 0 && (
              <p>⚠️ {stats.fallbackCount} of {stats.total} triage{stats.total === 1 ? '' : 's'} ran in fallback mode (AI unavailable) — results may be less accurate</p>
            )}
            {stats.total === 0 && (
              <p>👋 Start by analyzing some messages to see insights here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

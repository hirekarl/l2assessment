/**
 * Conditional callouts derived from the current stats snapshot.
 * @param {Object} props
 * @param {Object} props.stats - { total, today, highUrgencyPercent, fallbackCount }
 */
function InsightsPanel({ stats }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
      <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">💡 Insights</h2>
      <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
        {stats.highUrgencyPercent > 30 && (
          <p>
            ⚠️ High urgency messages represent {stats.highUrgencyPercent}% of total volume -
            consider additional support resources
          </p>
        )}
        {stats.today > 10 && <p>📈 High activity today with {stats.today} messages analyzed</p>}
        {stats.fallbackCount > 0 && (
          <p>
            ⚠️ {stats.fallbackCount} of {stats.total} triage{stats.total === 1 ? '' : 's'} ran in
            fallback mode (AI unavailable) — results may be less accurate
          </p>
        )}
        {stats.total === 0 && <p>👋 Start by analyzing some messages to see insights here</p>}
      </div>
    </div>
  )
}

export default InsightsPanel

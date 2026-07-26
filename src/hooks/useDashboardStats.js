import { useTriageHistory } from './useTriageHistory'

/**
 * Derives dashboard summary stats, category distribution, and urgency
 * breakdown from triage history.
 * @returns {Object} { stats, categoryData, urgencyData }
 */
export function useDashboardStats() {
  const { history } = useTriageHistory()

  const today = new Date().toDateString()
  const todayMessages = history.filter((item) => new Date(item.timestamp).toDateString() === today)

  const highUrgency = history.filter((h) => h.urgency === 'High').length
  const totalDays = history.length > 0 ? 7 : 1
  const fallbackCount = history.filter((item) => item.source === 'mock').length

  const stats = {
    total: history.length,
    today: todayMessages.length,
    highUrgencyPercent: history.length > 0 ? Math.round((highUrgency / history.length) * 100) : 0,
    avgPerDay: Math.round(history.length / totalDays),
    fallbackCount,
  }

  const categories = {}
  history.forEach((item) => {
    categories[item.category] = (categories[item.category] || 0) + 1
  })
  const categoryData = Object.entries(categories).map(([name, count]) => ({ name, count }))

  const urgencyData = { High: 0, Medium: 0, Low: 0 }
  history.forEach((item) => {
    urgencyData[item.urgency] = (urgencyData[item.urgency] || 0) + 1
  })

  return { stats, categoryData, urgencyData }
}

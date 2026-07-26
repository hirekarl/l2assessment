import { useTriageHistory } from './useTriageHistory'
import type { Urgency } from '../types/triage'

export interface DashboardStatsSummary {
  total: number
  today: number
  highUrgencyPercent: number
  avgPerDay: number
  fallbackCount: number
}

export interface CategoryDataPoint {
  name: string
  count: number
}

export type UrgencyDataMap = Record<Urgency, number>

export interface UseDashboardStatsReturn {
  stats: DashboardStatsSummary
  categoryData: CategoryDataPoint[]
  urgencyData: UrgencyDataMap
}

/**
 * Derives dashboard summary stats, category distribution, and urgency
 * breakdown from triage history.
 * @returns Object { stats, categoryData, urgencyData }
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const { history } = useTriageHistory()

  const today = new Date().toDateString()
  const todayMessages = history.filter((item) => new Date(item.timestamp).toDateString() === today)

  const highUrgency = history.filter((h) => h.urgency === 'High').length
  const totalDays = history.length > 0 ? 7 : 1
  const fallbackCount = history.filter((item) => item.source === 'mock').length

  const stats: DashboardStatsSummary = {
    total: history.length,
    today: todayMessages.length,
    highUrgencyPercent: history.length > 0 ? Math.round((highUrgency / history.length) * 100) : 0,
    avgPerDay: Math.round(history.length / totalDays),
    fallbackCount,
  }

  const categories: Record<string, number> = {}
  history.forEach((item) => {
    categories[item.category] = (categories[item.category] || 0) + 1
  })
  const categoryData: CategoryDataPoint[] = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
  }))

  const urgencyData: UrgencyDataMap = { High: 0, Medium: 0, Low: 0 }
  history.forEach((item) => {
    urgencyData[item.urgency] = (urgencyData[item.urgency] || 0) + 1
  })

  return { stats, categoryData, urgencyData }
}

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDashboardStats } from './useDashboardStats'
import type { TriageHistoryItem } from '../types/triage'

function seedHistory(entries: Partial<TriageHistoryItem>[]) {
  localStorage.setItem('triageHistory', JSON.stringify(entries))
}

describe('useDashboardStats', () => {
  it('returns all-zero stats with no history', () => {
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.stats).toMatchObject({
      total: 0,
      today: 0,
      highUrgencyPercent: 0,
      avgPerDay: 0,
      fallbackCount: 0,
    })
    expect(result.current.categoryData).toEqual([])
    expect(result.current.urgencyData).toEqual({ High: 0, Medium: 0, Low: 0 })
  })

  it("counts today's messages using the current date", () => {
    seedHistory([
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
      { category: 'Billing Issue', urgency: 'Low', timestamp: '2020-01-01T00:00:00.000Z' },
    ])
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.stats.total).toBe(2)
    expect(result.current.stats.today).toBe(1)
  })

  it('computes highUrgencyPercent as a rounded percentage', () => {
    seedHistory([
      { category: 'Billing Issue', urgency: 'High', timestamp: new Date().toISOString() },
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
    ])
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.stats.highUrgencyPercent).toBe(33)
  })

  it('builds category distribution counts', () => {
    seedHistory([
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
      { category: 'Feature Request', urgency: 'Low', timestamp: new Date().toISOString() },
    ])
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.categoryData).toEqual(
      expect.arrayContaining([
        { name: 'Billing Issue', count: 2 },
        { name: 'Feature Request', count: 1 },
      ])
    )
  })

  it('builds urgency breakdown counts', () => {
    seedHistory([
      { category: 'Billing Issue', urgency: 'High', timestamp: new Date().toISOString() },
      { category: 'Billing Issue', urgency: 'Medium', timestamp: new Date().toISOString() },
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
    ])
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.urgencyData).toEqual({ High: 1, Medium: 1, Low: 1 })
  })

  it('counts fallback-mode entries separately from llm entries', () => {
    seedHistory([
      {
        category: 'Billing Issue',
        urgency: 'Low',
        timestamp: new Date().toISOString(),
        source: 'mock',
      },
      {
        category: 'Billing Issue',
        urgency: 'Low',
        timestamp: new Date().toISOString(),
        source: 'llm',
      },
      { category: 'Billing Issue', urgency: 'Low', timestamp: new Date().toISOString() },
    ])
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.stats.fallbackCount).toBe(1)
  })
})

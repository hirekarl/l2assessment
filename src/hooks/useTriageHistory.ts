import { useState } from 'react'
import type { TriageHistoryItem } from '../types/triage'

const STORAGE_KEY = 'triageHistory'

function readHistory(): TriageHistoryItem[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

export interface UseTriageHistoryReturn {
  history: TriageHistoryItem[]
  appendEntry: (entry: Omit<TriageHistoryItem, 'id'> | Partial<TriageHistoryItem>) => void
  clearHistory: () => void
}

/**
 * Single source of truth for reading, appending to, and clearing the
 * triage history persisted in localStorage.
 * @returns Object { history, appendEntry, clearHistory }
 */
export function useTriageHistory(): UseTriageHistoryReturn {
  const [history, setHistory] = useState<TriageHistoryItem[]>(readHistory)

  const appendEntry = (entry: Omit<TriageHistoryItem, 'id'> | Partial<TriageHistoryItem>) => {
    const next = [...readHistory(), entry as TriageHistoryItem]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setHistory(next)
  }

  const clearHistory = () => {
    localStorage.setItem(STORAGE_KEY, '[]')
    setHistory([])
  }

  return { history, appendEntry, clearHistory }
}

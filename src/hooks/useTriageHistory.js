import { useState } from 'react'

const STORAGE_KEY = 'triageHistory'

function readHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

/**
 * Single source of truth for reading, appending to, and clearing the
 * triage history persisted in localStorage.
 * @returns {{history: object[], appendEntry: (entry: object) => void, clearHistory: () => void}}
 */
export function useTriageHistory() {
  const [history, setHistory] = useState(readHistory)

  const appendEntry = (entry) => {
    const next = [...readHistory(), entry]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setHistory(next)
  }

  const clearHistory = () => {
    localStorage.setItem(STORAGE_KEY, '[]')
    setHistory([])
  }

  return { history, appendEntry, clearHistory }
}

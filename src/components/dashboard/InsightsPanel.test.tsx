import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightsPanel from './InsightsPanel'

describe('InsightsPanel', () => {
  it('shows the empty-state message when there is no data', () => {
    render(
      <InsightsPanel stats={{ total: 0, today: 0, highUrgencyPercent: 0, fallbackCount: 0 }} />
    )
    expect(screen.getByText(/Start by analyzing/)).toBeInTheDocument()
  })

  it('warns when high-urgency volume exceeds 30%', () => {
    render(
      <InsightsPanel stats={{ total: 10, today: 2, highUrgencyPercent: 50, fallbackCount: 0 }} />
    )
    expect(screen.getByText(/High urgency messages represent 50%/)).toBeInTheDocument()
  })

  it('flags high activity when more than 10 messages were analyzed today', () => {
    render(
      <InsightsPanel stats={{ total: 20, today: 15, highUrgencyPercent: 0, fallbackCount: 0 }} />
    )
    expect(screen.getByText(/High activity today with 15 messages/)).toBeInTheDocument()
  })

  it('surfaces the fallback count with correct singular/plural wording', () => {
    const { rerender } = render(
      <InsightsPanel stats={{ total: 1, today: 0, highUrgencyPercent: 0, fallbackCount: 1 }} />
    )
    expect(screen.getByText(/1 of 1 triage ran in fallback mode/)).toBeInTheDocument()

    rerender(
      <InsightsPanel stats={{ total: 3, today: 0, highUrgencyPercent: 0, fallbackCount: 2 }} />
    )
    expect(screen.getByText(/2 of 3 triages ran in fallback mode/)).toBeInTheDocument()
  })
})

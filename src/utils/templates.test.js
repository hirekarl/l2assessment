import { describe, it, expect } from 'vitest'
import { getRecommendedAction, getAvailableCategories, shouldEscalate } from './templates.js'

describe('getRecommendedAction', () => {
  it('returns the standard template for non-High urgency', () => {
    expect(getRecommendedAction('Feature Request', 'Low')).toBe(
      'Log the request in the product feedback tracker and send the customer an acknowledgment.'
    )
  })

  it('returns the urgent override for High urgency', () => {
    expect(getRecommendedAction('Billing Issue', 'High')).toBe(
      'ESCALATE immediately to the billing team — customer may be experiencing a fraudulent charge or unexpected service disruption.'
    )
  })

  it('falls back to the Unknown override for an unrecognized category at High urgency', () => {
    expect(getRecommendedAction('Not A Real Category', 'High')).toBe(
      'ESCALATE for manual triage — high urgency but unclassified message.'
    )
  })

  it('falls back to a generic message for an unrecognized category at non-High urgency', () => {
    expect(getRecommendedAction('Not A Real Category', 'Low')).toBe('No recommendation available.')
  })

  it('gives a distinct action per category (no copy-paste bugs)', () => {
    const categories = getAvailableCategories().filter(c => c !== 'Unknown')
    const actions = categories.map(c => getRecommendedAction(c, 'Medium'))
    expect(new Set(actions).size).toBe(actions.length)
  })
})

describe('getAvailableCategories', () => {
  it('includes all four documented categories plus Unknown', () => {
    expect(getAvailableCategories()).toEqual(
      expect.arrayContaining(['Billing Issue', 'Technical Problem', 'General Inquiry', 'Feature Request', 'Unknown'])
    )
  })
})

describe('shouldEscalate', () => {
  it('escalates any High urgency message regardless of category', () => {
    expect(shouldEscalate('General Inquiry', 'High')).toBe(true)
    expect(shouldEscalate('Feature Request', 'High')).toBe(true)
  })

  it('escalates Medium urgency Billing Issues', () => {
    expect(shouldEscalate('Billing Issue', 'Medium')).toBe(true)
  })

  it('does not escalate Medium urgency for other categories', () => {
    expect(shouldEscalate('Technical Problem', 'Medium')).toBe(false)
    expect(shouldEscalate('General Inquiry', 'Medium')).toBe(false)
    expect(shouldEscalate('Feature Request', 'Medium')).toBe(false)
  })

  it('does not escalate Low urgency for any category', () => {
    expect(shouldEscalate('Billing Issue', 'Low')).toBe(false)
    expect(shouldEscalate('Technical Problem', 'Low')).toBe(false)
  })
})

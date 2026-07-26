import { describe, it, expect } from 'vitest'
import {
  getMockCategorization,
  VALID_CATEGORIES,
  VALID_URGENCIES,
  SYSTEM_PROMPT,
} from './categorization'

describe('getMockCategorization', () => {
  it('categorizes billing keywords as Billing Issue with Medium urgency by default', () => {
    const result = getMockCategorization('I was charged twice on my invoice this month')
    expect(result.category).toBe('Billing Issue')
    expect(result.urgency).toBe('Medium')
  })

  it('escalates billing urgency to High when fraud/urgent keywords are present', () => {
    const result = getMockCategorization('This charge is fraud, I need this fixed ASAP')
    expect(result.category).toBe('Billing Issue')
    expect(result.urgency).toBe('High')
  })

  it('categorizes technical keywords as Technical Problem with Medium urgency by default', () => {
    const result = getMockCategorization('The export button is broken')
    expect(result.category).toBe('Technical Problem')
    expect(result.urgency).toBe('Medium')
  })

  it('escalates technical urgency to High for outage/down keywords', () => {
    const result = getMockCategorization('The service is down for everyone')
    expect(result.category).toBe('Technical Problem')
    expect(result.urgency).toBe('High')
  })

  it('escalates technical urgency to High for double exclamation marks', () => {
    const result = getMockCategorization('This is broken!!')
    expect(result.category).toBe('Technical Problem')
    expect(result.urgency).toBe('High')
  })

  it('categorizes feature keywords as Feature Request with Low urgency', () => {
    const result = getMockCategorization('It would be great if you added dark mode')
    expect(result.category).toBe('Feature Request')
    expect(result.urgency).toBe('Low')
  })

  it('falls back to General Inquiry with Low urgency for anything else', () => {
    const result = getMockCategorization('How do I change my email address?')
    expect(result.category).toBe('General Inquiry')
    expect(result.urgency).toBe('Low')
  })

  it('always returns a non-empty reasoning string', () => {
    const result = getMockCategorization('anything at all')
    expect(typeof result.reasoning).toBe('string')
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('matches billing keywords case-insensitively', () => {
    const result = getMockCategorization('REFUND MY SUBSCRIPTION PLEASE')
    expect(result.category).toBe('Billing Issue')
  })
})

describe('categorization constants', () => {
  it('exposes exactly the four documented categories', () => {
    expect(VALID_CATEGORIES).toEqual([
      'Billing Issue',
      'Technical Problem',
      'Feature Request',
      'General Inquiry',
    ])
  })

  it('exposes exactly the three documented urgency levels', () => {
    expect(VALID_URGENCIES).toEqual(['High', 'Medium', 'Low'])
  })

  it('includes a JSON response format instruction in the system prompt', () => {
    expect(SYSTEM_PROMPT).toContain('"category"')
    expect(SYSTEM_PROMPT).toContain('"urgency"')
    expect(SYSTEM_PROMPT).toContain('"reasoning"')
  })
})

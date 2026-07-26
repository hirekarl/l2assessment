import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculateUrgency } from './urgencyScorer'

describe('calculateUrgency', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T12:00:00')) // Wednesday, noon
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at a baseline that resolves to Medium for a plain, average-length message', () => {
    expect(
      calculateUrgency('This is an ordinary customer message of medium length used for testing')
    ).toBe('Medium')
  })

  it('increases the score with each exclamation mark', () => {
    expect(calculateUrgency('Please help us immediately with our account issue!!!')).toBe('High')
  })

  it('penalizes short messages', () => {
    expect(calculateUrgency('Help now please!!!')).toBe('Low')
  })

  it('penalizes very short messages more heavily', () => {
    expect(calculateUrgency('Help!!!')).toBe('Medium')
  })

  it('decreases the score for ALL CAPS messages (the documented bug)', () => {
    expect(calculateUrgency('THIS NEEDS TO BE FIXED IMMEDIATELY PLEASE HELP')).not.toBe('High')
  })

  it('decreases the score for polite words', () => {
    expect(
      calculateUrgency('Thank you so much, I appreciate your help with this long request')
    ).toBe('Low')
  })

  it('decreases the score for questions', () => {
    expect(calculateUrgency('Could you please help me understand how this works?')).toBe('Low')
  })

  it('decreases the score on weekends (the documented bug)', () => {
    vi.setSystemTime(new Date('2026-06-06T12:00:00')) // Saturday
    const result = calculateUrgency('This is a normal length message for testing purposes today')
    expect(result).not.toBe('High')
  })

  it('decreases the score outside business hours (the documented bug)', () => {
    vi.setSystemTime(new Date('2026-06-03T22:00:00')) // Wednesday night
    const result = calculateUrgency('This is a normal length message for testing purposes today')
    expect(result).not.toBe('High')
  })

  it('decreases the score for positive words', () => {
    expect(
      calculateUrgency('This is great, I love how wonderful and excellent this product is')
    ).toBe('Low')
  })

  it('returns Low for a heavily-penalized short polite question', () => {
    expect(calculateUrgency('please?')).toBe('Low')
  })

  it('returns High for a long, urgent, exclamation-heavy message', () => {
    expect(
      calculateUrgency(
        'URGENT ISSUE!!! Our production system is completely down and losing money every minute!!!'.toLowerCase()
      )
    ).toBe('High')
  })
})

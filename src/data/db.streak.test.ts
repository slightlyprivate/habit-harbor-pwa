import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HabitDatabase } from './db'

const todayAt = (h: number, m = 0) => {
  const t = new Date()
  t.setHours(h, m, 0, 0)
  return t
}

const daysAgo = (n: number, h = 12) => {
  const t = new Date()
  t.setHours(h, 0, 0, 0)
  t.setDate(t.getDate() - n)
  return t
}

describe('HabitDatabase.calculateStreak', () => {
  // Freeze time to ensure stable expectations
  beforeEach(() => {
    const fixed = new Date()
    fixed.setHours(10, 0, 0, 0)
    vi.spyOn(Date, 'now').mockReturnValue(fixed.getTime())
  })

  it('returns 0 when no completions', () => {
    expect(HabitDatabase.calculateStreak([])).toBe(0)
  })

  it('counts only today as 1', () => {
    expect(HabitDatabase.calculateStreak([todayAt(8)])).toBe(1)
  })

  it('counts today and yesterday as 2', () => {
    expect(HabitDatabase.calculateStreak([todayAt(9), daysAgo(1, 21)])).toBe(2)
  })

  it('yesterday only counts as 1', () => {
    expect(HabitDatabase.calculateStreak([daysAgo(1)])).toBe(1)
  })

  it('gap breaks streak (today present, yesterday absent)', () => {
    expect(HabitDatabase.calculateStreak([todayAt(7), daysAgo(2)])).toBe(1)
  })

  it('gap breaks streak (yesterday present but day before absent)', () => {
    expect(HabitDatabase.calculateStreak([daysAgo(1), daysAgo(3)])).toBe(1)
  })

  it('multiple consecutive days are counted correctly', () => {
    const dates = [0, 1, 2, 3, 4].map(daysAgo)
    expect(HabitDatabase.calculateStreak(dates)).toBe(5)
  })
})

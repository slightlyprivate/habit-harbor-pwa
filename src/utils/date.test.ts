import { describe, it, expect } from 'vitest'
import { startOfDay, isSameDay, toDayKey, includesDay, toDayKeySet } from './date'

const d = (y: number, m: number, day: number, h = 12, min = 34): Date => new Date(y, m - 1, day, h, min, 0, 0)

describe('date utils', () => {
  it('startOfDay normalizes time to midnight', () => {
    const input = d(2024, 9, 1, 23, 59)
    const out = startOfDay(input)
    expect(out.getHours()).toBe(0)
    expect(out.getMinutes()).toBe(0)
    expect(out.getSeconds()).toBe(0)
    expect(out.getMilliseconds()).toBe(0)
  })

  it('isSameDay compares regardless of time', () => {
    const a = d(2024, 9, 1, 1)
    const b = d(2024, 9, 1, 23)
    const c = d(2024, 9, 2, 0)
    expect(isSameDay(a, b)).toBe(true)
    expect(isSameDay(a, c)).toBe(false)
  })

  it('toDayKey formats yyyy-mm-dd', () => {
    const key = toDayKey(d(2024, 3, 9))
    expect(key).toBe('2024-03-09')
  })

  it('includesDay finds date irrespective of time and type', () => {
    const dates = [d(2024, 9, 1), d(2024, 9, 2).toISOString()]
    expect(includesDay(dates, d(2024, 9, 1, 5))).toBe(true)
    expect(includesDay(dates, d(2024, 9, 2, 23))).toBe(true)
    expect(includesDay(dates, d(2024, 9, 3))).toBe(false)
  })

  it('toDayKeySet builds a set of normalized keys', () => {
    const set = toDayKeySet([d(2024, 1, 1, 20), d(2024, 1, 2, 5)])
    expect(set.has('2024-01-01')).toBe(true)
    expect(set.has('2024-01-02')).toBe(true)
    expect(set.has('2024-01-03')).toBe(false)
  })
})

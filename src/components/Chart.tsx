import { useMemo } from 'react'
import type { Habit } from '../data/db'
import { isSameDay, startOfDay, toDayKey } from '../utils/date'

interface Props { habits?: Habit[] }

// Activity card: highlights useful insights for count-based logging
export default function Chart({ habits = [] }: Props) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const last7 = useMemo(() => {
    const a: Date[] = []
    const d = new Date(today)
    for (let i = 0; i < 7; i++) { a.push(new Date(d)); d.setDate(d.getDate() - 1) }
    return a
  }, [today])

  const todayCounts = useMemo(() => {
    return habits.map(h => ({
      id: h.id,
      name: h.name,
      count: h.completedDates.filter(d => isSameDay(d, today)).length,
    }))
  }, [habits, today])

  const topToday = useMemo(() => {
    return [...todayCounts].sort((a, b) => b.count - a.count)[0]
  }, [todayCounts])

  const dailyTotals7 = useMemo(() => {
    return last7.map(day => {
      const total = habits.reduce((sum, h) => sum + h.completedDates.filter(d => isSameDay(d, day)).length, 0)
      return { key: toDayKey(day), label: day.toLocaleDateString(undefined, { weekday: 'short' }), total }
    })
  }, [habits, last7])

  const maxToday = Math.max(1, ...todayCounts.map(t => t.count))
  const max7 = Math.max(1, ...dailyTotals7.map(d => d.total))

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-muted">No habits yet. Add some to see activity.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-sm font-medium">Today by habit</div>
        {todayCounts.every(t => t.count === 0) ? (
          <div className="text-sm text-muted">No activity yet today.</div>
        ) : (
          <div className="space-y-2">
            {todayCounts
              .filter(t => t.count > 0)
              .sort((a, b) => b.count - a.count)
              .map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="w-28 shrink-0 text-sm text-muted truncate" title={t.name}>{t.name}</div>
                  <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-[color:var(--color-muted)]" style={{ width: `${(t.count / maxToday) * 100}%` }} aria-label={`${t.name} today ${t.count}`} />
                  </div>
                  <div className="w-10 text-right text-sm tabular-nums">{t.count}</div>
                </div>
              ))}
          </div>
        )}
        {topToday && topToday.count > 0 && (
          <div className="mt-2 text-xs text-muted">Most active today: {topToday.name}</div>
        )}
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Last 7 days (total events)</div>
        <div className="flex items-end gap-2 h-24">
          {dailyTotals7.map(d => (
            <div key={d.key} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-6 sm:w-7 bg-[color:var(--color-muted)] rounded-t" style={{ height: `${(d.total / max7) * 100}%` }} aria-label={`${d.label} total ${d.total}`} />
              <div className="mt-1 text-[10px] text-muted">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

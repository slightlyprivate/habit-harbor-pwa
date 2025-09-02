import { useMemo } from 'react'
import type { Habit } from '../data/db'
import { includesDay, startOfDay } from '../utils/date'

interface HabitListProps {
  habits?: Habit[]
  onToggleHabit?: (habitId: string, date: Date) => void
}

export default function HabitList({ habits = [], onToggleHabit }: HabitListProps) {
  const today = useMemo(() => startOfDay(new Date()), [])

  const isCompletedToday = (habit: Habit) => includesDay(habit.completedDates, today)

  const handleToggle = (habit: Habit) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    onToggleHabit?.(habit.id, today)
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>No habits yet. Add your first habit above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="flex items-center justify-between p-4 card">
          <div className="flex-1">
            <h3 className="font-medium text-text">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-muted mt-1">{habit.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted">
              <span>Streak: {habit.streak} days</span>
              {habit.lastCompleted && (
                <span>Last: {habit.lastCompleted.toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleToggle(habit)}
            className={`ml-4 w-8 h-8 rounded-full border-2 transition-colors ${
              isCompletedToday(habit)
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-border hover:border-muted'
            }`}
            aria-label={isCompletedToday(habit) ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompletedToday(habit) && '✓'}
          </button>
        </div>
      ))}
    </div>
  )
}

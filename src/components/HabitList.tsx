import { useState, useEffect } from 'react'

interface Habit {
  id: string
  name: string
  description?: string
  createdAt: Date
  streak: number
  lastCompleted?: Date
  completedDates: Date[]
}

interface HabitListProps {
  habits?: Habit[]
  onToggleHabit?: (habitId: string, date: Date) => void
}

export default function HabitList({ habits = [], onToggleHabit }: HabitListProps) {
  const [localHabits, setLocalHabits] = useState<Habit[]>(habits)

  useEffect(() => {
    setLocalHabits(habits)
  }, [habits])

  const isCompletedToday = (habit: Habit) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return habit.completedDates.some(date => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
  }

  const handleToggle = (habit: Habit) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    onToggleHabit?.(habit.id, today)
  }

  if (localHabits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No habits yet. Add your first habit above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {localHabits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{habit.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
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
                : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
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

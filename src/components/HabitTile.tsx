import React from 'react'
import type { Habit } from '../data/db'
import { isSameDay } from '../utils/date'

interface HabitTileProps {
  habit: Habit
  onIncrement: (id: string) => void
  onOpenDetail: (id: string) => void
}

export default function HabitTile({ habit, onIncrement, onOpenDetail }: HabitTileProps) {
  const today = new Date(); today.setHours(0,0,0,0)
  const todayCount = habit.completedDates.filter(d => isSameDay(d, today)).length
  return (
    <div className="relative group">
      <button
        onClick={() => onIncrement(habit.id)}
        className="w-full aspect-square rounded-2xl shadow bg-white/80 dark:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center"
        aria-label={`Log one ${habit.name} for today. Current count ${todayCount}`}
      >
        <div className="relative flex items-center justify-center">
          <span className="text-3xl" aria-hidden>
            {habit.icon || '🎯'}
          </span>
          {todayCount > 0 && (
            <span className="absolute -top-2 -right-3 min-w-6 h-6 px-1 rounded-full bg-[color:var(--color-muted)] text-white text-xs flex items-center justify-center tabular-nums" aria-hidden>
              {todayCount}
            </span>
          )}
        </div>
        <span className="sr-only">{habit.name}</span>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpenDetail(habit.id) }}
        aria-label={`Open ${habit.name} details`}
        className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/80 border border-border shadow flex items-center justify-center text-sm hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 sm:pointer-events-none sm:group-hover:pointer-events-auto sm:focus:pointer-events-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5.5v-.42l8.56-8.56.42.42-8.56 8.56zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
        </svg>
      </button>
    </div>
  )
}

import React from 'react'
import type { Habit } from '../data/db'
import HabitTile from './HabitTile'

interface Props {
  habits: Habit[]
  onAddClick: () => void
  onHabitIncrement: (habitId: string) => void
  onHabitOpen: (habitId: string) => void
}

export default function HabitGrid({ habits, onAddClick, onHabitIncrement, onHabitOpen }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {habits.map((h) => (
        <HabitTile key={h.id} habit={h} onIncrement={onHabitIncrement} onOpenDetail={onHabitOpen} />
      ))}

      <button
        onClick={onAddClick}
        className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center"
        aria-label="Add habit"
      >
        <span className="text-3xl">＋</span>
      </button>
    </div>
  )
}

import { useState } from 'react'

interface HabitFormProps {
  onAddHabit?: (habit: { name: string; description?: string }) => void
}

export default function HabitForm({ onAddHabit }: HabitFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAddHabit?.({ name: name.trim(), description: description.trim() || undefined })
      setName('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Habit Name *
        </label>
        <input
          type="text"
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Drink 8 glasses of water"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details about your habit..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Habit
      </button>
    </form>
  )
}

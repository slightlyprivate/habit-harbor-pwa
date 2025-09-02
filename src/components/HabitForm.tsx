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
        <label htmlFor="habit-name" className="block text-sm font-medium text-text mb-1">
          Habit Name *
        </label>
        <input
          type="text"
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Drink 8 glasses of water"
          className="input"
          required
        />
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-text mb-1">
          Description (optional)
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details about your habit..."
          rows={3}
          className="textarea"
        />
      </div>

      <button type="submit" className="w-full btn btn-primary">
        Add Habit
      </button>
    </form>
  )
}

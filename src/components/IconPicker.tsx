import React, { useMemo, useState } from 'react'

export interface IconOption {
  value: string // emoji or short label
  label: string
}

const DEFAULT_ICONS: IconOption[] = [
  { value: '💧', label: 'Water' },
  { value: '🏃', label: 'Run' },
  { value: '🧘', label: 'Meditate' },
  { value: '📚', label: 'Read' },
  { value: '😴', label: 'Sleep' },
  { value: '🍎', label: 'Eat healthy' },
  { value: '☕', label: 'Coffee' },
  { value: '🚭', label: 'No smoking' },
  { value: '🚬', label: 'Cigarette' },
  { value: '🏋️', label: 'Workout' },
  { value: '🧗', label: 'Climb' },
  { value: '🧑‍💻', label: 'Code' },
  { value: '📝', label: 'Journal' },
  { value: '🧹', label: 'Clean' },
  { value: '🧴', label: 'Skincare' },
  { value: '🌞', label: 'Sunlight' },
  { value: '🧪', label: 'Study' },
  { value: '🧺', label: 'Laundry' },
]

interface IconPickerProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
}

export default function IconPicker({ label = 'Emoji/Icon', value, onChange }: IconPickerProps) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DEFAULT_ICONS
    return DEFAULT_ICONS.filter(opt =>
      opt.label.toLowerCase().includes(q) || opt.value.includes(q)
    )
  }, [query])

  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons..."
          className="input"
          aria-label="Search icons"
        />
        <button
          type="button"
          className="w-12 h-10 rounded-md border border-border flex items-center justify-center"
          aria-label="Clear search"
          onClick={() => setQuery('')}
        >
          ✖
        </button>
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
        {filtered.map(opt => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className={`aspect-square rounded-lg border border-border flex items-center justify-center hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${value === opt.value ? 'ring-2 ring-[--color-ring]' : ''}`}
            title={opt.label}
            aria-label={`Select ${opt.label}`}
          >
            <span className="text-xl" aria-hidden>{opt.value}</span>
          </button>
        ))}
      </div>
      {value && (
        <div className="mt-2 text-sm text-muted">Selected: {value}</div>
      )}
    </div>
  )
}


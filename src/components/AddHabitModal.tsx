import React, { useEffect, useRef, useState, FormEvent } from 'react'
import IconPicker from './IconPicker'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; icon?: string }) => Promise<void> | void
}

export default function AddHabitModal({ isOpen, onClose, onSubmit }: AddHabitModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [target, setTarget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(false)

  // Body scroll lock and initial focus
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => {
        setVisible(true)
        firstFieldRef.current?.focus()
      }, 0)
      return () => {
        document.body.style.overflow = prev
        clearTimeout(t)
        setName('')
        setEmoji('')
        setTarget('')
        setSubmitting(false)
        setVisible(false)
      }
    }
  }, [isOpen])

  // Keyboard handling for ESC and focus trap
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'))
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      // Pass through icon; keep target optional in description for now
      const description = target.trim() ? `target ${target.trim()}` : undefined
      await onSubmit({ name: name.trim(), description, icon: emoji.trim() || undefined })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={dialogRef} className={`w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-lg transition transform duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <h2 className="text-lg font-semibold mb-4">Add Habit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="habit-name" className="block text-sm font-medium text-text mb-1">
                Name
              </label>
              <input
                ref={firstFieldRef}
                id="habit-name"
                type="text"
                className="input"
                placeholder="e.g., Drink water"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <IconPicker label="Emoji/Icon" value={emoji} onChange={setEmoji} />
              <div>
                <label htmlFor="habit-target" className="block text-sm font-medium text-text mb-1">
                  Target (optional)
                </label>
                <input
                  id="habit-target"
                  type="text"
                  className="input"
                  placeholder="e.g., 8/day"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

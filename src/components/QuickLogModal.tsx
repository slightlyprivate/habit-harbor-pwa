import React, { useEffect, useRef, useState } from 'react'
import type { Habit } from '../data/db'

interface Props {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
  onIncrement: (id: string) => void
}

export default function QuickLogModal({ isOpen, onClose, habits, onIncrement }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', keyHandler)
    const t = setTimeout(() => { setVisible(true); dialogRef.current?.querySelector<HTMLElement>('button')?.focus() }, 0)
    return () => { document.removeEventListener('keydown', keyHandler); clearTimeout(t); document.body.style.overflow = prev; setVisible(false) }
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={dialogRef} className={`w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-lg transition transform duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <h2 className="text-lg font-semibold mb-3">Quick Log</h2>
          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {habits.length === 0 ? (
              <div className="text-sm text-muted">No habits yet. Start with one you do most days.</div>
            ) : habits.map(h => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center" aria-hidden>{h.icon || '🎯'}</div>
                  <div className="font-medium">{h.name}</div>
                </div>
                <button className="btn btn-primary" onClick={() => onIncrement(h.id)}>Log now</button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}


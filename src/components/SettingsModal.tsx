import React, { useEffect, useRef, useState } from 'react'
import type { Habit } from '../data/db'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onToggleDarkMode?: () => void
  onClearAll?: () => Promise<void> | void
  onExport?: () => void
  onImport?: (file: File) => Promise<void> | void
  analyticsEnabled?: boolean
  onToggleAnalytics?: (enabled: boolean) => void
  archivedHabits?: Habit[]
  onUnarchiveArchived?: (id: string) => void
  onDeleteArchived?: (id: string) => Promise<void> | void
}

export default function SettingsModal({ isOpen, onClose, onToggleDarkMode, onClearAll, onExport, onImport, analyticsEnabled, onToggleAnalytics, archivedHabits, onUnarchiveArchived, onDeleteArchived }: SettingsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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
    document.addEventListener('keydown', keyHandler)
    const t = setTimeout(() => {
      setVisible(true)
      dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
    }, 0)
    return () => {
      document.removeEventListener('keydown', keyHandler)
      clearTimeout(t)
      document.body.style.overflow = prev
      setConfirming(false)
      setBusy(false)
      setVisible(false)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleClear = async () => {
    if (!onClearAll) return
    setBusy(true)
    try {
      await onClearAll()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={dialogRef} className={`w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-lg transition transform duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <p className="text-sm text-muted mb-4">Your data, your device. Export anytime.</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="w-full text-left px-3 py-2 rounded-lg border border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Toggle Dark Mode
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExport}
                className="w-full text-left px-3 py-2 rounded-lg border border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Export Data
              </button>
              <div>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={async (e) => {
                  const file = e.currentTarget.files?.[0]
                  if (file && onImport) {
                    setBusy(true)
                    try { await onImport(file); onClose() } finally { setBusy(false) }
                  }
                }} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3 py-2 rounded-lg border border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={busy}
                >
                  Import Data
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-muted">Privacy-respecting events. You can disable anytime.</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onToggleAnalytics?.(!analyticsEnabled)}
              >
                {analyticsEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="font-medium mb-2">Archived</div>
              {!archivedHabits || archivedHabits.length === 0 ? (
                <div className="text-sm text-muted">No archived habits.</div>
              ) : (
                <div className="space-y-2">
                  {archivedHabits.map(h => (
                    <div key={h.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-background flex items-center justify-center" aria-hidden>{h.icon || '🎯'}</div>
                        <div className="text-sm">{h.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => onUnarchiveArchived?.(h.id)}>Unarchive</button>
                        <button type="button" className="btn btn-secondary" onClick={() => onDeleteArchived?.(h.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Clear all data</div>
                  <div className="text-sm text-muted">Removes all habits and history from this device.</div>
                </div>
                {!confirming ? (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="btn btn-secondary"
                  >
                    Clear…
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirming(false)} className="btn btn-secondary">Cancel</button>
                    <button type="button" disabled={busy} onClick={handleClear} className="btn btn-primary">Confirm</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

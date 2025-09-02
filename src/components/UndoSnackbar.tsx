import React, { useEffect } from 'react'

interface UndoSnackbarProps {
  open: boolean
  message: string
  onUndo: () => void
  onClose: () => void
  duration?: number
}

export default function UndoSnackbar({ open, message, onUndo, onClose, duration = 5000 }: UndoSnackbarProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, onClose, duration])

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <div className="max-w-screen-md w-full">
        <div className="rounded-xl bg-surface border border-border shadow p-3 flex items-center justify-between">
          <div className="text-sm">{message}</div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Dismiss</button>
            <button type="button" className="btn btn-primary" onClick={onUndo}>Undo</button>
          </div>
        </div>
      </div>
    </div>
  )
}


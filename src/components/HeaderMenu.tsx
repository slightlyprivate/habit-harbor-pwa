import React, { useEffect, useRef } from 'react'

interface HeaderMenuProps {
  isOpen: boolean
  onClose: () => void
  onInstallApp?: () => void
  onToggleDarkMode?: () => void
  canInstall?: boolean
  anchor?: { top: number; right: number }
}

export default function HeaderMenu({ isOpen, onClose, onInstallApp, onToggleDarkMode, canInstall, anchor }: HeaderMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  useEffect(() => {
    if (!isOpen) return
    setVisible(false)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
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
    document.addEventListener('keydown', handleKey)
    const t = setTimeout(() => {
      setVisible(true)
      panelRef.current?.querySelector<HTMLElement>('button')?.focus()
    }, 0)
    return () => {
      document.removeEventListener('keydown', handleKey)
      clearTimeout(t)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50" aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className="absolute" style={{ top: anchor?.top ?? 64, right: anchor?.right ?? 16 }}>
        <div
          ref={panelRef}
          role="menu"
          aria-label="App menu"
          className={`w-56 rounded-xl bg-surface border border-border shadow-lg p-2 transition transform duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        >
          {canInstall && (
            <button
              type="button"
              onClick={() => { onInstallApp?.(); onClose() }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Install App
            </button>
          )}
          <button
            type="button"
            onClick={() => { onToggleDarkMode?.(); onClose() }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Toggle Dark Mode
          </button>
        </div>
      </div>
    </div>
  )
}

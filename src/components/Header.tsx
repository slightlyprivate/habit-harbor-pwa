import React from 'react'

interface HeaderProps {
  onMenuClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onSettingsClick?: () => void
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-3">
        <div className="rounded-3xl shadow bg-surface border border-border px-3 py-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Settings"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden>⚙️</span>
          </button>
          <div className="text-base sm:text-lg font-semibold text-text select-none">
            Habit Log
          </div>
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Menu"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden>☰</span>
          </button>
        </div>
      </div>
    </header>
  )
}

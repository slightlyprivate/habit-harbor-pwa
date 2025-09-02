import { useCallback } from 'react'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import StreakChart from './components/StreakChart'
import { useDarkMode } from './hooks/useDarkMode'
import { usePwaInstall } from './hooks/usePwaInstall'
import { useHabits } from './hooks/useHabits'

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const { canInstall, promptInstall } = usePwaInstall()
  const { habits, loading, addHabit, toggleHabit } = useHabits()

  const handleInstallClick = useCallback(async () => {
    const result = await promptInstall()
    if (result?.outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
  }, [promptInstall])

  const handleAddHabit = addHabit

  const handleToggleHabit = toggleHabit

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 bg-surface shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text">Habit Harbor</h1>
          <div className="flex items-center gap-3">
            {canInstall && (
              <button onClick={handleInstallClick} className="btn btn-primary">Install App</button>
            )}
            <button
              onClick={toggleDarkMode}
              className="btn btn-ghost p-2"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Habit Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
            <HabitForm onAddHabit={handleAddHabit} />
          </div>

          {/* Habit List */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Your Habits</h2>
            {loading ? (
              <div className="text-center py-8 text-muted">
                <p>Loading habits...</p>
              </div>
            ) : (
              <HabitList habits={habits} onToggleHabit={handleToggleHabit} />
            )}
          </div>
        </div>

        {/* Streak Chart */}
        <div className="mt-8 card p-6">
          <h2 className="text-xl font-semibold mb-4">Habit Streaks</h2>
          <StreakChart habits={habits} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted">
          <p>Track your habits offline-first with PWA support</p>
        </div>
      </footer>
    </div>
  )
}

export default App

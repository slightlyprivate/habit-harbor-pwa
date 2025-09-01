import { useState, useEffect } from 'react'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import StreakChart from './components/StreakChart'
import { HabitDatabase, type Habit } from './data/db'

// Type for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function App() {
  // Initialize dark mode state based on localStorage or system preference
  const getInitialDarkMode = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const [darkMode, setDarkMode] = useState(getInitialDarkMode)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Apply initial dark mode to document element
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    })

    // Load habits from database
    const loadHabits = async () => {
      try {
        const loadedHabits = await HabitDatabase.getHabits()
        setHabits(loadedHabits)
      } catch (error) {
        console.error('Error loading habits:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHabits()
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleAddHabit = async (habitData: { name: string; description?: string }) => {
    try {
      const newHabit = await HabitDatabase.addHabit(habitData)
      setHabits(prev => [...prev, newHabit])
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  const handleToggleHabit = async (habitId: string, date: Date) => {
    try {
      const updatedHabit = await HabitDatabase.toggleHabitCompletion(habitId, date)
      if (updatedHabit) {
        setHabits(prev => prev.map(habit =>
          habit.id === habitId ? updatedHabit : habit
        ))
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Habit Harbor</h1>
          <div className="flex items-center gap-4">
            {showInstallPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Install App
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
            <HabitForm onAddHabit={handleAddHabit} />
          </div>

          {/* Habit List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Habits</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Loading habits...</p>
              </div>
            ) : (
              <HabitList habits={habits} onToggleHabit={handleToggleHabit} />
            )}
          </div>
        </div>

        {/* Streak Chart */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Habit Streaks</h2>
          <StreakChart habits={habits} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Track your habits offline-first with PWA support</p>
        </div>
      </footer>
    </div>
  )
}

export default App

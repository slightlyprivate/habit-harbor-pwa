import { useCallback, useState } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { usePwaInstall } from './hooks/usePwaInstall'
import { useHabits } from './hooks/useHabits'
import Header from './components/Header'
import HabitGrid from './components/HabitGrid'
import AddHabitModal from './components/AddHabitModal'
import Chart from './components/Chart'
import HeaderMenu from './components/HeaderMenu'
import SettingsModal from './components/SettingsModal'
import HabitDetailModal from './components/HabitDetailModal'
import UndoSnackbar from './components/UndoSnackbar'

function App() {
  const { toggleDarkMode } = useDarkMode()
  const { canInstall, promptInstall } = usePwaInstall()
  const { habits, loading, addHabit, logOccurrence, decrementOccurrence, deleteHabit, replaceAll, updateHabit } = useHabits()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [snack, setSnack] = useState<{ open: boolean; message: string; undo: (() => void) | null }>({ open: false, message: '', undo: null })

  const handleInstallClick = useCallback(async () => {
    const result = await promptInstall()
    if (result?.outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
  }, [promptInstall])

  const handleAddHabit = addHabit

  return (
    <div className="min-h-screen bg-background text-text">
      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        onMenuClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const top = rect.bottom + 8
          const right = Math.max(8, window.innerWidth - rect.right + 8)
          setMenuAnchor({ top, right })
          setIsMenuOpen((v) => !v)
        }}
      />

      <main className="max-w-screen-md mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-center text-3xl sm:text-4xl font-semibold text-gray-600 my-8">
          Track your habits offline-first
        </h1>

        <section className="mb-6">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
            Habits
          </h3>
          {loading ? (
            <div className="text-center py-8 text-muted">
              <p>Loading habits...</p>
            </div>
          ) : (
            <HabitGrid
              habits={habits}
              onAddClick={() => setIsAddOpen(true)}
              onHabitIncrement={(id) => {
                logOccurrence(id, new Date())
                const habit = habits.find(h => h.id === id)
                setSnack({ open: true, message: `Logged one for ${habit?.name ?? 'habit'}`, undo: () => decrementOccurrence(id, new Date()) })
              }}
              onHabitOpen={(id) => setSelectedHabitId(id)}
            />
          )}
        </section>

        <section className="mb-10">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
            Activity
          </h3>
          <div className="card p-4">
            <Chart habits={habits} />
          </div>
        </section>

        <AddHabitModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAddHabit}
        />
        <HeaderMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onInstallApp={handleInstallClick}
          onToggleDarkMode={toggleDarkMode}
          canInstall={canInstall}
          anchor={menuAnchor || undefined}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onToggleDarkMode={toggleDarkMode}
          onClearAll={async () => {
            // Remove all habits using existing hook to avoid bypassing state
            for (const h of habits) {
              await deleteHabit(h.id)
            }
          }}
          onExport={() => {
            const data = JSON.stringify(habits, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `habit-harbor-backup-${new Date().toISOString().slice(0,10)}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }}
          onImport={async (file) => {
            const text = await file.text()
            const raw = JSON.parse(text) as unknown
            if (!Array.isArray(raw)) throw new Error('Invalid backup file')
            type RawHabit = {
              id?: unknown
              name?: unknown
              description?: unknown
              icon?: unknown
              createdAt?: unknown
              streak?: unknown
              lastCompleted?: unknown
              completedDates?: unknown
            }
            const items = (raw as RawHabit[]).map((h) => ({
              id: typeof h.id === 'string' ? h.id : crypto.randomUUID(),
              name: typeof h.name === 'string' ? h.name : 'Untitled',
              description: typeof h.description === 'string' ? h.description : undefined,
              icon: typeof h.icon === 'string' ? h.icon : undefined,
              createdAt: new Date((h.createdAt as string | number | Date | undefined) ?? Date.now()),
              streak: Number.isFinite(h.streak as number) ? (h.streak as number) : 0,
              lastCompleted: h.lastCompleted ? new Date(h.lastCompleted as string | number | Date) : undefined,
              completedDates: Array.isArray(h.completedDates)
                ? (h.completedDates as Array<string | number | Date>).map((d) => new Date(d))
                : [],
            }))
            await replaceAll(items)
          }}
        />

        <HabitDetailModal
          habit={habits.find(h => h.id === selectedHabitId)}
          isOpen={!!selectedHabitId}
          onClose={() => setSelectedHabitId(null)}
          onIncrement={(id) => {
            logOccurrence(id, new Date())
            const habit = habits.find(h => h.id === id)
            setSnack({ open: true, message: `Logged one for ${habit?.name ?? 'habit'}`, undo: () => decrementOccurrence(id, new Date()) })
          }}
          onDecrement={(id) => {
            decrementOccurrence(id, new Date())
            const habit = habits.find(h => h.id === id)
            setSnack({ open: true, message: `Removed one from ${habit?.name ?? 'habit'}`, undo: () => logOccurrence(id, new Date()) })
          }}
          onUpdate={async (id, patch) => { await updateHabit(id, patch) }}
          onDelete={async (id) => { await deleteHabit(id); setSelectedHabitId(null) }}
        />

        <UndoSnackbar
          open={snack.open}
          message={snack.message}
          onUndo={() => { snack.undo?.(); setSnack({ open: false, message: '', undo: null }) }}
          onClose={() => setSnack({ open: false, message: '', undo: null })}
        />
      </main>
    </div>
  )
}

export default App

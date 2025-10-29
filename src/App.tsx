import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { usePwaInstall } from './hooks/usePwaInstall'
import { useHabits } from './hooks/useHabits'
import Header from './components/Header'
import HabitGrid from './components/HabitGrid'
import AddHabitModal from './components/AddHabitModal'
import OnboardingModal from './components/OnboardingModal'
import Chart from './components/Chart'
import HeaderMenu from './components/HeaderMenu'
import SettingsModal from './components/SettingsModal'
import HabitDetailModal from './components/HabitDetailModal'
import UndoSnackbar from './components/UndoSnackbar'
import { analyticsEnabled as getAE, setAnalyticsEnabled, track } from './utils/analytics'
import { HabitDatabase } from './data/db'
import QuickLogModal from './components/QuickLogModal'

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
  const [analyticsEnabled, setAE] = useState<boolean>(getAE())
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false)

  useEffect(() => { track('app_open') }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') {
        e.preventDefault()
        setIsQuickLogOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
        {loading ? (
          <div className="grid gap-4 my-8">
            <div className="h-24 card animate-pulse" />
            <div className="h-40 card animate-pulse" />
          </div>
        ) : habits.length === 0 ? (
          <section className="text-center my-10">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-3">Track habits. See progress. Stay consistent.</h1>
            <p className="text-muted max-w-xl mx-auto mb-6">Offline-first, distraction-free habit logging with streaks, insights, and gentle nudges.</p>
            <div className="flex justify-center gap-3">
              <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>Create your first habit</button>
              <button className="btn btn-secondary" onClick={async () => {
                // Seed demo data
                const seeded = [
                  { name: 'Water', icon: '💧' },
                  { name: 'Reading', icon: '📖' },
                  { name: 'Walk', icon: '🚶' },
                ]
                for (const h of seeded) { await addHabit(h) }
                const all = await HabitDatabase.getHabits()
                const now = new Date()
                for (const h of all) {
                  for (let i = 0; i < 12; i++) {
                    const d = new Date(now)
                    d.setDate(d.getDate() - Math.floor(Math.random()*10))
                    await logOccurrence(h.id, d)
                  }
                }
                setSnack({ open: true, message: 'Demo data added. You can reset in Settings.', undo: null })
              }}>Try demo data</button>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6">
              <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Today</h3>
              <div className="card p-3">
                {habits.filter(h => !h.archived).map(h => {
                  const today = new Date(); today.setHours(0,0,0,0)
                  const count = h.completedDates.filter(d => d.toDateString() === today.toDateString()).length
                  return (
                    <div key={h.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-xl" aria-hidden>{h.icon || '🎯'}</div>
                        <div>
                          <div className="font-medium">{h.name}</div>
                          <div className="text-xs text-muted">{h.streak > 0 ? `${h.streak}-day streak` : 'No streak yet'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-secondary" onClick={() => { decrementOccurrence(h.id, new Date()); setSnack({ open: true, message: `Removed one from ${h.name}`, undo: () => logOccurrence(h.id, new Date()) }) }}>✖</button>
                        <button className="btn btn-primary" onClick={() => { logOccurrence(h.id, new Date()); setSnack({ open: true, message: `Nice! ${h.streak + 1}-day streak.`, undo: () => decrementOccurrence(h.id, new Date()) }) }}>✅</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 mb-10">
              <div className="card p-4">
                <div className="text-sm font-medium mb-2">Streaks & Consistency</div>
                <Chart habits={habits} />
              </div>
              <div className="card p-4">
                <div className="text-sm font-medium mb-2">This Week</div>
                {(() => {
                  const today = new Date()
                  const start = new Date(today); const day = start.getDay(); const diff = (day + 6) % 7; start.setDate(start.getDate() - diff)
                  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
                  const counts = new Array(7).fill(0)
                  habits.forEach(h => {
                    h.completedDates.forEach(d => {
                      const dd = new Date(d); dd.setHours(0,0,0,0)
                      if (dd >= start) {
                        const idx = (dd.getDay() + 6) % 7
                        counts[idx] += 1
                      }
                    })
                  })
                  const max = Math.max(1, ...counts)
                  return (
                    <div className="space-y-2">
                      {labels.map((lab, i) => (
                        <div key={lab} className="flex items-center gap-2">
                          <div className="w-10 text-xs text-muted">{lab}</div>
                          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-[color:var(--color-muted)]" style={{ width: `${(counts[i] / max) * 100}%` }} />
                          </div>
                          <div className="w-8 text-right text-xs tabular-nums">{counts[i]}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </section>

            <section className="mb-10">
              <div className="card p-4">
                <div className="text-sm font-medium mb-2">Activity</div>
                <div className="text-sm text-muted">Logs show up here.</div>
              </div>
            </section>
          </>
        )}

        {habits.length === 0 ? (
          <OnboardingModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onComplete={async (data) => {
              await addHabit({ name: data.name, icon: data.icon, description: data.motivation })
            }}
          />
        ) : (
          <AddHabitModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleAddHabit}
          />
        )}
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
            a.download = `habit-log-backup-${new Date().toISOString().slice(0,10)}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            track('export_json')
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
            track('import_json')
          }}
          analyticsEnabled={analyticsEnabled}
          onToggleAnalytics={(enabled) => { setAE(enabled); setAnalyticsEnabled(enabled) }}
          archivedHabits={habits.filter(h => h.archived)}
          onUnarchiveArchived={(id) => {
            HabitDatabase.setArchived(id, false).then(async (updated) => {
              if (updated) {
                await updateHabit(id, {})
                setSnack({ open: true, message: 'Unarchived', undo: null })
              }
            })
          }}
          onDeleteArchived={async (id) => {
            await deleteHabit(id)
            setSnack({ open: true, message: 'Deleted', undo: null })
          }}
        />

        <QuickLogModal
          isOpen={isQuickLogOpen}
          onClose={() => setIsQuickLogOpen(false)}
          habits={habits}
          onIncrement={(id) => { logOccurrence(id, new Date()); setSnack({ open: true, message: 'Logged!', undo: () => decrementOccurrence(id, new Date()) }) }}
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
          onSkip={(id) => {
            HabitDatabase.skipHabitDate(id, new Date()).then(() => {
              setSnack({ open: true, message: 'Marked as skipped for today.', undo: null })
            })
          }}
          onArchiveToggle={(id, archived) => {
            HabitDatabase.setArchived(id, archived).then(async (updated) => {
              if (updated) {
                await updateHabit(id, { })
                setSnack({ open: true, message: archived ? 'Archived' : 'Unarchived', undo: null })
              }
            })
          }}
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

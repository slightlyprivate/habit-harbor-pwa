import { useCallback, useEffect, useState } from 'react'
import { HabitDatabase, type Habit } from '../data/db'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await HabitDatabase.getHabits()
        setHabits(loaded)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addHabit = useCallback(async (habitData: { name: string; description?: string; icon?: string }) => {
    try {
      const newHabit = await HabitDatabase.addHabit(habitData)
      setHabits(prev => [...prev, newHabit])
      // Track habit addition event
      window.umami?.track('add_habit')
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])

  const toggleHabit = useCallback(async (habitId: string, date: Date) => {
    try {
      const updated = await HabitDatabase.toggleHabitCompletion(habitId, date)
      if (updated) {
        setHabits(prev => prev.map(h => (h.id === habitId ? updated : h)))
      }
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])

  const logOccurrence = useCallback(async (habitId: string, date: Date) => {
    try {
      const updated = await HabitDatabase.logHabitOccurrence(habitId, date)
      if (updated) {
        setHabits(prev => prev.map(h => (h.id === habitId ? updated : h)))
      }
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])

  const decrementOccurrence = useCallback(async (habitId: string, date: Date) => {
    try {
      const updated = await HabitDatabase.removeHabitOccurrence(habitId, date)
      if (updated) {
        setHabits(prev => prev.map(h => (h.id === habitId ? updated : h)))
      }
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])

  const deleteHabit = useCallback(async (habitId: string) => {
    const success = await HabitDatabase.deleteHabit(habitId)
    if (success) setHabits(prev => prev.filter(h => h.id !== habitId))
    return success
  }, [])

  const replaceAll = useCallback(async (items: Habit[]) => {
    await HabitDatabase.saveHabits(items)
    setHabits(items)
  }, [])

  const updateHabit = useCallback(async (habitId: string, patch: Partial<Pick<Habit, 'name' | 'description' | 'icon'>>) => {
    const updated = await HabitDatabase.updateHabit(habitId, patch)
    if (updated) setHabits(prev => prev.map(h => (h.id === habitId ? updated : h)))
    return updated
  }, [])

  return { habits, loading, error, addHabit, toggleHabit, logOccurrence, decrementOccurrence, deleteHabit, replaceAll, updateHabit }
}

import localforage from 'localforage'
import { isSameDay, toDayKey, toDayKeySet, startOfDay } from '../utils/date'

export interface Habit {
  id: string
  name: string
  description?: string
  icon?: string
  createdAt: Date
  streak: number
  lastCompleted?: Date
  completedDates: Date[]
  // New optional fields for cadence/rules and UX
  frequency?: 'daily' | 'weekly' | 'weekdays'
  targetType?: 'checkbox' | 'minutes' | 'count'
  targetValue?: number
  reminderNote?: string
  motivation?: string
  archived?: boolean
  skippedDates?: Date[]
}

// Configure localForage
localforage.config({
  name: 'HabitLog',
  storeName: 'habits'
})

const HABITS_KEY = 'habitlog_user_habits'

export class HabitDatabase {
  static async getHabits(): Promise<Habit[]> {
    try {
      const habits = await localforage.getItem<Habit[]>(HABITS_KEY)
      if (!habits) return []

      // Convert date strings back to Date objects
      return habits.map(habit => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        lastCompleted: habit.lastCompleted ? new Date(habit.lastCompleted) : undefined,
        completedDates: habit.completedDates.map(date => new Date(date)),
        skippedDates: (habit as any).skippedDates ? (habit as any).skippedDates.map((d: any) => new Date(d)) : []
      }))
    } catch (error) {
      console.error('Error loading habits:', error)
      return []
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await localforage.setItem(HABITS_KEY, habits)
    } catch (error) {
      console.error('Error saving habits:', error)
      throw error
    }
  }

  static async addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>): Promise<Habit> {
    const habits = await this.getHabits()
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      streak: 0,
      completedDates: [],
      archived: false,
      skippedDates: []
    }

    habits.push(newHabit)
    await this.saveHabits(habits)
    return newHabit
  }

  static async toggleHabitCompletion(habitId: string, date: Date): Promise<Habit | null> {
    const habits = await this.getHabits()
    const habitIndex = habits.findIndex(h => h.id === habitId)

    if (habitIndex === -1) return null

    const habit = habits[habitIndex]
    const existingIndex = habit.completedDates.findIndex(d => isSameDay(d, date))

    if (existingIndex >= 0) {
      // Remove completion
      habit.completedDates.splice(existingIndex, 1)
    } else {
      // Add completion
      habit.completedDates.push(date)
      habit.lastCompleted = date
    }

    // Recalculate streak
    habit.streak = this.calculateStreak(habit.completedDates)

    await this.saveHabits(habits)
    return habit
  }

  // Log an occurrence without toggling (supports multiple times per day)
  static async logHabitOccurrence(habitId: string, date: Date): Promise<Habit | null> {
    const habits = await this.getHabits()
    const habitIndex = habits.findIndex(h => h.id === habitId)
    if (habitIndex === -1) return null

    const habit = habits[habitIndex]
    habit.completedDates.push(date)
    habit.lastCompleted = date
    habit.streak = this.calculateStreak(habit.completedDates)

    await this.saveHabits(habits)
    return habit
  }

  static async removeHabitOccurrence(habitId: string, date: Date): Promise<Habit | null> {
    const habits = await this.getHabits()
    const habitIndex = habits.findIndex(h => h.id === habitId)
    if (habitIndex === -1) return null

    const habit = habits[habitIndex]
    // Remove the last occurrence matching the same day
    for (let i = habit.completedDates.length - 1; i >= 0; i--) {
      if (isSameDay(habit.completedDates[i], date)) {
        habit.completedDates.splice(i, 1)
        break
      }
    }
    // Update streak (lastCompleted may change but we keep it if still exists today)
    habit.streak = this.calculateStreak(habit.completedDates)
    if (!habit.completedDates.some(d => isSameDay(d, habit.lastCompleted ?? new Date(0)))) {
      // Reset lastCompleted to most recent date if any
      habit.lastCompleted = habit.completedDates.length
        ? habit.completedDates.reduce((a, b) => (a > b ? a : b))
        : undefined
    }

    await this.saveHabits(habits)
    return habit
  }

  static async skipHabitDate(habitId: string, date: Date): Promise<Habit | null> {
    const habits = await this.getHabits()
    const idx = habits.findIndex(h => h.id === habitId)
    if (idx === -1) return null
    const habit = habits[idx]
    habit.skippedDates = habit.skippedDates ?? []
    if (!habit.skippedDates.some(d => isSameDay(d, date))) {
      habit.skippedDates.push(date)
    }
    await this.saveHabits(habits)
    return habit
  }

  static async setArchived(habitId: string, archived: boolean): Promise<Habit | null> {
    const habits = await this.getHabits()
    const idx = habits.findIndex(h => h.id === habitId)
    if (idx === -1) return null
    habits[idx].archived = archived
    await this.saveHabits(habits)
    return habits[idx]
  }

  static calculateStreak(completedDates: Date[]): number {
    if (completedDates.length === 0) return 0

    const today = startOfDay(new Date())
    const daySet = toDayKeySet(completedDates)

    // If neither today nor yesterday completed, streak is 0
    const todayKey = toDayKey(today)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = toDayKey(yesterday)

    const anchor = daySet.has(todayKey) ? today : (daySet.has(yesterdayKey) ? yesterday : null)
    if (!anchor) return 0

    // Count back consecutive days from anchor
    let streak = 0
    const cursor = new Date(anchor)
    while (daySet.has(toDayKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }

  static async deleteHabit(habitId: string): Promise<boolean> {
    const habits = await this.getHabits()
    const filteredHabits = habits.filter(h => h.id !== habitId)

    if (filteredHabits.length === habits.length) return false

    await this.saveHabits(filteredHabits)
    return true
  }

  static async clearAllData(): Promise<void> {
    await localforage.clear()
  }

  static async updateHabit(habitId: string, patch: Partial<Pick<Habit, 'name' | 'description' | 'icon'>>): Promise<Habit | null> {
    const habits = await this.getHabits()
    const idx = habits.findIndex(h => h.id === habitId)
    if (idx === -1) return null
    const updated: Habit = { ...habits[idx], ...patch }
    habits[idx] = updated
    await this.saveHabits(habits)
    return updated
  }

  static calculateBestStreak(completedDates: Date[]): number {
    if (completedDates.length === 0) return 0
    const daySet = toDayKeySet(completedDates)
    // Sort unique days
    const days = Array.from(daySet.values())
    days.sort()
    let best = 0
    let curr = 0
    let prev: Date | null = null
    for (const key of days) {
      const [y, m, d] = key.split('-').map(Number)
      const dt = new Date(y, m - 1, d)
      if (!prev) {
        curr = 1
      } else {
        const tmp = new Date(prev)
        tmp.setDate(tmp.getDate() + 1)
        if (toDayKey(tmp) === key) curr += 1
        else curr = 1
      }
      if (curr > best) best = curr
      prev = dt
    }
    return best
  }

  static completionRate30d(completedDates: Date[]): number {
    const today = startOfDay(new Date())
    const daySet = toDayKeySet(completedDates)
    let hits = 0
    const d = new Date(today)
    for (let i = 0; i < 30; i++) {
      if (daySet.has(toDayKey(d))) hits += 1
      d.setDate(d.getDate() - 1)
    }
    return Math.round((hits / 30) * 100)
  }
}

import localforage from 'localforage'
import { isSameDay, toDayKey, toDayKeySet, startOfDay } from '../utils/date'

export interface Habit {
  id: string
  name: string
  description?: string
  createdAt: Date
  streak: number
  lastCompleted?: Date
  completedDates: Date[]
}

// Configure localForage
localforage.config({
  name: 'HabitHarbor',
  storeName: 'habits'
})

const HABITS_KEY = 'user_habits'

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
        completedDates: habit.completedDates.map(date => new Date(date))
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
      completedDates: []
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
}

import localforage from 'localforage'

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
    const dateStr = date.toDateString()
    const existingIndex = habit.completedDates.findIndex(d => d.toDateString() === dateStr)

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

    // Sort dates in descending order (most recent first)
    const sortedDates = completedDates
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if today is completed
    const todayCompleted = sortedDates.some(d => d.toDateString() === today.toDateString())

    if (!todayCompleted) {
      // If today is not completed, check yesterday
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayCompleted = sortedDates.some(d => d.toDateString() === yesterday.toDateString())

      if (!yesterdayCompleted) return 0
    }

    // Count consecutive days
    const startDate = new Date(today)
    if (!todayCompleted) {
      startDate.setDate(startDate.getDate() - 1)
    }

    let streakCount = 0
    const currentDate = new Date(startDate)

    while (true) {
      const dateStr = currentDate.toDateString()
      const isCompleted = sortedDates.some(d => d.toDateString() === dateStr)

      if (isCompleted) {
        streakCount++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streakCount
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

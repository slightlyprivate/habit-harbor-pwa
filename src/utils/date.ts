export const startOfDay = (input: Date | string | number): Date => {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

export const isSameDay = (a: Date | string | number, b: Date | string | number): boolean => {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export const toDayKey = (input: Date | string | number): string => {
  const d = startOfDay(input)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const includesDay = (dates: Array<Date | string | number>, day: Date | string | number): boolean => {
  const target = startOfDay(day).getTime()
  return dates.some(d => startOfDay(d).getTime() === target)
}

export const toDayKeySet = (dates: Array<Date | string | number>): Set<string> => {
  return new Set(dates.map(toDayKey))
}


import {
  format, parseISO, addDays, addWeeks, addMonths,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  isPast, isBefore, isAfter, getDay,
  parse as dateFnsParse,
  startOfDay, endOfDay
} from 'date-fns'

export {
  format, parseISO, addDays, addWeeks, addMonths,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  isPast, isBefore, isAfter, getDay,
  startOfDay, endOfDay
}

export const toDateString = (date: Date): string => format(date, 'yyyy-MM-dd')
export const fromDateString = (s: string): Date => parseISO(s)

export function parseNaturalDate(text: string, base: Date = new Date()): Date | null {
  const t = text.toLowerCase().trim()
  const today = startOfDay(base)

  if (t === 'today') return today
  if (t === 'tomorrow') return addDays(today, 1)
  if (t === 'yesterday') return addDays(today, -1)
  if (t === 'next week') return addDays(today, 7)
  if (t === 'this weekend') {
    const day = getDay(today)
    return addDays(today, 6 - day)
  }

  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  for (let i = 0; i < dayNames.length; i++) {
    if (t === `next ${dayNames[i]}`) {
      const current = getDay(today)
      const diff = (i - current + 7) % 7 || 7
      return addDays(today, diff)
    }
    if (t === `this ${dayNames[i]}`) {
      const current = getDay(today)
      const diff = (i - current + 7) % 7
      return addDays(today, diff)
    }
  }

  const inNDays = t.match(/^in (\d+) days?$/)
  if (inNDays) return addDays(today, parseInt(inNDays[1]))

  const inNWeeks = t.match(/^in (\d+) weeks?$/)
  if (inNWeeks) return addWeeks(today, parseInt(inNWeeks[1]))

  try {
    const fmts = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MMMM d', 'MMM d']
    for (const f of fmts) {
      const parsed = dateFnsParse(text, f, base)
      if (!isNaN(parsed.getTime())) return parsed
    }
  } catch { /* ignore */ }

  return null
}

export function getMonthGrid(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export function parseTimeString(t: string): { hours: number; minutes: number } | null {
  const match = t.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
  if (!match) return null
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2] || '0')
  const meridian = match[3]?.toLowerCase()
  if (meridian === 'pm' && hours !== 12) hours += 12
  if (meridian === 'am' && hours === 12) hours = 0
  return { hours, minutes }
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const meridian = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 || 12
  return `${displayH}:${m.toString().padStart(2, '0')} ${meridian}`
}

export function extractTimeFromText(text: string): string | undefined {
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  if (timeMatch) {
    const parsed = parseTimeString(timeMatch[0])
    if (parsed) {
      return `${parsed.hours.toString().padStart(2,'0')}:${parsed.minutes.toString().padStart(2,'0')}`
    }
  }
  const lower = text.toLowerCase()
  if (lower.includes('morning')) return '08:00'
  if (lower.includes('evening')) return '18:00'
  if (lower.includes('night')) return '21:00'
  if (lower.includes('noon') || lower.includes('lunch')) return '12:00'
  return undefined
}
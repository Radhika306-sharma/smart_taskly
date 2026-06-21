import {
  addDays, addWeeks, addMonths,
  parseISO, format, isBefore, getDay
} from 'date-fns'
import { v4 as uuid } from 'uuid'
import { Task, RecurringRule } from '../types'

function skipToWeekday(date: Date): Date {
  let d = date
  while ([0, 6].includes(getDay(d))) d = addDays(d, 1)
  return d
}

export function generateRecurringInstances(
  baseTask: Task,
  rule: RecurringRule,
  rangeEnd: Date
): Task[] {
  const instances: Task[] = []
  let current = parseISO(baseTask.date)
  const maxInstances = 365

  // For weekdays, ensure the start day is itself a weekday before first advance
  if (rule.type === 'weekdays') {
    current = skipToWeekday(current)
  }

  let count = 0
  while (isBefore(current, rangeEnd) && count < maxInstances) {
    const dateStr = format(current, 'yyyy-MM-dd')

    // Skip the base task's own date
    if (dateStr !== baseTask.date) {
      instances.push({
        ...baseTask,
        id: uuid(),
        date: dateStr,
        parentId: baseTask.id,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    switch (rule.type) {
      case 'daily':
        current = addDays(current, 1)
        break
      case 'weekdays':
        current = addDays(current, 1)
        while ([0, 6].includes(getDay(current))) current = addDays(current, 1)
        break
      case 'weekly':
        current = addWeeks(current, 1)
        break
      case 'monthly':
        current = addMonths(current, 1)
        break
      case 'custom':
        current = addDays(current, rule.interval ?? 1)
        break
      default:
        return instances
    }
    count++
  }
  return instances
}
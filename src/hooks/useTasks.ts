import { useState, useCallback, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { Task, RecurringRule, FilterState } from '../types'
import { storage } from '../utils/storage'
import { generateRecurringInstances } from '../utils/recurringUtils'
import { addDays, format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks())

  useEffect(() => { storage.setTasks(tasks) }, [tasks])

  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const base: Task = { ...data, id: uuid(), createdAt: now, updatedAt: now }
    const newTasks: Task[] = [base]

    if (data.recurring && data.recurring.type !== 'none') {
      const rangeEnd = data.recurring.endDate
        ? parseISO(data.recurring.endDate)
        : addDays(new Date(), 90)
      const instances = generateRecurringInstances(base, data.recurring, rangeEnd)
      newTasks.push(...instances)
    }

    setTasks(prev => [...prev, ...newTasks])
    return base
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id && t.parentId !== id))
  }, [])

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    ))
  }, [])

  const moveTask = useCallback((id: string, newDate: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, date: newDate, updatedAt: new Date().toISOString() } : t
    ))
  }, [])

  const getTasksForDate = useCallback((date: string) =>
    tasks.filter(t => t.date === date)
  , [tasks])

  const getFilteredTasks = useCallback((filter: FilterState) => {
    return tasks.filter(t => {
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase()) &&
          !t.category.toLowerCase().includes(filter.search.toLowerCase())) return false
      if (filter.category && filter.category !== 'all' && t.category !== filter.category) return false
      if (filter.priority && filter.priority !== 'all' && t.priority !== filter.priority) return false
      if (filter.status === 'completed' && !t.completed) return false
      if (filter.status === 'pending' && t.completed) return false
      return true
    })
  }, [tasks])

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const in7 = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  const todayTasks = tasks.filter(t => t.date === today)
  const tomorrowTasks = tasks.filter(t => t.date === tomorrow)
  const upcomingTasks = tasks.filter(t => t.date > today && t.date <= in7)
  const overdueTasks = tasks.filter(t =>
    t.date < today && !t.completed
  )
  const completedTasks = tasks.filter(t => t.completed)

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    moveTask,
    getTasksForDate,
    getFilteredTasks,
    todayTasks,
    tomorrowTasks,
    upcomingTasks,
    overdueTasks,
    completedTasks,
  }
}

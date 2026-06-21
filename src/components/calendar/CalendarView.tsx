import React from 'react'
import { Task, CalendarView as ViewType } from '../../types'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'

interface Props {
  currentDate: Date
  view: ViewType
  getTasksForDate: (date: string) => Task[]
  filteredTasks: Task[]
  toggleComplete: (id: string) => void
  moveTask: (id: string, date: string) => void
  onDayClick: (date: string) => void
  onTaskClick: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export default function CalendarView({
  currentDate, view, getTasksForDate, filteredTasks,
  toggleComplete, moveTask, onDayClick, onTaskClick, onDeleteTask
}: Props) {
  const shared = { filteredTasks, toggleComplete, moveTask, onDayClick, onTaskClick, onDeleteTask, currentDate }

  if (view === 'month') return <MonthView {...shared} getTasksForDate={getTasksForDate} />
  if (view === 'week') return <WeekView {...shared} />
  return <DayView {...shared} getTasksForDate={getTasksForDate} />
}
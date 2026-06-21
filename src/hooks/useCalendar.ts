import { useState, useCallback } from 'react'
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns'
import { CalendarView } from '../types'

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')

  const goNext = useCallback(() => {
    setCurrentDate(d =>
      view === 'month' ? addMonths(d, 1) :
      view === 'week' ? addWeeks(d, 1) :
      addDays(d, 1)
    )
  }, [view])

  const goPrev = useCallback(() => {
    setCurrentDate(d =>
      view === 'month' ? subMonths(d, 1) :
      view === 'week' ? subWeeks(d, 1) :
      subDays(d, 1)
    )
  }, [view])

  const goToday = useCallback(() => setCurrentDate(new Date()), [])

  const goToDate = useCallback((date: Date) => setCurrentDate(date), [])

  return { currentDate, view, setView, goNext, goPrev, goToday, goToDate }
}
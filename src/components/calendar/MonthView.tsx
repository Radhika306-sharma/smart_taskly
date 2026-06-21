import React from 'react'
import { format, isSameMonth, isToday } from 'date-fns'
import { getMonthGrid, toDateString } from '../../utils/dateUtils'
import { Task } from '../../types'
import TaskChip from './TaskChip'

interface Props {
  currentDate: Date
  getTasksForDate: (date: string) => Task[]
  filteredTasks: Task[]
  toggleComplete: (id: string) => void
  moveTask: (id: string, date: string) => void
  onDayClick: (date: string) => void
  onTaskClick: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export default function MonthView({
  currentDate, filteredTasks,
  toggleComplete, moveTask, onDayClick, onTaskClick, onDeleteTask
}: Props) {
  const days = getMonthGrid(currentDate)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only remove class when leaving the cell itself, not a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      e.currentTarget.classList.remove('drag-over')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dateStr: string) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const id = e.dataTransfer.getData('taskId')
    if (id) moveTask(id, dateStr)
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 gap-px bg-gray-800/30 rounded-xl overflow-hidden">
        {days.map(day => {
          const dateStr = toDateString(day)
          const dayTasks = filteredTasks.filter(t => t.date === dateStr)
          const inMonth = isSameMonth(day, currentDate)
          const todayFlag = isToday(day)
          const MAX_VISIBLE = 3

          return (
            <div
              key={dateStr}
              className={`
                min-h-0 p-1.5 flex flex-col gap-1 transition-colors duration-150
                ${inMonth ? 'bg-[#161b22]' : 'bg-[#0d1117]'}
                hover:bg-gray-800/40 cursor-pointer
              `}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, dateStr)}
              onClick={() => onDayClick(dateStr)}
            >
              <div className={`
                text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0
                ${todayFlag ? 'bg-indigo-600 text-white' : inMonth ? 'text-gray-300' : 'text-gray-600'}
              `}>
                {format(day, 'd')}
              </div>

              <div className="flex-1 min-h-0 overflow-hidden space-y-0.5">
                {dayTasks.slice(0, MAX_VISIBLE).map(task => (
                  <TaskChip
                    key={task.id}
                    task={task}
                    onToggle={toggleComplete}
                    onClick={onTaskClick}
                    onDelete={onDeleteTask}
                    compact
                  />
                ))}
                {dayTasks.length > MAX_VISIBLE && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayTasks.length - MAX_VISIBLE} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
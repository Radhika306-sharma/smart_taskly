import React from 'react'
import { format, isToday } from 'date-fns'
import { getWeekDays, toDateString } from '../../utils/dateUtils'
import { Task } from '../../types'
import TaskChip from './TaskChip'

interface Props {
  currentDate: Date
  filteredTasks: Task[]
  toggleComplete: (id: string) => void
  moveTask: (id: string, date: string) => void
  onDayClick: (date: string) => void
  onTaskClick: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export default function WeekView({
  currentDate, filteredTasks,
  toggleComplete, moveTask, onDayClick, onTaskClick, onDeleteTask
}: Props) {
  const days = getWeekDays(currentDate)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
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
    <div className="h-full grid grid-cols-7 gap-2">
      {days.map(day => {
        const dateStr = toDateString(day)
        const dayTasks = filteredTasks.filter(t => t.date === dateStr)
        const todayFlag = isToday(day)

        return (
          <div
            key={dateStr}
            className={`
              flex flex-col rounded-xl overflow-hidden border transition-colors
              ${todayFlag ? 'border-indigo-500/50' : 'border-gray-800/50'}
              bg-[#161b22] hover:bg-[#1c2128]
            `}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, dateStr)}
          >
            <div
              className={`px-3 py-2 text-center cursor-pointer hover:bg-gray-700/30 transition-colors flex-shrink-0 ${
                todayFlag ? 'bg-indigo-900/30' : ''
              }`}
              onClick={() => onDayClick(dateStr)}
            >
              <p className="text-xs text-gray-500 font-medium">{format(day, 'EEE')}</p>
              <p className={`text-lg font-bold ${todayFlag ? 'text-indigo-400' : 'text-white'}`}>
                {format(day, 'd')}
              </p>
            </div>

            <div className="flex-1 p-2 space-y-1.5 overflow-y-auto min-h-0">
              {dayTasks.map(task => (
                <TaskChip
                  key={task.id}
                  task={task}
                  onToggle={toggleComplete}
                  onClick={onTaskClick}
                  onDelete={onDeleteTask}
                />
              ))}
              {dayTasks.length === 0 && (
                <p className="text-xs text-gray-700 text-center py-4">—</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
import React from 'react'
import { format, isToday } from 'date-fns'
import { toDateString, formatTime } from '../../utils/dateUtils'
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

export default function DayView({
  currentDate, filteredTasks,
  toggleComplete, onDayClick, onTaskClick, onDeleteTask
}: Props) {
  const dateStr = toDateString(currentDate)
  const dayTasks = filteredTasks.filter(t => t.date === dateStr)
  const timedTasks = dayTasks.filter(t => t.time).sort((a, b) =>
    (a.time! > b.time! ? 1 : -1)
  )
  const untimedTasks = dayTasks.filter(t => !t.time)

  return (
    <div className="max-w-2xl mx-auto h-full">
      <div className="glass rounded-2xl p-6 h-full flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <h2 className={`text-3xl font-bold ${isToday(currentDate) ? 'gradient-text' : 'text-white'}`}>
            {format(currentDate, 'EEEE')}
          </h2>
          <p className="text-gray-500">{format(currentDate, 'MMMM d, yyyy')}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {timedTasks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Scheduled
              </h3>
              <div className="space-y-2">
                {timedTasks.map(task => (
                  <div key={task.id} className="flex gap-3 items-start">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0 pt-2">
                      {formatTime(task.time!)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <TaskChip
                        task={task}
                        onToggle={toggleComplete}
                        onClick={onTaskClick}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {untimedTasks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Anytime
              </h3>
              <div className="space-y-2">
                {untimedTasks.map(task => (
                  <TaskChip
                    key={task.id}
                    task={task}
                    onToggle={toggleComplete}
                    onClick={onTaskClick}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </section>
          )}

          {dayTasks.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">No tasks for this day.</p>
              <button
                onClick={() => onDayClick(dateStr)}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add a task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { Task } from '../../types'
import { CheckCircle2, Circle, Trash2, RefreshCw } from 'lucide-react'
import { formatTime } from '../../utils/dateUtils'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onClick: (task: Task) => void
  onDelete: (id: string) => void
  compact?: boolean
}

const priorityBorderColor: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#22c55e',
}

export default function TaskChip({ task, onToggle, onClick, onDelete, compact }: Props) {
  const isRecurring = task.recurring?.type && task.recurring.type !== 'none'

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id)
        e.dataTransfer.effectAllowed = 'move'
        // Use setTimeout so opacity change doesn't cancel the drag ghost
        const el = e.currentTarget as HTMLDivElement
        setTimeout(() => { el.style.opacity = '0.4' }, 0)
      }}
      onDragEnd={e => {
        ;(e.currentTarget as HTMLDivElement).style.opacity = '1'
      }}
      className={`
        task-chip group flex items-center gap-1.5 px-2 py-1 rounded-md
        border-l-2
        ${task.completed ? 'completed opacity-50' : ''}
        glass-light hover:bg-gray-700/60 transition-all
        text-xs select-none
      `}
      style={{ borderLeftColor: task.color || priorityBorderColor[task.priority] }}
      onClick={e => { e.stopPropagation(); onClick(task) }}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle(task.id) }}
        className="flex-shrink-0 text-gray-400 hover:text-indigo-400 transition-colors"
      >
        {task.completed
          ? <CheckCircle2 size={12} className="text-indigo-500" />
          : <Circle size={12} />
        }
      </button>

      <span className={`task-title flex-1 truncate font-medium ${
        task.completed ? 'line-through text-gray-500' : 'text-gray-200'
      }`}>
        {task.title}
      </span>

      {task.time && !compact && (
        <span className="text-gray-500 text-xs hidden sm:block flex-shrink-0">
          {formatTime(task.time)}
        </span>
      )}

      {isRecurring && (
        <RefreshCw size={10} className="text-gray-500 flex-shrink-0" />
      )}

      <button
        onClick={e => { e.stopPropagation(); onDelete(task.id) }}
        className="flex-shrink-0 text-transparent group-hover:text-gray-500 hover:!text-red-400 transition-colors"
      >
        <Trash2 size={10} />
      </button>
    </div>
  )
}
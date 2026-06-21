import React from 'react'
import { Task } from '../../types'
import { CheckCircle2, Circle, Clock, Tag } from 'lucide-react'
import { formatTime } from '../../utils/dateUtils'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onClick: (task: Task) => void
}

export default function TaskCard({ task, onToggle, onClick }: Props) {
  const priorityColor =
    task.priority === 'high' ? 'text-red-400' :
    task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div
      className="glass-light rounded-xl p-4 cursor-pointer hover:bg-gray-700/40 transition-all fade-in-up"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={e => { e.stopPropagation(); onToggle(task.id) }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.completed
            ? <CheckCircle2 size={18} className="text-indigo-500" />
            : <Circle size={18} className="text-gray-500 hover:text-indigo-400 transition-colors" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {task.time && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={11} />{formatTime(task.time)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Tag size={11} />{task.category}
            </span>
            <span className={`text-xs font-medium ${priorityColor}`}>
              {task.priority}
            </span>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: task.color }} />
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Task, CalendarView } from '../../types'
import {
  CheckCircle2, Circle, AlertTriangle, Clock,
  Calendar, ChevronDown, ChevronRight
} from 'lucide-react'
import { formatTime } from '../../utils/dateUtils'

interface SidebarSection {
  key: string
  label: string
  tasks: Task[]
  icon: React.ReactNode
  accent: string
}

interface Props {
  todayTasks: Task[]
  tomorrowTasks: Task[]
  upcomingTasks: Task[]
  overdueTasks: Task[]
  completedTasks: Task[]
  onTaskClick: (t: Task) => void
  onToggle: (id: string) => void
  goToDate: (d: Date) => void
  setView: (v: CalendarView) => void
}

export default function Sidebar({
  todayTasks, tomorrowTasks, upcomingTasks, overdueTasks, completedTasks,
  onTaskClick, onToggle, goToDate, setView
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    today: true, tomorrow: true, upcoming: false, overdue: true, completed: false
  })

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }))

  const sections: SidebarSection[] = [
    { key: 'today',    label: 'Today',       tasks: todayTasks,     icon: <Calendar size={14} />,      accent: 'text-indigo-400' },
    { key: 'tomorrow', label: 'Tomorrow',    tasks: tomorrowTasks,  icon: <Clock size={14} />,         accent: 'text-blue-400'   },
    { key: 'upcoming', label: 'Next 7 Days', tasks: upcomingTasks,  icon: <Calendar size={14} />,      accent: 'text-green-400'  },
    { key: 'overdue',  label: 'Overdue',     tasks: overdueTasks,   icon: <AlertTriangle size={14} />, accent: 'text-red-400'    },
    { key: 'completed',label: 'Completed',   tasks: completedTasks, icon: <CheckCircle2 size={14} />,  accent: 'text-gray-500'   },
  ]

  const priorityDot = (p: string) =>
    p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-yellow-500' : 'bg-green-500'

  const handleTaskClick = (task: Task) => {
    goToDate(parseISO(task.date))
    setView('day')
    onTaskClick(task)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0d1117]">
      <div className="p-4 border-b border-gray-800/50 flex-shrink-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sections.map(sec => (
          <div key={sec.key} className="rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(sec.key)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <span className={sec.accent}>{sec.icon}</span>
              <span className="text-xs font-semibold text-gray-300 flex-1 text-left">{sec.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                sec.key === 'overdue' && sec.tasks.length > 0
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-gray-800 text-gray-400'
              }`}>{sec.tasks.length}</span>
              {expanded[sec.key]
                ? <ChevronDown size={12} className="text-gray-500" />
                : <ChevronRight size={12} className="text-gray-500" />
              }
            </button>

            {expanded[sec.key] && (
              <div className="px-2 pb-2 space-y-1 fade-in-up">
                {sec.tasks.length === 0 && (
                  <p className="text-xs text-gray-600 px-3 py-2">No tasks</p>
                )}
                {sec.tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-gray-800/40 cursor-pointer transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); onToggle(task.id) }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {task.completed
                        ? <CheckCircle2 size={14} className="text-indigo-500" />
                        : <Circle size={14} className="text-gray-600 hover:text-indigo-400 transition-colors" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot(task.priority)}`} />
                        <span className="text-xs text-gray-600 truncate">{task.category}</span>
                        {task.time && (
                          <span className="text-xs text-gray-600 flex-shrink-0">{formatTime(task.time)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
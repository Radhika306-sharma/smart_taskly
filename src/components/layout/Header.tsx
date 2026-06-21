import React from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Menu, Bot, Plus, CalendarDays } from 'lucide-react'
import { CalendarView } from '../../types'

interface Props {
  currentDate: Date
  view: CalendarView
  setView: (v: CalendarView) => void
  goNext: () => void
  goPrev: () => void
  goToday: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onAIToggle: () => void
  aiOpen: boolean
  onAddTask: () => void
}

export default function Header({
  currentDate, view, setView, goNext, goPrev, goToday,
  sidebarOpen: _sidebarOpen, onToggleSidebar, onAIToggle, aiOpen, onAddTask
}: Props) {
  const title =
    view === 'month' ? format(currentDate, 'MMMM yyyy') :
    view === 'week' ? `Week of ${format(currentDate, 'MMM d, yyyy')}` :
    format(currentDate, 'EEEE, MMMM d, yyyy')

  return (
    <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/50 glass flex-shrink-0 min-w-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white flex-shrink-0"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-1.5 mr-1 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <CalendarDays size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm gradient-text hidden md:block">AI Calendar</span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
          <ChevronLeft size={16} />
        </button>
        <button onClick={goToday} className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600">
          Today
        </button>
        <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
          <ChevronRight size={16} />
        </button>
      </div>

      <h2 className="font-semibold text-white text-sm flex-1 truncate min-w-0 hidden sm:block">{title}</h2>

      <div className="flex items-center bg-gray-800/60 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
        {(['month', 'week', 'day'] as CalendarView[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
              view === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <button
        onClick={onAddTask}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition-colors text-white flex-shrink-0"
      >
        <Plus size={14} />
        <span className="hidden sm:block">Add Task</span>
      </button>

      <button
        onClick={onAIToggle}
        className={`p-2 rounded-lg transition-all flex-shrink-0 ${
          aiOpen ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-white'
        }`}
        title="AI Assistant"
      >
        <Bot size={18} />
      </button>
    </header>
  )
}
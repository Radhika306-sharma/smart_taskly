import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import CalendarView from '../calendar/CalendarView'
import AIAssistant from '../ai/AIAssistant'
import TaskModal from '../tasks/TaskModal'
import SearchFilter from '../tasks/SearchFilter'
import { useTasks } from '../../hooks/useTasks'
import { useCalendar } from '../../hooks/useCalendar'
import { useAI } from '../../hooks/useAI'
import { Task, FilterState } from '../../types'
import { format } from 'date-fns'

export default function AppLayout(){
  const taskHook = useTasks()
  const calHook = useCalendar()
  const aiHook = useAI({
    addTask: taskHook.addTask,
    updateTask: taskHook.updateTask,
    deleteTask: taskHook.deleteTask,
    moveTask: taskHook.moveTask,
  },taskHook.tasks
)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiOpen, setAiOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [defaultDate, setDefaultDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [filter, setFilter] = useState<FilterState>({
    search: '', category: 'all', priority: 'all', status: 'all'
  })
  const handleDayClick = (date: string) => {
    setDefaultDate(date)
    setEditingTask(undefined)
    setModalOpen(true)
  }
  const handleAddTask = () => {
    setDefaultDate(format(new Date(), 'yyyy-MM-dd'))
    setEditingTask(undefined)
    setModalOpen(true)
  }
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }
  const handleSaveTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      taskHook.updateTask(editingTask.id, data)
    } else {
      taskHook.addTask(data)
    }
    setModalOpen(false)
    setEditingTask(undefined)
  }
  const handleDeleteTask = () => {
    if (editingTask) {
      taskHook.deleteTask(editingTask.id)
      setModalOpen(false)
      setEditingTask(undefined)
    }
  }
  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTask(undefined)
  }
  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1117] text-gray-100">
      {/* Sidebar */}
      <aside
        className={`
          flex-shrink-0 transition-all duration-300 overflow-hidden
          border-r border-gray-800/50
          ${sidebarOpen ? 'w-72' : 'w-0'}
        `}
      >
        {sidebarOpen && (
          <Sidebar
            todayTasks={taskHook.todayTasks}
            tomorrowTasks={taskHook.tomorrowTasks}
            upcomingTasks={taskHook.upcomingTasks}
            overdueTasks={taskHook.overdueTasks}
            completedTasks={taskHook.completedTasks}
            onTaskClick={handleEditTask}
            onToggle={taskHook.toggleComplete}
            goToDate={calHook.goToDate}
            setView={calHook.setView}
          />
        )}
      </aside>
      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          currentDate={calHook.currentDate}
          view={calHook.view}
          setView={calHook.setView}
          goNext={calHook.goNext}
          goPrev={calHook.goPrev}
          goToday={calHook.goToday}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onAIToggle={() => setAiOpen(v => !v)}
          aiOpen={aiOpen}
          onAddTask={handleAddTask}
        />
        <SearchFilter filter={filter} setFilter={setFilter} />
        <main className="flex-1 overflow-auto p-3">
          <CalendarView
            currentDate={calHook.currentDate}
            view={calHook.view}
            getTasksForDate={taskHook.getTasksForDate}
            filteredTasks={taskHook.getFilteredTasks(filter)}
            toggleComplete={taskHook.toggleComplete}
            moveTask={taskHook.moveTask}
            onDayClick={handleDayClick}
            onTaskClick={handleEditTask}
            onDeleteTask={taskHook.deleteTask}
          />
        </main>
      </div>
      {/* AI Panel */}
      {aiOpen && (
        <aside className="w-96 flex-shrink-0 border-l border-gray-800/50 overflow-hidden">
          <AIAssistant
            messages={aiHook.messages}
            sendMessage={aiHook.sendMessage}
            loading={aiHook.loading}
            onClose={() => setAiOpen(false)}
          />
        </aside>
      )}
      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultDate={defaultDate}
          onSave={handleSaveTask}
          onDelete={editingTask ? handleDeleteTask : undefined}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
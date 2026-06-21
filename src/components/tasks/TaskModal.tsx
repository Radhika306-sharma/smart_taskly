import React, { useState } from 'react'
import { Task, Priority, RecurringType } from '../../types'
import { storage } from '../../utils/storage'
import { X, Trash2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  task?: Task
  defaultDate: string
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: () => void
  onClose: () => void
}

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6']

export default function TaskModal({ task, defaultDate, onSave, onDelete, onClose }: Props) {
  const categories = storage.getCategories()

  const [title, setTitle]               = useState(task?.title ?? '')
  const [description, setDescription]   = useState(task?.description ?? '')
  const [date, setDate]                 = useState(task?.date ?? defaultDate)
  const [time, setTime]                 = useState(task?.time ?? '')
  const [priority, setPriority]         = useState<Priority>(task?.priority ?? 'medium')
  const [category, setCategory]         = useState(task?.category ?? (categories[0]?.name || 'Personal'))
  const [color, setColor]               = useState(task?.color ?? '#6366f1')
  const [recurringType, setRecurringType]     = useState<RecurringType>(task?.recurring?.type ?? 'none')
  const [recurringInterval, setRecurringInterval] = useState(task?.recurring?.interval ?? 2)
  const [recurringEnd, setRecurringEnd]       = useState(task?.recurring?.endDate ?? '')

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      priority,
      category,
      color,
      completed: task?.completed ?? false,
      recurring: recurringType !== 'none'
        ? {
            type: recurringType,
            interval: recurringType === 'custom' ? recurringInterval : undefined,
            endDate: recurringEnd || undefined,
          }
        : { type: 'none' },
    })
  }

  const priorityStyles: Record<Priority, string> = {
    low:    'border-green-500 bg-green-500/10 text-green-400',
    medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    high:   'border-red-500 bg-red-500/10 text-red-400',
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass rounded-2xl w-full max-w-md fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
          <h3 className="font-semibold text-white">{task ? 'Edit Task' : 'New Task'}</h3>
          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Task title..."
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
          />

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Time (optional)</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    priority === p ? priorityStyles[p] : 'border-gray-700 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Color Label</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <RefreshCw size={11} /> Recurring
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {(['none','daily','weekdays','weekly','monthly','custom'] as RecurringType[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurringType(r)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    recurringType === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {recurringType === 'custom' && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">Every</span>
                <input
                  type="number"
                  min={1}
                  value={recurringInterval}
                  onChange={e => setRecurringInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm text-white text-center"
                />
                <span className="text-xs text-gray-500">days</span>
              </div>
            )}

            {recurringType !== 'none' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End date (optional)</label>
                <input
                  type="date"
                  value={recurringEnd}
                  onChange={e => setRecurringEnd(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm [color-scheme:dark]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
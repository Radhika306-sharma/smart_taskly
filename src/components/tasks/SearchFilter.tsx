import React, { useMemo } from 'react'
import { Search } from 'lucide-react'
import { FilterState, Priority } from '../../types'
import { storage } from '../../utils/storage'

interface Props {
  filter: FilterState
  setFilter: (f: FilterState) => void
}

export default function SearchFilter({ filter, setFilter }: Props) {
  const categories = useMemo(() => storage.getCategories(), [])

  const set = (key: keyof FilterState, value: string) =>
    setFilter({ ...filter, [key]: value })

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800/50 bg-[#0d1117]/80 flex-wrap">
      <div className="relative flex-1 min-w-[140px] max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filter.search}
          onChange={e => set('search', e.target.value)}
          className="w-full bg-gray-800/60 border border-gray-700/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <select
        value={filter.status}
        onChange={e => set('status', e.target.value)}
        className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-2 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-indigo-500"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={filter.priority}
        onChange={e => set('priority', e.target.value as Priority | 'all')}
        className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-2 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-indigo-500"
      >
        <option value="all">Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filter.category}
        onChange={e => set('category', e.target.value)}
        className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-2 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-indigo-500"
      >
        <option value="all">Category</option>
        {categories.map(c => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
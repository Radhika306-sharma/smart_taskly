export type Priority = 'low' | 'medium' | 'high'
export type RecurringType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom'
export type CalendarView = 'month' | 'week' | 'day'

export interface RecurringRule {
  type: RecurringType
  interval?: number       // for custom: every N days
  endDate?: string        // ISO date string, optional
}

export interface Task {
  id: string
  title: string
  description?: string
  date: string            // ISO date string (YYYY-MM-DD)
  time?: string           // HH:MM
  priority: Priority
  category: string
  color: string
  completed: boolean
  recurring?: RecurringRule
  parentId?: string       // for generated recurring instances
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface AppSettings {
  geminiApiKey: string
  defaultView: CalendarView
  theme: 'dark'
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface FilterState {
  search: string
  category: string
  priority: Priority | 'all'
  status: 'all' | 'completed' | 'pending'
}
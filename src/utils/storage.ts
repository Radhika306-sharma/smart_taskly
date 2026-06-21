import { Task, Category, AppSettings } from '../types'

const KEYS = {
  TASKS: 'ai_calendar_tasks',
  CATEGORIES: 'ai_calendar_categories',
  SETTINGS: 'ai_calendar_settings',
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Personal', color: '#6366f1' },
  { id: '2', name: 'Work', color: '#f59e0b' },
  { id: '3', name: 'Study', color: '#10b981' },
  { id: '4', name: 'Health', color: '#ef4444' },
  { id: '5', name: 'Other', color: '#8b5cf6' },
]

function serialize<T>(data: T): string {
  return JSON.stringify(data)
}

function deserialize<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T }
  catch { return fallback }
}

function getEnvApiKey(): string {
  try { return (import.meta as Record<string, unknown> as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY ?? '' }
  catch { return '' }
}

export const storage = {
  getTasks: (): Task[] =>
    deserialize<Task[]>(localStorage.getItem(KEYS.TASKS), []),

  setTasks: (tasks: Task[]) =>
    localStorage.setItem(KEYS.TASKS, serialize(tasks)),

  getCategories: (): Category[] =>
    deserialize<Category[]>(localStorage.getItem(KEYS.CATEGORIES), DEFAULT_CATEGORIES),

  setCategories: (cats: Category[]) =>
    localStorage.setItem(KEYS.CATEGORIES, serialize(cats)),

  getSettings: (): AppSettings => {
    const defaults: AppSettings = {
      geminiApiKey: getEnvApiKey(),
      defaultView: 'month',
      theme: 'dark',
    }
    return deserialize<AppSettings>(localStorage.getItem(KEYS.SETTINGS), defaults)
  },

  setSettings: (s: AppSettings) =>
    localStorage.setItem(KEYS.SETTINGS, serialize(s)),
}
import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { v4 as uuid } from 'uuid'
import { AIMessage, Task, RecurringRule } from '../types'
import { storage } from '../utils/storage'
import { format } from '../utils/dateUtils'

// ─── action schema ──────────────────────────────────────────────────────────

type AIAction = 'create_task' | 'create_plan' | 'delete_task' | 'move_task' | 'update_task' | 'unknown'

interface CreateTaskPayload {
  title: string
  description?: string
  date: string          // YYYY-MM-DD
  time?: string          // HH:MM
  priority: 'low' | 'medium' | 'high'
  category: string
  color: string
  recurring?: RecurringRule
}

interface DeleteTaskPayload {
  target: string         // task title/phrase to match, e.g. "DSA"
  date?: string           // optional date hint to disambiguate (YYYY-MM-DD)
}

interface MoveTaskPayload {
  target: string
  newDate: string         // YYYY-MM-DD, resolved by Gemini from "tomorrow" / "next Friday" / "July 5"
  newTime?: string
  date?: string            // optional original-date hint to disambiguate
}

interface UpdateTaskPayload {
  target: string
  date?: string             // optional date hint to disambiguate
  changes: {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    category?: string
    color?: string
    time?: string
  }
}

interface AIResponse {
  action: AIAction
  message: string
  // exactly one of these is populated depending on `action`
  createTasks?: CreateTaskPayload[]
  deleteTask?: DeleteTaskPayload
  moveTask?: MoveTaskPayload
  updateTask?: UpdateTaskPayload
}

// ─── Gemini prompt ──────────────────────────────────────────────────────────

function buildSystemPrompt(tasks: Task[]): string {
  const today = format(new Date(), 'yyyy-MM-dd')

  // Give Gemini a compact view of existing tasks so it can resolve "DSA", "gym", etc.
  // and pick sensible date hints when several same-named tasks exist.
  const taskList = tasks
    .filter(t => !t.completed)
    .slice(0, 60) // cap context size
    .map(t => `- "${t.title}" on ${t.date}${t.time ? ` at ${t.time}` : ''} [${t.category}, ${t.priority}]`)
    .join('\n')

  return `You are an AI calendar assistant. Today is ${today}.

The user may ask you to CREATE, DELETE, MOVE, or UPDATE tasks, or CREATE A MULTI-DAY PLAN.

Here are the user's current upcoming/active tasks for reference (use these to resolve which task they mean):
${taskList || '(no tasks yet)'}

Respond ONLY with a single valid JSON object — no markdown fences, no explanation outside the JSON.

Use this exact schema:
{
  "action": "create_task" | "create_plan" | "delete_task" | "move_task" | "update_task" | "unknown",
  "message": "short friendly confirmation message to show the user",

  "createTasks": [
    {
      "title": "string",
      "description": "string (omit if none)",
      "date": "YYYY-MM-DD",
      "time": "HH:MM 24hr (omit if none)",
      "priority": "low" | "medium" | "high",
      "category": "Study" | "Work" | "Health" | "Personal" | "Other",
      "color": "#hex",
      "recurring": { "type": "none"|"daily"|"weekdays"|"weekly"|"monthly"|"custom", "interval": number_or_omit, "endDate": "YYYY-MM-DD_or_omit" }
    }
  ],

  "deleteTask": { "target": "string naming the task to delete", "date": "YYYY-MM-DD (omit if unknown)" },

  "moveTask": { "target": "string naming the task to move", "newDate": "YYYY-MM-DD", "newTime": "HH:MM (omit if unchanged)", "date": "YYYY-MM-DD (omit if unknown — original date hint)" },

  "updateTask": {
    "target": "string naming the task to update",
    "date": "YYYY-MM-DD (omit if unknown)",
    "changes": {
      "title": "string (omit if unchanged — use this for renames)",
      "description": "string (omit if unchanged)",
      "priority": "low" | "medium" | "high" (omit if unchanged),
      "category": "string (omit if unchanged)",
      "color": "#hex (omit if unchanged)",
      "time": "HH:MM (omit if unchanged)"
    }
  }
}

Rules:
- Only populate the ONE field matching "action". Omit all others entirely (do not include them as null or empty).
- For action "create_task" or "create_plan", populate "createTasks" with one or more tasks. "create_plan" means generate a multi-day series (e.g. "30-day plan") with one task per relevant day.
- For action "delete_task", populate "deleteTask" only.
- For action "move_task", populate "moveTask" only. Resolve relative dates ("tomorrow", "next Friday", "in 3 days") into an absolute "newDate".
- For action "update_task", populate "updateTask" only. Only include fields in "changes" that the user actually wants changed.
- "target" should be the shortest distinctive phrase identifying the task (e.g. "DSA", "gym", "OS assignment") — do not include the date/time/action words in it.
- If the user's request doesn't match any of these actions, use "unknown" and explain briefly in "message".
- Infer priority from context: exams/deadlines=high, regular practice=medium, casual=low.
- Return ONLY the JSON object.`
}

// ─── task resolver (fuzzy match, not regex-based NLU) ──────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function scoreMatch(taskTitle: string, target: string): number {
  const a = normalize(taskTitle)
  const b = normalize(target)
  if (!a || !b) return 0
  if (a === b) return 100
  if (a.includes(b) || b.includes(a)) return 80

  // token overlap score
  const aTokens = new Set(a.split(/\s+/))
  const bTokens = new Set(b.split(/\s+/))
  let overlap = 0
  bTokens.forEach(t => { if (aTokens.has(t)) overlap++ })
  if (overlap === 0) return 0
  return (overlap / Math.max(aTokens.size, bTokens.size)) * 60
}

interface ResolveResult {
  task: Task | null
  ambiguous: Task[]
}

function resolveTarget(tasks: Task[], target: string, dateHint?: string): ResolveResult {
  const candidates = tasks
    .filter(t => !t.completed)
    .map(t => ({ task: t, score: scoreMatch(t.title, target) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)

  if (candidates.length === 0) return { task: null, ambiguous: [] }

  // If a date hint is provided, prefer exact-date matches among top scorers
  if (dateHint) {
    const dateMatches = candidates.filter(c => c.task.date === dateHint)
    if (dateMatches.length === 1) return { task: dateMatches[0].task, ambiguous: [] }
    if (dateMatches.length > 1) {
      return { task: null, ambiguous: dateMatches.map(c => c.task) }
    }
  }
  const topScore = candidates[0].score
  const top = candidates.filter(c => c.score === topScore)
  if (top.length === 1) return { task: top[0].task, ambiguous: [] }

  // Multiple equally-good matches — ambiguous, let the user disambiguate
  return { task: null, ambiguous: top.map(c => c.task) }
}

function formatAmbiguity(matches: Task[]): string {
  const lines = matches
    .slice(0, 5)
    .map(t => `• "${t.title}" on ${format(new Date(t.date + 'T00:00:00'), 'MMM d')}${t.time ? ` at ${t.time}` : ''}`)
    .join('\n')
  return `I found multiple matching tasks:\n${lines}\n\nCould you be more specific (e.g. include the date)?`
}

// ─── hook ────────────────────────────────────────────────────────────────────

interface UseTasksSubset {
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, date: string) => void
}

export function useAI(taskApi: UseTasksSubset, tasks: Task[]) {
  const [messages, setMessages] = useState<AIMessage[]>([{
    id: uuid(),
    role: 'assistant',
    content:
      "Hi! I'm your AI Calendar assistant. I can:\n" +
      "• Create tasks — \"Add DSA tomorrow at 7 PM\"\n" +
      "• Delete tasks — \"Delete the gym task\"\n" +
      "• Move tasks — \"Move DSA to tomorrow\"\n" +
      "• Update tasks — \"Change DSA priority to high\"\n" +
      "• Build plans — \"Create a 30-day placement prep plan\"",
    timestamp: new Date().toISOString(),
  }])
  const [loading, setLoading] = useState(false)

  const pushAssistantMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: uuid(), role: 'assistant', content, timestamp: new Date().toISOString()
    }])
  }, [])

  const handleParsedResponse = useCallback((parsed: AIResponse): string => {
    switch (parsed.action) {
      case 'create_task':
      case 'create_plan': {
        const list = parsed.createTasks ?? []
        for (const t of list) {
          taskApi.addTask({
            title: t.title,
            description: t.description,
            date: t.date,
            time: t.time,
            priority: t.priority,
            category: t.category,
            color: t.color || '#6366f1',
            completed: false,
            recurring: t.recurring ?? { type: 'none' },
          })
        }
        return parsed.message || `✅ Added ${list.length} task(s).`
      }

      case 'delete_task': {
        const payload = parsed.deleteTask
        if (!payload) return "I couldn't tell which task to delete."
        const { task, ambiguous } = resolveTarget(tasks, payload.target, payload.date)
        if (ambiguous.length > 0) return formatAmbiguity(ambiguous)
        if (!task) return `I couldn't find a task matching "${payload.target}".`
        taskApi.deleteTask(task.id)
        return parsed.message || `🗑️ Deleted "${task.title}".`
      }

      case 'move_task': {
        const payload = parsed.moveTask
        if (!payload) return "I couldn't tell which task to move."
        const { task, ambiguous } = resolveTarget(tasks, payload.target, payload.date)
        if (ambiguous.length > 0) return formatAmbiguity(ambiguous)
        if (!task) return `I couldn't find a task matching "${payload.target}".`
        taskApi.moveTask(task.id, payload.newDate)
        if (payload.newTime) {
          taskApi.updateTask(task.id, { time: payload.newTime })
        }
        const dateLabel = format(new Date(payload.newDate + 'T00:00:00'), 'MMM d')
        return parsed.message || `📅 Moved "${task.title}" to ${dateLabel}${payload.newTime ? ` at ${payload.newTime}` : ''}.`
      }

      case 'update_task': {
        const payload = parsed.updateTask
        if (!payload) return "I couldn't tell which task to update."
        const { task, ambiguous } = resolveTarget(tasks, payload.target, payload.date)
        if (ambiguous.length > 0) return formatAmbiguity(ambiguous)
        if (!task) return `I couldn't find a task matching "${payload.target}".`

        const updates: Partial<Task> = {}
        if (payload.changes.title) updates.title = payload.changes.title
        if (payload.changes.description !== undefined) updates.description = payload.changes.description
        if (payload.changes.priority) updates.priority = payload.changes.priority
        if (payload.changes.category) updates.category = payload.changes.category
        if (payload.changes.color) updates.color = payload.changes.color
        if (payload.changes.time !== undefined) updates.time = payload.changes.time

        if (Object.keys(updates).length === 0) {
          return "I understood you want to update a task, but couldn't tell what to change."
        }

        taskApi.updateTask(task.id, updates)
        return parsed.message || `✏️ Updated "${task.title}".`
      }

      default:
        return parsed.message || "I'm not sure how to help with that. Try asking me to add, delete, move, or update a task."
    }
  }, [tasks, taskApi])

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AIMessage = {
      id: uuid(), role: 'user', content, timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    let assistantContent: string

    try {
      const apiKey = storage.getSettings().geminiApiKey
      if (!apiKey) throw new Error('No API key configured')

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const result = await model.generateContent(buildSystemPrompt(tasks) + '\n\nUser: ' + content)
      const rawText = result.response.text().trim()
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      const parsed: AIResponse = JSON.parse(cleaned)

      assistantContent = handleParsedResponse(parsed)
    } catch (err) {
      console.error('AI error:', err)
      assistantContent = storage.getSettings().geminiApiKey
        ? "Something went wrong processing that request. Could you rephrase it?"
        : "I need a Gemini API key configured to understand requests like this. Add VITE_GEMINI_API_KEY to your .env file."
    }

    pushAssistantMessage(assistantContent)
    setLoading(false)
  }, [tasks, handleParsedResponse, pushAssistantMessage])

  return { messages, sendMessage, loading }
}
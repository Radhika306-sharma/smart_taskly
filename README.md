# AI Calendar

A production-ready, AI-powered calendar application built with React, TypeScript, Tailwind CSS, and Vite. Add tasks naturally with an AI assistant powered by Google Gemini.

## Features

- **3 Calendar Views** – Month, Week, Day
- **Task Management** – Title, description, date, time, priority, category, color label
- **Recurring Tasks** – Daily, Weekdays, Weekly, Monthly, Custom interval
- **Drag & Drop** – Move tasks between dates
- **Checkbox Completion** – Mark tasks complete inline
- **AI Assistant** – Natural language task creation via Gemini API
- **Sidebar** – Today, Tomorrow, Upcoming, Overdue, Completed
- **Search & Filter** – By name, category, priority, status
- **Dark Mode** – Glassmorphism, premium UI
- **LocalStorage Persistence** – All data auto-saved

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/ai-calendar.git
cd ai-calendar
npm install
```

### 2. Environment Variables

Create a `.env` file:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free API key at: https://aistudio.google.com/app/apikey

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variable: `VITE_GEMINI_API_KEY`
4. Deploy ✅

## Fallback (no API key)

The AI assistant works offline with local natural language parsing. Gemini enhances responses when the key is set.

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- date-fns
- @google/generative-ai
- framer-motion
- lucide-react
- uuid

## Folder Structure

```
src/
  types/         # TypeScript interfaces
  hooks/         # useTasks, useCalendar, useAI
  utils/         # dateUtils, recurringUtils, storage
  components/
    layout/      # AppLayout, Header, Sidebar
    calendar/    # CalendarView, MonthView, WeekView, DayView, TaskChip
    tasks/       # TaskModal, TaskCard, SearchFilter
    ai/          # AIAssistant
```
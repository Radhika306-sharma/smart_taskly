import React, { useState, useRef, useEffect } from 'react'
import { AIMessage } from '../../types'
import { Bot, Send, X, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  messages: AIMessage[]
  sendMessage: (content: string) => Promise<void>
  loading: boolean
  onClose: () => void
}

const QUICK_PROMPTS = [
  'Add DSA practice tomorrow at 7 PM',
  'Schedule gym every weekday at 6 AM',
  'Add OS assignment next Friday',
  'Create a 30-day placement prep plan',
]

export default function AIAssistant({ messages, sendMessage, loading, onClose }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    const val = input.trim()
    if (!val || loading) return
    setInput('')
    void sendMessage(val)
  }

  const handleQuickPrompt = (prompt: string) => {
    void sendMessage(prompt)
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 glass flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">AI Assistant</p>
          <p className="text-xs text-gray-500">Powered by Gemini</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[90%] rounded-2xl px-4 py-3 text-sm
              ${msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'glass-light text-gray-200 rounded-bl-sm'
              }
            `}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={11} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">AI</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{msg.content}</p>
              <p className="text-xs opacity-40 mt-1.5 text-right">
                {format(new Date(msg.timestamp), 'h:mm a')}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-light rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="ai-thinking flex gap-1 items-center h-4">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-2 flex flex-col gap-1.5">
          <p className="text-xs text-gray-600 px-1">Quick prompts</p>
          {QUICK_PROMPTS.map(q => (
            <button
              key={q}
              onClick={() => handleQuickPrompt(q)}
              className="text-xs px-3 py-2 rounded-xl glass-light text-gray-300 hover:text-white border border-gray-700/50 hover:border-indigo-500/50 transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend() }}
            placeholder="Add a task, schedule event..."
            disabled={loading}
            className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
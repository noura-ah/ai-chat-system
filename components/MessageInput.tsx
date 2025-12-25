'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  mode: 'chat' | 'search'
}

export default function MessageInput({ onSend, isLoading, mode }: MessageInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to get accurate scrollHeight
      textarea.style.height = 'auto'
      // Calculate new height (min 1 row, max 3 rows)
      const lineHeight = 24 // Approximate line height in pixels
      const minHeight = lineHeight
      const maxHeight = lineHeight * 3
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const isSearchMode = mode === 'search'

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={
            isSearchMode ? 'Search the web...' : 'Type your message...'
          }
          rows={1}
          className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 overflow-y-auto"
          style={{ minHeight: '24px', maxHeight: '72px' }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}


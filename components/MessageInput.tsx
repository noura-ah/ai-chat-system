'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { Send, Loader2, Square } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isLoading: boolean
  mode: 'chat' | 'search'
  conversationId?: string
}

export default function MessageInput({ onSend, onStop, isLoading, mode, conversationId }: MessageInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previousConversationIdRef = useRef<string | undefined>(conversationId)

  // Auto-save input to localStorage when it changes (debounced)
  useEffect(() => {
    if (conversationId && input) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`conversation-input-${conversationId}`, input)
      }, 300) // Debounce saves by 300ms
      return () => clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]) // Only depend on input, not conversationId

  // Handle conversation changes: load new conversation's input
  useEffect(() => {
    const prevId = previousConversationIdRef.current
    const currentId = conversationId

    // If conversation changed
    if (prevId !== currentId) {
      // Load new conversation's input (previous conversation's input is already saved by auto-save)
      if (currentId) {
        const savedInput = localStorage.getItem(`conversation-input-${currentId}`)
        setInput(savedInput || '')
      } else {
        // New conversation, clear input
        setInput('')
      }

      previousConversationIdRef.current = currentId
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]) // Only depend on conversationId

  // Auto-resize textarea based on content (min 1 row, max 3 rows)
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to get accurate scrollHeight
      textarea.style.height = 'auto'
      // Use scrollHeight but respect min/max (already set in style attribute)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 72)
      textarea.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const handleSend = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent container click from firing
    }
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
      // Clear saved input for this conversation after sending
      if (conversationId) {
        localStorage.removeItem(`conversation-input-${conversationId}`)
      }
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

  const handleContainerClick = () => {
    // Focus textarea when clicking anywhere in the container
    textareaRef.current?.focus()
  }

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Ensure textarea is focused on click
    e.currentTarget.focus()
  }

  const isSearchMode = mode === 'search'

  return (
    <div className="dark:border-gray-700 pt-4">
      <div 
        onClick={handleContainerClick}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm cursor-text"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          onClick={handleTextareaClick}
          placeholder={
            isSearchMode ? 'Search the web...' : 'Type your message...'
          }
          rows={1}
          className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 overflow-y-auto"
          style={{ minHeight: '24px', maxHeight: '72px' }}
          disabled={isLoading}
        />
        {isLoading && onStop && mode === 'chat' ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStop()
            }}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Stop generating"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={(e) => handleSend(e)}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}


'use client'

import { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'
import SearchResults from './SearchResults'
import { Loader2 } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  mode?: 'chat' | 'search'
}

export default function MessageList({ messages, isLoading, mode }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to AI Chat System
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Start a conversation or search the web
          </p>
        </div>
      </div>
    )
  }

  // Only show loading indicator if:
  // 1. isLoading is true (message is being sent/processed)
  // 2. AND the last message is a user message (meaning we're waiting for first chunk, not streaming)
  // This prevents showing loading bubble when:
  // - Switching conversations (isLoadingMessages is separate, not passed here)
  // - Message is already streaming (last message is assistant with content)
  const lastMessage = messages[messages.length - 1]
  const shouldShowLoading = isLoading && lastMessage?.role === 'user'

  return (
    <div className="space-y-4 py-4">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageBubble message={message} />
          {(message.searchResults || message.images) && (
            <SearchResults
              results={message.searchResults}
              images={message.images}
            />
          )}
        </div>
      ))}
      {shouldShowLoading && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <div className="rounded-2xl px-4 py-3 max-w-[80%] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 dark:text-gray-500">
                  {mode === 'search' ? 'Searching the web' : 'Thinking'}
                </span>
                <div className="flex gap-1 mb-1 self-end">
                  <div className="w-[3px] h-[3px] bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-[3px] h-[3px] bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-[3px] h-[3px] bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


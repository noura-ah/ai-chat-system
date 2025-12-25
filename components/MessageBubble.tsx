'use client'

import { Message } from '@/types/chat'
import { User, Bot, Search } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSearchMode = message.mode === 'search'

  return (
    <div
      className={`flex gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : isSearchMode ? (
          <Search className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>
      <div
        className={`flex-1 ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-3 max-w-[80%] ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}


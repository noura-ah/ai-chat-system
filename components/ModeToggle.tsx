'use client'

import { Search, MessageSquare } from 'lucide-react'

interface ModeToggleProps {
  mode: 'chat' | 'search'
  onModeChange: (mode: 'chat' | 'search') => void
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onModeChange('chat')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          mode === 'chat'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden md:block sm:text-xs md:text-sm lg:text-base">Chat</span>
      </button>
      <button
        onClick={() => onModeChange('search')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          mode === 'search'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:block sm:text-xs md:text-sm lg:text-base">Search</span>
      </button>
    </div>
  )
}


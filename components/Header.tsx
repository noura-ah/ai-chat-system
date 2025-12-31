'use client'

import { useSession, signOut } from 'next-auth/react'
import { useCallback } from 'react'
import { Menu } from 'lucide-react'
import ModeToggle from './ModeToggle'
import UserProfile from './UserProfile'

interface HeaderProps {
  mode: 'chat' | 'search'
  onModeChange: (mode: 'chat' | 'search') => void
  onToggleSidebar: () => void
}

export default function Header({ mode, onModeChange, onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession()

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/auth/signin' })
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-stone-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 py-1 ">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center lg:gap-48 gap-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-stone-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-stone-600 dark:text-gray-400" />
            </button>
            <h1 className="text-sm flex flex-col lg:font-semibold md:text-base text-stone-900 dark:text-white">
              <span className="font-semibold">AI Chat</span>
              <span className="font-light">System</span>
            </h1>
            <ModeToggle mode={mode} onModeChange={onModeChange} />
          </div>
          <UserProfile session={session} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  )
}


'use client'

import { useSession, signOut } from 'next-auth/react'
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-sm lg:text-xl font-semibold text-gray-900 dark:text-white">
              AI Chat System
            </h1>
            <ModeToggle mode={mode} onModeChange={onModeChange} />
          </div>
          <UserProfile session={session} onLogout={() => signOut({ callbackUrl: '/auth/signin' })} />
        </div>
      </div>
    </header>
  )
}


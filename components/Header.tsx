'use client'

import { useSession, signOut } from 'next-auth/react'
import ModeToggle from './ModeToggle'
import UserProfile from './UserProfile'

interface HeaderProps {
  mode: 'chat' | 'search'
  onModeChange: (mode: 'chat' | 'search') => void
}

export default function Header({ mode, onModeChange }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
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


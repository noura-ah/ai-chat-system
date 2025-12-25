'use client'

import { Session } from 'next-auth'
import { LogOut } from 'lucide-react'

interface UserProfileProps {
  session: Session | null
  onLogout: () => void
}

export default function UserProfile({ session, onLogout }: UserProfileProps) {
  if (!session) return null

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            crossOrigin="anonymous"
          />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {session.user?.name || session.user?.email}
        </span>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  )
}


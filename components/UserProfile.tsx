'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Session } from 'next-auth'
import { LogOut, User } from 'lucide-react'

interface UserProfileProps {
  session: Session | null
  onLogout: () => void
}

export default function UserProfile({ session, onLogout }: UserProfileProps) {
  const [imageError, setImageError] = useState(false)

  if (!session) return null

  const userInitials = session.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || session.user?.email?.[0].toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {session.user?.image && !imageError ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full object-cover"
              onError={() => setImageError(true)}
              unoptimized={false}
              priority={false}
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-700 flex items-center justify-center text-white text-xs font-medium">
            {userInitials}
          </div>
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


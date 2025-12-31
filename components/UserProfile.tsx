'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { Session } from 'next-auth'
import { LogOut, User } from 'lucide-react'

interface UserProfileProps {
  session: Session | null
  onLogout: () => void
}

function UserProfile({ session, onLogout }: UserProfileProps) {
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
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-stone-200 dark:bg-gray-700">
            <Image
              key={session.user.image}
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
          <div className="w-8 h-8 rounded-full bg-stone-600 dark:bg-gray-700 flex items-center justify-center text-white text-xs font-medium">
            {userInitials}
          </div>
        )}
        <span className="text-sm text-stone-700 dark:text-gray-300 hidden md:block sm:text-xs md:text-sm lg:text-base">
          {session.user?.name || session.user?.email}
        </span>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden md:block sm:text-xs md:text-sm lg:text-base">Logout</span>
      </button>
    </div>
  )
}
export default memo(UserProfile)


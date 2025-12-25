'use client'

import { useSession } from 'next-auth/react'
import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'
import { useChatMode } from '@/hooks/useChatMode'

export default function ChatPage() {
  const { data: session } = useSession()
  const [mode, setMode] = useChatMode()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Header mode={mode} onModeChange={setMode} />
      <div className="pt-16 flex-1 flex flex-col min-h-0">
        <ChatInterface mode={mode} />
      </div>
    </div>
  )
}


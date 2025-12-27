'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'
import ConversationSidebar from '@/components/ConversationSidebar'
import { deriveModeFromMessages } from '@/lib/mode'
import { Message } from '@/types/chat'

export default function ChatPage() {
  const { data: session } = useSession()
  const [mode, setMode] = useState<'chat' | 'search'>('chat')
  const [intendedMode, setIntendedMode] = useState<'chat' | 'search'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(() => {
    // Initialize from localStorage immediately (before session check)
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('selectedConversationId')
      return savedId || undefined
    }
    return undefined
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const hasValidatedRef = useRef(false)

  // Validate conversation from localStorage when session is ready (only once)
  useEffect(() => {
    if (session?.user && !hasValidatedRef.current && typeof window !== 'undefined') {
      hasValidatedRef.current = true
      const savedId = localStorage.getItem('selectedConversationId')
      if (savedId) {
        // Validate that the conversation still exists
        fetch(`/api/conversations/${savedId}`)
          .then((res) => {
            if (!res.ok) {
              // Conversation doesn't exist, clear it
              setSelectedConversationId(undefined)
              localStorage.removeItem('selectedConversationId')
            }
          })
          .catch(() => {
            // Error validating, clear it
            setSelectedConversationId(undefined)
            localStorage.removeItem('selectedConversationId')
          })
      }
    }
  }, [session])

  // Compute mode from messages when messages change
  // But only if we have messages - otherwise use intended mode
  useEffect(() => {
    if (messages.length > 0) {
      const derivedMode = deriveModeFromMessages(messages)
      setMode(derivedMode)
      setIntendedMode(derivedMode) // Keep intended mode in sync
    } else {
      // No messages yet, use intended mode
      setMode(intendedMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]) // Only depend on messages to avoid loops

  // Persist conversation ID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedConversationId) {
        localStorage.setItem('selectedConversationId', selectedConversationId)
      } else {
        localStorage.removeItem('selectedConversationId')
      }
    }
  }, [selectedConversationId])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
  }

  const handleNewConversation = () => {
    setSelectedConversationId(undefined)
    setMessages([]) // Clear messages
    setIntendedMode('chat') // Reset to default mode
    setMode('chat')
  }

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleModeChange = (newMode: 'chat' | 'search') => {
    // Set intended mode for next message
    setIntendedMode(newMode)
    setMode(newMode)
  }

  const handleMessagesChange = (newMessages: Message[]) => {
    setMessages(newMessages)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Header 
        mode={mode} 
        onModeChange={handleModeChange}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="pt-16 flex-1 flex min-h-0">
        <ConversationSidebar
          currentConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          refreshTrigger={refreshTrigger}
        />
        <div className="flex-1 flex flex-col min-h-0 lg:ml-64 overflow-hidden">
          <ChatInterface 
            mode={mode}
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
            onMessagesChange={handleMessagesChange}
          />
        </div>
      </div>
    </div>
  )
}


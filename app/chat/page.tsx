'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'
import ConversationSidebar from '@/components/ConversationSidebar'
import { deriveModeFromMessages } from '@/lib/mode'
import { Message } from '@/types/chat'
import { useConversations } from '@/hooks/useConversations'

export default function ChatPage() {
  const { data: session } = useSession()
  const { conversations, isLoading: isLoadingConversations, addConversation, removeConversation } = useConversations()
  const [mode, setMode] = useState<'chat' | 'search'>('chat')
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
  const hasValidatedRef = useRef(false)

  // Validate conversation from localStorage against loaded conversations (only once after conversations load)
  useEffect(() => {
    // Only validate once, when session is ready and conversations have finished loading
    if (session?.user && !isLoadingConversations && !hasValidatedRef.current && typeof window !== 'undefined') {
      hasValidatedRef.current = true
      const savedId = localStorage.getItem('selectedConversationId')
      if (savedId) {
        // Check if the conversation exists in the loaded conversations list
        const conversationExists = conversations.some(conv => conv.id === savedId)
        if (!conversationExists) {
          // Conversation doesn't exist in the list, clear it
          setSelectedConversationId(undefined)
          localStorage.removeItem('selectedConversationId')
        }
      }
    }
  }, [session, conversations, isLoadingConversations])

  // Compute mode from messages when messages change
  // Only derive mode if we have messages AND a conversation selected
  useEffect(() => {
    if (messages.length > 0 && selectedConversationId) {
      const derivedMode = deriveModeFromMessages(messages)
      setMode(derivedMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedConversationId])

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
    // Clear messages first, then reset conversation and mode
    setMessages([])
    setSelectedConversationId(undefined)
    setMode('chat') // Reset to default mode
  }

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id)
  }

  const handleModeChange = (newMode: 'chat' | 'search') => {
    // Update mode immediately for UI and next message
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
          conversations={conversations}
          isLoading={isLoadingConversations}
          onRemoveConversation={removeConversation}
        />
        <div className="flex-1 flex flex-col min-h-0 lg:ml-64 overflow-hidden">
          <ChatInterface 
            mode={mode}
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
            onMessagesChange={handleMessagesChange}
            onAddConversation={addConversation}
          />
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useMessages } from '@/hooks/useMessages'
import { useMessageHandler } from '@/hooks/useMessageHandler'
import { useConversation } from '@/hooks/useConversation'
import { Message } from '@/types/chat'
import { Conversation } from '@/hooks/useConversations'

interface ChatInterfaceProps {
  mode: 'chat' | 'search'
  conversationId?: string
  onConversationCreated?: (id: string) => void
  onMessagesChange?: (messages: Message[]) => void
  onAddConversation: (conversation: Conversation) => void
}

export default function ChatInterface({ mode, conversationId, onConversationCreated, onMessagesChange, onAddConversation }: ChatInterfaceProps) {
  const { createNewConversation } = useConversation(mode)
  const { messages, addMessage, updateMessageById, setMessages, messagesEndRef, isLoading: isLoadingMessages } = useMessages(conversationId)
  
  // Notify parent when messages change
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages)
    }
  }, [messages, onMessagesChange])
  
  const { handleSendMessage, isLoading } = useMessageHandler({
    mode,
    messages,
    conversationId,
    onCreateConversation: async () => {
      const newId = await createNewConversation()
      if (newId && onConversationCreated) {
        onConversationCreated(newId)
      }
      return newId
    },
    addMessage,
    updateMessageById,
    onAddConversation,
  })

  // Reset when conversationId changes to undefined (new conversation requested)
  useEffect(() => {
    if (conversationId === undefined) {
      setMessages([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  return (
    <div className="flex-1 flex flex-col h-full w-full relative">
      {/* Page-level loading overlay when loading messages (navigating between conversations) */}
      {isLoadingMessages && (
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading conversation...</p>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl w-full mx-auto px-4 h-full">
          <MessageList messages={messages} isLoading={isLoading} mode={mode} />
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 py-6 w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl w-full mx-auto px-4">
          <MessageInput onSend={handleSendMessage} isLoading={isLoading} mode={mode} conversationId={conversationId} />
        </div>
      </div>
    </div>
  )
}


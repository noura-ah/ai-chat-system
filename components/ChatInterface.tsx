'use client'

import { useEffect, useRef } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useMessages } from '@/hooks/useMessages'
import { useMessageHandler } from '@/hooks/useMessageHandler'
import { useConversation } from '@/hooks/useConversation'
import { Message } from '@/types/chat'

interface ChatInterfaceProps {
  mode: 'chat' | 'search'
  conversationId?: string
  onConversationCreated?: (id: string) => void
  onMessagesChange?: (messages: Message[]) => void
}

export default function ChatInterface({ mode, conversationId: externalConversationId, onConversationCreated, onMessagesChange }: ChatInterfaceProps) {
  const { conversationId: internalConversationId, createNewConversation, resetConversation } = useConversation(mode, externalConversationId)
  const conversationId = externalConversationId || internalConversationId
  const { messages, addMessage, updateLastMessage, updateMessageById, setMessages, messagesEndRef, isLoading: isLoadingMessages } = useMessages(conversationId)
  const prevExternalConversationId = useRef<string | undefined>(externalConversationId)

  // Notify parent when messages change
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages)
    }
  }, [messages, onMessagesChange])

  // Create conversation handler that also notifies parent
  const handleCreateConversation = async () => {
    const newId = await createNewConversation()
    if (newId && onConversationCreated) {
      onConversationCreated(newId)
    }
    return newId
  }

  const { handleSendMessage, isLoading } = useMessageHandler({
    mode,
    messages,
    conversationId,
    onCreateConversation: handleCreateConversation,
    addMessage,
    updateLastMessage,
    updateMessageById,
  })

  // Reset when external conversationId changes to undefined (new conversation requested)
  useEffect(() => {
    if (prevExternalConversationId.current !== undefined && externalConversationId === undefined) {
      resetConversation()
      setMessages([])
    }
    prevExternalConversationId.current = externalConversationId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalConversationId])


  return (
    <div className="flex-1 flex flex-col h-full w-full">
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


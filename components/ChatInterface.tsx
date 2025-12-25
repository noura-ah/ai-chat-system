'use client'

import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useMessages } from '@/hooks/useMessages'
import { useMessageHandler } from '@/hooks/useMessageHandler'

interface ChatInterfaceProps {
  mode: 'chat' | 'search'
}

export default function ChatInterface({ mode }: ChatInterfaceProps) {
  const { messages, addMessage, updateLastMessage, messagesEndRef } = useMessages()
  const { handleSendMessage, isLoading } = useMessageHandler({
    mode,
    messages,
    addMessage,
    updateLastMessage,
  })

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 h-screen">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} mode={mode} />
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-shrink-0 py-6">
        <MessageInput onSend={handleSendMessage} isLoading={isLoading} mode={mode} />
      </div>
    </div>
  )
}


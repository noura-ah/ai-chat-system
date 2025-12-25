import { useState } from 'react'
import { Message } from '@/types/chat'
import { handleSearch } from './useSearchHandler'
import { handleChatStream, createAssistantMessage } from './useChatStreamHandler'

interface UseMessageHandlerProps {
  mode: 'chat' | 'search'
  messages: Message[]
  addMessage: (message: Message) => void
  updateLastMessage: (updater: (message: Message) => Message) => void
}

export function useMessageHandler({
  mode,
  messages,
  addMessage,
  updateLastMessage,
}: UseMessageHandlerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const createUserMessage = (content: string): Message => ({
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date(),
  })

  const createErrorMessage = (): Message => ({
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: 'Sorry, I encountered an error. Please try again.',
    timestamp: new Date(),
    mode,
  })

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage = createUserMessage(content)
    addMessage(userMessage)
    setIsLoading(true)

    try {
      if (mode === 'search') {
        const assistantMessage = await handleSearch(content)
        addMessage(assistantMessage)
      } else {
        // Create and add assistant message before streaming
        const assistantMessage = createAssistantMessage()
        addMessage(assistantMessage)

        // Stream the response and update the message
        await handleChatStream(content, messages, (chunk) => {
          updateLastMessage((msg) => ({
            ...msg,
            content: msg.content + chunk,
          }))
        })
      }
    } catch (error) {
      console.error('Error:', error)
      addMessage(createErrorMessage())
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSendMessage,
    isLoading,
  }
}


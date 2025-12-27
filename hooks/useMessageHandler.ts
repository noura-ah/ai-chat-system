import { useState } from 'react'
import { Message } from '@/types/chat'
import { handleSearch } from './useSearchHandler'
import { handleChatStream, createAssistantMessage } from './useChatStreamHandler'

interface UseMessageHandlerProps {
  mode: 'chat' | 'search'
  messages: Message[]
  conversationId?: string
  onCreateConversation: () => Promise<string | undefined>
  addMessage: (message: Message) => void
  updateLastMessage: (updater: (message: Message) => Message) => void
  updateMessageById: (id: string, updater: (message: Message) => Message) => void
}

export function useMessageHandler({
  mode,
  messages,
  conversationId,
  onCreateConversation,
  addMessage,
  updateLastMessage,
  updateMessageById,
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

  const saveMessage = async (message: Message, conversationIdToUse?: string) => {
    const id = conversationIdToUse || conversationId
    if (!id) return

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: id,
          role: message.role,
          content: message.content,
          mode: message.mode,
          searchResults: message.searchResults,
          images: message.images,
        }),
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Create conversation if it doesn't exist (only when user sends first message)
    let currentConversationId = conversationId
    if (!currentConversationId) {
      currentConversationId = await onCreateConversation()
      if (!currentConversationId) {
        console.error('Failed to create conversation')
        return
      }
    }

    const userMessage = createUserMessage(content)
    addMessage(userMessage)
    await saveMessage(userMessage, currentConversationId)
    setIsLoading(true)

    try {
      if (mode === 'search') {
        const assistantMessage = await handleSearch(content)
        addMessage(assistantMessage)
        await saveMessage(assistantMessage, currentConversationId)
      } else {
        // Create assistant message but don't add it yet
        const assistantMessage = createAssistantMessage()
        let assistantMessageAdded = false
        let finalContent = ''

        // Stream the response and add/update the message
        await handleChatStream(content, messages, (chunk) => {
          finalContent += chunk
          
          // Add the assistant message on first chunk to avoid empty bubble
          if (!assistantMessageAdded) {
            assistantMessageAdded = true
            addMessage({
              ...assistantMessage,
              content: chunk,
            })
          } else {
            // Update the specific assistant message by ID to avoid race conditions
            updateMessageById(assistantMessage.id, (msg) => ({
              ...msg,
              content: msg.content + chunk,
            }))
          }
        })

        // If no chunks were received, add empty message or error
        if (!assistantMessageAdded) {
          addMessage({
            ...assistantMessage,
            content: 'No response received.',
          })
        }

        // Save the final assistant message after streaming completes
        if (finalContent) {
          const finalMessage: Message = {
            ...assistantMessage,
            content: finalContent,
          }
          await saveMessage(finalMessage, currentConversationId)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = createErrorMessage()
      addMessage(errorMessage)
      await saveMessage(errorMessage, currentConversationId)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSendMessage,
    isLoading,
  }
}


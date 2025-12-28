import { useState } from 'react'
import { Message } from '@/types/chat'
import { handleSearch } from './useSearchHandler'
import { handleChatStream, createAssistantMessage } from './useChatStreamHandler'
import { Conversation } from './useConversations'
import { messagesApi } from '@/lib/api'

interface UseMessageHandlerProps {
  mode: 'chat' | 'search'
  messages: Message[]
  conversationId?: string
  onCreateConversation: () => Promise<string | undefined>
  addMessage: (message: Message) => void
  updateMessageById: (id: string, updater: (message: Message) => Message) => void
  onAddConversation: (conversation: Conversation) => void
}

export function useMessageHandler({
  mode,
  messages,
  conversationId,
  onCreateConversation,
  addMessage,
  updateMessageById,
  onAddConversation,
}: UseMessageHandlerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const createUserMessage = (content: string): Message => ({
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date(),
    mode,
  })

  const createErrorMessage = (): Message => ({
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: 'Sorry, I encountered an error. Please try again.',
    timestamp: new Date(),
    mode,
  })

  const saveMessage = async (message: Message, conversationIdToUse?: string) => {
    const conversationIdToSave = conversationIdToUse || conversationId
    if (!conversationIdToSave) return

    try {
      await messagesApi.save({
        conversationId: conversationIdToSave, // This is the conversation ID, not the message ID
        role: message.role,
        content: message.content,
        mode: message.mode,
        searchResults: message.searchResults,
        images: message.images,
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage = createUserMessage(content)
    const historyWithUser = [...messages, userMessage]
    addMessage(userMessage)
    setIsLoading(true)

    let currentConversationId = conversationId
    
    try {
      if (!currentConversationId) {
        currentConversationId = await onCreateConversation()
        if (!currentConversationId) {
          throw new Error('Failed to create conversation')
        }
        
        // Add conversation to sidebar immediately when user submits first message
        const conversation: Conversation = {
          id: currentConversationId,
          title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          mode: mode,
          updatedAt: new Date().toISOString(),
          messages: [{
            id: userMessage.id,
            content: content,
          }],
        }
        onAddConversation(conversation)
      }

      // Save message in background (don't wait for it)
      saveMessage(userMessage, currentConversationId)

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
        await handleChatStream(content, historyWithUser, (chunk) => {
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


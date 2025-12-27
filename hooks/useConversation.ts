import { useState, useEffect, useCallback } from 'react'

export function useConversation(mode: 'chat' | 'search', initialId?: string) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialId)

  useEffect(() => {
    setConversationId(initialId)
  }, [initialId])

  const createNewConversation = async (): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      if (response.ok) {
        const data = await response.json()
        const newId = data.conversation.id
        setConversationId(newId)
        return newId
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
    return undefined
  }

  const resetConversation = useCallback(() => {
    setConversationId(undefined)
  }, [])

  return {
    conversationId,
    createNewConversation,
    resetConversation,
  }
}


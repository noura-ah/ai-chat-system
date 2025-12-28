import { useState, useEffect, useCallback, useRef } from 'react'

export interface Conversation {
  id: string
  title: string | null
  mode?: string
  updatedAt: string
  messages: Array<{ id: string; content: string }>
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isSyncingRef = useRef(false)

  // Initial fetch - only once
  useEffect(() => {
    if (conversations.length === 0) {
      loadConversations()
    }
  }, [])

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Background sync (silent, doesn't show loading state) - only when adding new conversation
  // Merges synced conversations with optimistic ones, preserving optimistic titles
  const syncConversations = useCallback(async () => {
    if (isSyncingRef.current) return // Prevent concurrent syncs
    isSyncingRef.current = true
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations((prev) => {
          const synced = data.conversations || []
          // Create a map of synced conversations by ID
          const syncedMap = new Map(synced.map((conv: Conversation) => [conv.id, conv]))
          
          // Merge: use synced data, but preserve optimistic titles if synced title is null/empty
          return synced.map((syncedConv: Conversation) => {
            const optimistic = prev.find((c) => c.id === syncedConv.id)
            // If we have an optimistic version with a title and synced doesn't, keep optimistic title
            if (optimistic && optimistic.title && (!syncedConv.title || syncedConv.title === 'New Conversation')) {
              return { ...syncedConv, title: optimistic.title }
            }
            return syncedConv
          })
        })
      }
    } catch (error) {
      console.error('Error syncing conversations:', error)
    } finally {
      isSyncingRef.current = false
    }
  }, [])

  // Optimistically add a new conversation
  const addConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev])
    // Sync in background after a short delay to allow API to set the title
    setTimeout(() => {
      syncConversations()
    }, 500)
  }, [syncConversations])

  // Optimistically update a conversation (e.g., when title changes)
  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, ...updates } : conv))
    )
  }, [])

  // Optimistically remove a conversation
  const removeConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
  }, [])

  // Force refresh (for manual refresh if needed)
  const refresh = useCallback(() => {
    loadConversations()
  }, [])

  return {
    conversations,
    isLoading,
    addConversation,
    updateConversation,
    removeConversation,
    refresh,
  }
}


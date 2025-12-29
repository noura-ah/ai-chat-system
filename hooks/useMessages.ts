import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/chat'
import { conversationsApi } from '@/lib/api'

interface UseMessagesProps {
  conversationId?: string
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export function useMessages({ conversationId, messages, setMessages }: UseMessagesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastConversationIdRef = useRef<string | undefined>(undefined)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Scroll when messages change or loading starts
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      // Use 'auto' during streaming for smoother updates, 'smooth' otherwise
      const behavior = isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' 
        ? 'auto' 
        : 'smooth'
      const timer = setTimeout(() => {
        scrollToBottom(behavior)
      }, isLoading ? 50 : 0)
      return () => clearTimeout(timer)
    }
  }, [isLoading, messages])

  // Load messages from database if conversationId is provided
  useEffect(() => {
    if (!conversationId) {
      // Clear messages when conversationId becomes undefined
      if (lastConversationIdRef.current !== undefined) {
        setMessages([])
        lastConversationIdRef.current = undefined
      }
      return
    }
    
    // Only load if conversationId changed to a different conversation
    if (conversationId !== lastConversationIdRef.current) {
      const previousId = lastConversationIdRef.current
      lastConversationIdRef.current = conversationId
      
      // If switching from undefined to a conversation (new conversation just created)
      // and we already have messages, don't load (preserve local messages)
      // Otherwise, clear and load (switching between existing conversations)
      if (previousId === undefined && messages.length > 0) {
        // Don't load - we just created this conversation and have local messages
        return
      }
      
      // Clear and load for existing conversations
      setMessages([])
      loadMessages(conversationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]) // Only depend on conversationId to avoid re-running when messages change

  const loadMessages = async (id: string) => {
    setIsLoading(true)
    try {
      const data = await conversationsApi.getById(id)
      const loadedMessages: Message[] = data.conversation.messages.map((msg: any) => ({
        id: msg.id,
        conversationId: id, // Use the conversationId from the function parameter
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        mode: msg.mode as 'chat' | 'search' | undefined,
        searchResults: msg.searchResults?.map((r: any) => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
        })),
        images: msg.images?.map((img: any) => ({
          url: img.url,
          title: img.title || undefined,
        })),
      }))
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const updateMessageById = (id: string, updater: (message: Message) => Message) => {
    setMessages((prev) => {
      const index = prev.findIndex((msg) => msg.id === id)
      if (index === -1) return prev
      const updated = [...prev]
      updated[index] = updater(updated[index])
      return updated
    })
  }

  return {
    addMessage,
    updateMessageById,
    messagesEndRef,
    isLoading,
  }
}


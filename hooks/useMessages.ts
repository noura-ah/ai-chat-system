import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/chat'

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  }, [isLoading])

  // Load messages from database if conversationId is provided
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId])

  const loadMessages = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (response.ok) {
        const data = await response.json()
        const loadedMessages: Message[] = data.conversation.messages.map((msg: any) => ({
          id: msg.id,
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
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const updateLastMessage = (updater: (message: Message) => Message) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const updated = [...prev]
      const lastMessage = updated[updated.length - 1]
      if (lastMessage) {
        updated[updated.length - 1] = updater(lastMessage)
      }
      return updated
    })
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
    messages,
    addMessage,
    updateLastMessage,
    updateMessageById,
    setMessages,
    messagesEndRef,
    isLoading,
  }
}


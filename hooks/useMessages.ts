import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/chat'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const updateLastMessage = (updater: (message: Message) => Message) => {
    setMessages((prev) => {
      const updated = [...prev]
      const lastMessage = updated[updated.length - 1]
      if (lastMessage) {
        updated[updated.length - 1] = updater(lastMessage)
      }
      return updated
    })
  }

  return {
    messages,
    addMessage,
    updateLastMessage,
    messagesEndRef,
  }
}


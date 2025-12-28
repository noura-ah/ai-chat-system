import { Message } from '@/types/chat'
import { Conversation } from '@/hooks/useConversations'

// Base fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

// Conversations API
export const conversationsApi = {
  // Get all conversations
  async getAll(): Promise<{ conversations: Conversation[] }> {
    return apiFetch<{ conversations: Conversation[] }>('/api/conversations')
  },

  // Get a specific conversation with messages
  async getById(id: string): Promise<{ conversation: Conversation & { messages: Message[] } }> {
    return apiFetch<{ conversation: Conversation & { messages: Message[] } }>(`/api/conversations/${id}`)
  },

  // Create a new conversation
  async create(mode: 'chat' | 'search'): Promise<{ conversation: Conversation }> {
    return apiFetch<{ conversation: Conversation }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    })
  },

  // Delete a conversation
  async delete(id: string): Promise<void> {
    await apiFetch(`/api/conversations/${id}`, {
      method: 'DELETE',
    })
  },
}

// Messages API
export const messagesApi = {
  // Save a message to the database
  // Note: conversationId is required to identify which conversation the message belongs to
  async save(message: Omit<Message, 'id' | 'timestamp'> & { conversationId: string }): Promise<{ message: Message }> {
    return apiFetch<{ message: Message }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    })
  },
}

// Chat API (for streaming)
// Note: Returns Response directly for streaming, not JSON
export const chatApi = {
  // Send a chat message and get streaming response
  async stream(
    message: string,
    history: Array<{ role: string; content: string }>,
    abortSignal?: AbortSignal
  ): Promise<Response> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
      signal: abortSignal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Chat API error: ${response.status} ${errorText}`)
    }

    return response
  },
}

// Search API
export const searchApi = {
  // Perform a web search
  async search(query: string): Promise<{
    results: Array<{ title: string; link: string; snippet: string }>
    images: Array<{ url: string; title?: string }>
    summary: string
  }> {
    return apiFetch<{
      results: Array<{ title: string; link: string; snippet: string }>
      images: Array<{ url: string; title?: string }>
      summary: string
    }>('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  },
}


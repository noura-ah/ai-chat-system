export interface Message {
  id: string
  conversationId?: string // Optional: present when message belongs to a conversation
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  searchResults?: SearchResult[]
  images?: Array<{ url: string; title?: string }>
  mode?: 'chat' | 'search'
}

export interface SearchResult {
  title: string
  link: string
  snippet: string
}


import { Message } from '@/types/chat'

interface SearchResponse {
  results?: Array<{ title: string; link: string; snippet: string }>
  images?: Array<{ url: string; title?: string }>
  summary?: string
}

export async function handleSearch(
  query: string
): Promise<Message> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error('Search failed')
  }

  const data: SearchResponse = await response.json()

  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: data.summary || 'Search completed',
    timestamp: new Date(),
    searchResults: data.results,
    images: data.images,
    mode: 'search',
  }
}


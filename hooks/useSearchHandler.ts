import { Message } from '@/types/chat'
import { searchApi } from '@/lib/api'

export async function handleSearch(
  query: string
): Promise<Message> {
  const data = await searchApi.search(query)

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


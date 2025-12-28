import { Message } from '@/types/chat'
import { chatApi } from '@/lib/api'

export function createAssistantMessage(): Message {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    mode: 'chat',
  }
}

export async function handleChatStream(
  message: string,
  history: Message[],
  onChunk: (content: string) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  // Convert Message[] to format expected by API
  const historyForApi = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  const response = await chatApi.stream(message, historyForApi, abortSignal)

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No response body')
  }

  try {
    while (true) {
      // Check if aborted
      if (abortSignal?.aborted) {
        break
      }

      const { done, value } = await reader.read()
      if (done) break

      // Check again after read
      if (abortSignal?.aborted) {
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}


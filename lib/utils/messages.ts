type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }
type HistoryMessage = { role: string; content: string }

export const SYSTEM_MESSAGE = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
export const CONTINUATION_PROMPT = 'Please continue from where you left off.'
export const CHAT_TEMPERATURE = 0.5
export const MAX_CONTINUATIONS = 3

/**
 * Build messages array from history for chat completion
 */
export function buildMessages(history?: HistoryMessage[]): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: SYSTEM_MESSAGE,
    },
  ]

  // Add conversation history (which already includes the current user message)
  if (Array.isArray(history)) {
    history.forEach((msg) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })
      }
    })
  }

  return messages
}

/**
 * Build continuation messages with accumulated content
 */
export function buildContinuationMessages(
  messages: ChatMessage[],
  accumulatedContent: string
): ChatMessage[] {
  const continuationMessages = [...messages]
  
  // Find the last assistant message index (if any)
  let lastAssistantIndex = -1
  for (let i = continuationMessages.length - 1; i >= 0; i--) {
    if (continuationMessages[i].role === 'assistant') {
      lastAssistantIndex = i
      break
    }
  }
  
  if (lastAssistantIndex >= 0) {
    // Update existing assistant message with accumulated content
    continuationMessages[lastAssistantIndex].content = accumulatedContent
  } else {
    // If no assistant message exists, add one with accumulated content
    continuationMessages.push({
      role: 'assistant',
      content: accumulatedContent,
    })
  }
  
  // Add continuation prompt
  continuationMessages.push({
    role: 'user',
    content: CONTINUATION_PROMPT,
  })

  return continuationMessages
}


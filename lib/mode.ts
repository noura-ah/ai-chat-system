import { Message } from '@/types/chat'

/**
 * Derive the mode from messages
 * Uses the mode from the most recent message, or defaults to 'chat'
 */
export function deriveModeFromMessages(messages: Message[]): 'chat' | 'search' {
  if (messages.length === 0) {
    return 'chat'
  }

  // Get the mode from the most recent message
  // Check from the end backwards to find the first message with a mode
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message.mode === 'chat' || message.mode === 'search') {
      return message.mode
    }
  }

  // Default to chat if no mode found
  return 'chat'
}


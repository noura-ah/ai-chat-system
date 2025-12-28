import { conversationsApi } from '@/lib/api'

export function useConversation(mode: 'chat' | 'search') {
  const createNewConversation = async (): Promise<string | undefined> => {
    try {
      const data = await conversationsApi.create(mode)
      // Don't add to list here - will be added when first message is submitted
      return data.conversation.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      return undefined
    }
  }

  return {
    createNewConversation,
  }
}


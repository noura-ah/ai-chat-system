export function useConversation(mode: 'chat' | 'search') {
  const createNewConversation = async (): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      if (response.ok) {
        const data = await response.json()
        const newId = data.conversation.id
        // Don't add to list here - will be added when first message is submitted
        return newId
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
    return undefined
  }

  return {
    createNewConversation,
  }
}

